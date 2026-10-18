#!/usr/bin/env python3
"""Gera a inicial de contrato MIGRADO (consignado INSS) a partir de um JSON de caso.

Uso:
    python gerar_inicial.py casos/ercilia_novo_banco_continental.json [-m modelo_migrado.docx] [-o saida.docx]

- Parte do modelo Word do escritório (tools/modelo_migrado.docx) e preserva a formatação.
- Todo campo ausente/vazio no JSON vira marcador EM VERMELHO ("A PREENCHER"). Nunca inventa.
- contrato.status = "ativo"  -> troca a seção "Motivo da Exclusão" por tutela de urgência + exclusão da averbação.
- contrato.status = "excluido" -> mantém a seção "Motivo da Exclusão" do modelo.
- Cada parágrafo do modelo é localizado por TEXTO (âncora), não por posição; se o modelo mudar, o script avisa.
- Só usa a biblioteca padrão do Python.
"""
import argparse, json, re, sys, zipfile, datetime as dt
from pathlib import Path
from xml.sax.saxutils import escape

HERE = Path(__file__).parent
RED = 'FF0000'
MODEL_LEFTOVERS = ['Manaus', 'Santander', 'Olé', 'invalidez', 'incapaz para', '854271230', '4.743',
                   '134.629', '129.327', 'Rodolfo', 'JOSÉ RIBAMAR', '202603280838402', '23.008', '46.016', '86.016']

# ------------------------------------------------------------------ utilidades
def brl(v):
    return 'R$ ' + f'{v:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')

def red(v, label):
    """Valor do JSON ou marcador vermelho."""
    if v in (None, '', []):
        return f'[[{label} – A PREENCHER]]'
    return str(v)

def add_months(d, m):
    y, mo = divmod(d.month - 1 + m, 12)
    return d.replace(year=d.year + y, month=mo + 1)

def parcelas_estimadas(primeiro_desconto, data_extrato):
    if not (primeiro_desconto and data_extrato):
        return None
    a, b = dt.date.fromisoformat(primeiro_desconto), dt.date.fromisoformat(data_extrato)
    n = 0
    while add_months(a, n) <= b:
        n += 1
    return n

def dmy(iso):
    return dt.date.fromisoformat(iso).strftime('%d/%m/%Y') if iso else ''

# ------------------------------------------------------------------ XML
def ptext(p):
    return ''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', p))

def base_rpr(p):
    for r in re.findall(r'<w:r[ >].*?</w:r>', p, flags=re.S):
        if '<w:t' in r:
            m = re.search(r'<w:rPr>(.*?)</w:rPr>', r, flags=re.S)
            return m.group(1) if m else ''
    return ''

def mk_runs(markup, base, boldall=False):
    base = re.sub(r'<w:b w:val="1"/>|<w:bCs w:val="1"/>|<w:rtl w:val="0"/>', '', base)
    cm = re.search(r'<w:color [^>]*/>', base)
    basecolor = cm.group(0) if cm else ''
    rest = re.sub(r'<w:color [^>]*/>', '', base)
    out = ''
    for part in re.split(r'(\*\*.*?\*\*|\[\[.*?\]\])', markup):
        if not part:
            continue
        b = r = False
        if part.startswith('**'):
            part, b = part[2:-2], True
        elif part.startswith('[['):
            part, r = part[2:-2], True
        pre = '<w:b w:val="1"/><w:bCs w:val="1"/>' if (b or boldall) else ''
        pre += f'<w:color w:val="{RED}"/>' if r else basecolor
        out += f'<w:r><w:rPr>{pre}{rest}</w:rPr><w:t xml:space="preserve">{escape(part)}</w:t></w:r>'
    return out

class Doc:
    def __init__(self, xml):
        self.x = xml
        bs = xml.index('<w:body>')
        self.sp = [(m.start(), m.end()) for m in re.finditer(r'<w:p [^>]*>.*?</w:p>', xml, flags=re.S) if m.start() > bs]
        self.orig = [xml[a:b] for a, b in self.sp]
        self.txt = [ptext(p) for p in self.orig]
        self.edits, self.inserts, self.cuts = {}, {}, []
        self.warn = []

    def find(self, prefix, nth=0):
        hits = [i for i, t in enumerate(self.txt) if t.startswith(prefix)]
        if len(hits) <= nth:
            self.warn.append(f'ÂNCORA NÃO ENCONTRADA: "{prefix[:60]}"')
            return None
        return hits[nth]

    def _build(self, i, markup, boldall):
        p = self.orig[i]
        ppr = re.search(r'<w:pPr>.*?</w:pPr>', p, flags=re.S).group(0)
        return ppr, mk_runs(markup, base_rpr(p), boldall), re.match(r'<w:p [^>]*>', p).group(0)

    def setp(self, i, markup, boldall=False):
        if i is None:
            return
        ppr, runs, head = self._build(i, markup, boldall)
        self.edits[i] = head + ppr + runs + '</w:p>'

    def rep(self, prefix, markup, boldall=False, nth=0):
        self.setp(self.find(prefix, nth), markup, boldall)

    def newp(self, like, markup):
        ppr, runs, _ = self._build(like, markup, False)
        return '<w:p>' + ppr + runs + '</w:p>'

    def insert_after(self, i, xml):
        if i is not None:
            self.inserts[i] = self.inserts.get(i, '') + xml

    def cut(self, first, last):
        if first is not None and last is not None:
            self.cuts.append((first, last))

    def render(self):
        res, last, i = '', 0, 0
        cutmap = {a: b for a, b in self.cuts}
        skip = set()
        for a, b in self.cuts:
            skip.update(range(a + 1, b + 1))
        for i, (a, b) in enumerate(self.sp):
            if i in skip:
                continue
            if i in cutmap:
                res += self.x[last:a]
                last = self.sp[cutmap[i]][1]
                continue
            if i in self.edits or i in self.inserts:
                res += self.x[last:a] + self.edits.get(i, self.orig[i]) + self.inserts.get(i, '')
                last = b
        return res + self.x[last:]

# ------------------------------------------------------------------ conteúdo
def montar(doc, c):
    cl, be, bk, ct = c['cliente'], c['beneficio'], c['banco'], c['contrato']
    ativo = ct.get('status', 'ativo').lower().startswith('ativ')
    ced = ct.get('cedente', {})
    num = ct['numero']
    parcela = float(ct['valor_parcela'])

    # ---- números
    n_desc = ct.get('parcelas_descontadas')
    est = False
    if n_desc in (None, ''):
        n_desc, est = parcelas_estimadas(ct.get('primeiro_desconto'), ct.get('data_extrato')), True
    # regra do escritório: contrato incluído e excluído antes do 1º desconto -> afirmar ao menos 1 desconto
    sem_desc = (not ativo) and (ct.get('excluido_antes_primeiro_desconto') or not n_desc)
    if sem_desc:
        n_desc, est = max(n_desc or 0, 1), True
        ct['excluido_antes_primeiro_desconto'] = True
    tem_n = n_desc is not None
    total = round(n_desc * parcela, 2) if tem_n else None
    dobro = round(total * 2, 2) if tem_n else None
    dano = float(ct.get('dano_moral', 40000))
    causa = round((dobro or 0) + dano, 2)
    conf = ' (estimativa: %s parcelas – A CONFIRMAR)' % n_desc if est else ' (A CONFIRMAR)'
    R_total = f'[[{brl(total)}{conf}]]' if tem_n else '[[valor total descontado – A PREENCHER]]'
    R_dobro = f'[[{brl(dobro)} (A CONFIRMAR)]]' if tem_n else '[[dobro do indébito – A PREENCHER]]'
    R_causa = f'[[{brl(causa)} (A CONFIRMAR)]]' if tem_n else '[[valor da causa – A PREENCHER]]'

    banco_nome = bk['razao_social']
    banco_fant = f" ({bk['fantasia'].upper()})" if bk.get('fantasia') else ''
    cod_banco = bk.get('codigo', '')
    base_calc = brl(float(be['base_calculo'])) if be.get('base_calculo') else '[[base de cálculo – A PREENCHER]]'
    idade_txt = f"[[{cl.get('idade') or '___'} anos de idade, nascida em {dmy(cl.get('nascimento')) or '__/__/____'} – A PREENCHER]]" \
        if not (cl.get('idade') and cl.get('nascimento')) else f"{cl['idade']} anos de idade, nascida em {dmy(cl['nascimento'])}"
    sm = ' (equivalente a um salário mínimo)' if be.get('igual_salario_minimo') else ''
    pago_em = f", pago em conta corrente mantida no {be['banco_pagador'].rstrip('.')}" if be.get('banco_pagador') else ''

    # ---- cabeçalho / partes
    # foro: migrado e revisão de juros -> JEC só na Bahia; consignado ativo/encerrado (não migrado) -> sempre Vara Cível
    tipo = c.get('tipo_acao', 'migrado')
    uf = (cl.get('uf') or '').upper()
    jec = tipo in ('migrado', 'revisao_juros') and uf == 'BA'
    if not uf:
        doc.warn.append('cliente.uf ausente: não dá para definir JEC (BA) x Vara Cível; usando Vara Cível.')
    comarca = cl['comarca'] if cl.get('comarca') else '[[____________ (COMARCA/UF – A DEFINIR)]]'
    if jec:
        doc.rep('AO JUÍZO DE DIREITO', 'AO JUÍZO DO ' + (cl.get('vara') or '___º JUIZADO ESPECIAL CÍVEL') + ' DA COMARCA DE ' + comarca, boldall=True)
        if causa > 40 * float(c.get('salario_minimo', 1621)):
            doc.warn.append('Valor da causa acima de 40 salários mínimos: incompatível com o Juizado Especial; avaliar Vara Cível.')
        doc.warn.append('Rito do JEC: revisar o texto do modelo (prova pericial, gratuidade/custas, honorários, Lei 9.099/95).')
    else:
        doc.rep('AO JUÍZO DE DIREITO', 'AO JUÍZO DE DIREITO DA ' + (cl.get('vara') or '___ª VARA CÍVEL') + ' DA COMARCA DE ' + comarca, boldall=True)
    doc.rep('JOSÉ RIBAMAR', f"**{cl['nome'].upper()}**, "
            + (cl['qualificacao'] if cl.get('qualificacao') else '[[nacionalidade, estado civil e profissão – A PREENCHER]]')
            + f", beneficiária do INSS (NB {be['nb']}), inscrita no CPF " + red(cl.get('cpf'), '___.___.___-__')
            + ', residente e domiciliada ' + red(cl.get('endereco'), 'endereço completo com CEP') + ', '
            + (cl['email'] if cl.get('email') else '[[e-mail: A CONFIRMAR / sem endereço eletrônico]]')
            + ', por seus advogados ao final assinados, conforme instrumento de mandato anexo, com escritório profissional constante na '
              'procuração, notificações e intimações processuais, vem, respeitosamente, perante este Juízo, ajuizar a presente')
    doc.rep('em face de BANCO SANTANDER',
            f"em face de **{banco_nome.upper()}{banco_fant}**, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº {bk['cnpj']}, "
            f"com sede na {bk['endereco']}, e-mail para intimações " + (bk['email_intimacoes'] if bk.get('email_intimacoes') else 'desconhecido')
            + ', pelos fundamentos de fato e de direito a seguir expostos.')

    # ---- fatos
    doc.rep('A parte autora, cidadã brasileira', f"A parte autora, cidadã brasileira com {idade_txt}, é beneficiária do Instituto Nacional do Seguro Social sob o NB {be['nb']}, "
            f"titular de **{be['especie']}**, com base de cálculo de {base_calc}{', valor equivalente a um único salário mínimo' if be.get('igual_salario_minimo') else ''}.")
    doc.rep('A condição de hipervulnerabilidade', 'A condição de hipervulnerabilidade da demandante decorre da **idade avançada**, que atrai a proteção integral do artigo 230 da '
            'Constituição Federal e do Estatuto da Pessoa Idosa, somada à circunstância de depender, de modo absoluto, de um único e exíguo benefício previdenciário'
            + sm + pago_em + '.')
    doc.rep('Ao longo de toda a sua trajetória', 'Ao longo de toda a sua trajetória, a parte promovente pautou-se por estrita parcimônia orçamentária, realizando ínfimas transações em '
            'ambiente digital, cujas barreiras tecnológicas e operacionais lhe são substancialmente inacessíveis em razão da idade e da reduzida familiaridade com ferramentas informáticas.')
    ext = f" (HISCON emitido em {dmy(ct['data_extrato'])})" if ct.get('data_extrato') else ''
    ced_txt = ''
    if ced.get('nome'):
        ced_txt = (f", indicando que a averbação foi originariamente lançada por **{ced['nome'].upper()}** (CBC {ced.get('codigo', '___')})"
                   + (f" em {dmy(ced['data_averbacao'])}" if ced.get('data_averbacao') else '')
                   + (f", excluída em {dmy(ced['data_exclusao'])} sob a anotação “{ced.get('motivo_exclusao', 'Exclusão por troca de titularidade')}”" if ced.get('data_exclusao') else '')
                   + ' e posteriormente transferida à ré')
    situacao = ', que a mantém **ativa** e em desconto sobre o benefício:' if ativo else ':'
    doc.rep('O próprio extrato oficial', f'O próprio extrato oficial{ext} documenta a irregularidade de forma inequívoca, porquanto o campo **“Origem da Averbação”** registra, para o contrato adiante '
            f'identificado, a anotação **“Migrado do contrato”**, seguida do número do contrato de origem ({num}) e do código do banco cedente (CBC {ced.get("codigo", "___")}){ced_txt}{situacao}')
    # tabela do contrato (linha de valores)
    t0 = doc.find('854271230-5')
    if t0 is not None:
        vals = [num, dmy(ct.get('data_averbacao')) or '[[data – A PREENCHER]]', ct.get('inicio', ''), ct.get('fim', ''), brl(parcela), str(ct.get('parcelas', '')),
                R_total, R_dobro]
        for k, v in enumerate(vals):
            doc.setp(t0 + k, v)
    # observação sobre valor liberado (só se o JSON sinalizar)
    if ct.get('valor_pago') is not None and ct.get('valor_emprestado') is not None:
        iof = float(ct.get('iof', 0))
        lib = round(float(ct['valor_emprestado']) - iof - float(ct['valor_pago']), 2)
        if abs(lib) < 0.01:
            doc.insert_after(doc.find('Reitera-se: a parte autora jamais'), doc.newp(doc.find('Reitera-se: a parte autora jamais'),
                f"[[CONFIRMAR NO HISCON ANTES DE PROTOCOLAR: o extrato registra, para o contrato {num}, valor emprestado de {brl(float(ct['valor_emprestado']))}, "
                f"IOF de {brl(iof)} e “valor pago a título de dívida do cliente (refinanciamento e portabilidade)” de {brl(float(ct['valor_pago']))}, sem indicar valor liberado à titular. "
                f"Se confirmado, acrescentar que nenhum valor foi creditado à autora.]]"))
    if not ct.get('contato_com_banco_comprovado'):
        i = doc.find('Diante da irregularidade, a parte demandante buscou')
        if i is not None:
            doc.setp(i, '[[CONFIRMAR COM A CLIENTE – NÃO CONSTA NA PASTA: ' + doc.txt[i] + ']]')
    doc.rep('O que se verifica, portanto', 'O que se verifica, portanto, não é mera irregularidade contratual, e sim a imposição unilateral de obrigação sobre verba alimentar de pessoa idosa, '
            'perpetrada sob o manto da modernização tecnológica e da aparência de regularidade burocrática.')
    unica = '' if be.get('unica_renda_confirmada') else ' [[(CONFIRMAR COM A CLIENTE)]]'
    doc.rep('O benefício previdenciário que a demandante percebe', 'O benefício previdenciário que a demandante percebe, no valor de '
            + ('um salário mínimo (base de cálculo de ' + base_calc + ')' if be.get('igual_salario_minimo') else base_calc) + f', representa{unica} a integralidade de sua renda e o único vínculo '
            'entre ela e a mera possibilidade de subsistência: recurso escasso, minuciosamente gerido, fruto de uma lógica permanente de contenção e renúncia.')
    doc.rep('É exatamente essa estrutura frágil', 'É exatamente essa estrutura frágil que é desfeita pela conduta da instituição financeira ré. Os descontos fundados em operação jamais autorizada '
            'promovem erosão ilegítima do mínimo existencial, resultando em restrição dos recursos destinados à alimentação adequada e aos cuidados de saúde e em desestruturação do equilíbrio psicoemocional da unidade doméstica.')
    doc.rep('64 anos de idade', (f"{cl['idade']} anos de idade" if cl.get('idade') else '[[___ anos de idade (A PREENCHER)]]') + ', imigrante digital, com renda originária de benefício previdenciário de natureza alimentar')
    doc.rep('Sanitária', 'Previdenciária')
    doc.rep('Aposentada por invalidez', f"{be['especie']} " + ('no valor de um salário mínimo (' + base_calc + '), ' if be.get('igual_salario_minimo') else '')
            + 'verba de natureza alimentar' + (f", paga em conta corrente do {be['banco_pagador'].rstrip('.')}." if be.get('banco_pagador') else '.'))

    # ---- fundamentação / valores
    doc.rep('Valor requerido a título de prejuízo material', f'Valor requerido a título de prejuízo material: {R_total} com correção monetária desde cada desconto (Súmula 43/STJ) e juros moratórios desde o evento danoso (Súmula 54/STJ).')
    doc.rep('Requer-se, por conseguinte, que o quantum', f'Requer-se, por conseguinte, que o **quantum** indenizatório seja arbitrado no montante de **{brl(dano)}**, valor orientado pelos princípios da razoabilidade e da '
            'proporcionalidade e apto a cumprir sua dupla finalidade: recompor simbolicamente o status dignitatis violado e funcionar como mecanismo pedagógico de contenção de condutas ilícitas.')
    doc.rep('Esta ação tem por objeto', f"Esta ação tem por objeto, exclusiva e integralmente, o contrato {num}, averbado em nome da ré ({banco_nome} – CBC {cod_banco}) por migração do contrato de mesmo número lançado por "
            f"{ced.get('nome', '[[banco cedente – A PREENCHER]]')} (CBC {ced.get('codigo', '___')})."
            + (f" O contrato foi incluído e excluído antes do primeiro desconto registrado no extrato; ainda assim, a parte autora sofreu, no mínimo, 1 (um) desconto dele decorrente, o que mantém o interesse de agir e a pretensão de repetição do indébito." if ct.get('excluido_antes_primeiro_desconto') else ''))
    doc.rep('A parte autora declara, desde já, que reuniu', f'A parte autora declara, desde já, que o contrato {num} é o único contrato da ré que compartilha esta causa de pedir, não havendo fracionamento artificial de pretensão una, '
            'e coloca-se à disposição para prestar qualquer esclarecimento que este Juízo repute pertinente.')
    i_dano_heading = doc.find('Imperatividade da reparação por danos extrapatrimoniais')
    if i_dano_heading is not None:
        doc.setp(i_dano_heading, doc.txt[i_dano_heading].replace(' e permanentemente incapaz para o trabalho', ''), boldall=False)
    i68 = doc.find('Caracterização inequívoca de relação de consumo')
    if i68 is not None:
        doc.setp(i68, doc.txt[i68].replace(' e da pessoa com deficiência', ''))

    # ---- seção do campo "Motivo da Exclusão" (contrato excluído) x tutela (contrato ativo)
    if ativo:
        h1 = doc.find('DO PREENCHIMENTO DO CAMPO')
        h2 = doc.find('O sistema eConsignado/DATAPREV como repositório')
        p1 = doc.find('O Histórico de Empréstimos Consignados (HISCON), extraído')
        first_cut = doc.find('O sistema estrutura o encerramento')
        last_cut = doc.find('Tratando-se de contratos já excluídos')
        req = doc.find('Requer-se, por conseguinte, a condenação da ré à obrigação de fazer')
        doc.setp(h1, 'DA TUTELA DE URGÊNCIA E DA OBRIGAÇÃO DE FAZER: SUSPENSÃO DOS DESCONTOS E EXCLUSÃO DA AVERBAÇÃO')
        doc.setp(h2, 'Contrato ativo e em desconto mensal sobre verba alimentar – probabilidade do direito e perigo de dano (CPC, art. 300) – exclusão da averbação junto ao INSS/DATAPREV e preenchimento do campo “Motivo da Exclusão”')
        doc.setp(p1, f"Diferentemente de contratos já encerrados, o contrato {num} permanece **ATIVO** no sistema eConsignado/DATAPREV, com início de desconto em {ct.get('inicio', '___')}, fim previsto para "
                 f"{ct.get('fim', '___')} e parcela de **{brl(parcela)}** debitada mensalmente do benefício da autora ao longo de **{ct.get('parcelas', '___')} parcelas**. Cada mês de espera consolida um desconto novo "
                 "sobre verba de natureza alimentar, de modo que a tutela final, isoladamente, não afastaria o dano em curso.")
        doc.cut(first_cut, last_cut)
        doc.setp(req, f"Requer-se, por conseguinte, a condenação da ré à obrigação de fazer consistente em promover, junto ao Instituto Nacional do Seguro Social e à DATAPREV, a **exclusão definitiva da averbação** do contrato {num} "
                 "e, uma vez excluído, o preenchimento do campo **“Motivo da Exclusão”** com a expressão **“Por força de decisão judicial”**, mantido inalterado o campo “Origem da Exclusão”, no prazo de 10 (dez) dias úteis, "
                 "sob pena de multa diária de R$ 500,00 (quinhentos reais), na forma dos artigos 497 e 537 do Código de Processo Civil.")
        ext_ = ced.get('data_averbacao')
        doc.insert_after(p1,
            doc.newp(p1, "A **probabilidade do direito** está demonstrada pelo próprio extrato oficial: a averbação foi lançada por terceiro"
                     + (f" em {dmy(ced['data_averbacao'])}" if ced.get('data_averbacao') else '') + (f", excluída em {dmy(ced['data_exclusao'])} por “troca de titularidade”" if ced.get('data_exclusao') else '')
                     + f" e reaparece em nome da ré, sob o mesmo número, com a anotação “Migrado do contrato {num} CBC: {ced.get('codigo', '___')}”, sem notificação da devedora (CC, art. 290), sem autorização expressa e rastreável "
                     "(IN INSS/PRES nº 138/2022) e sem comprovação de autoria da manifestação de vontade (Res. CMN nº 4.753/2019). O **perigo de dano** decorre do caráter alimentar da verba e da continuidade dos descontos mensais. "
                     "Não há perigo de irreversibilidade (CPC, art. 300, § 3º), pois a suspensão pode ser revertida a qualquer tempo caso a ré demonstre, ao final, a regularidade da contratação.")
            + doc.newp(p1, f"Requer-se, assim, a concessão de **tutela de urgência**, inaudita altera parte, para determinar que a ré **suspenda, no prazo de 5 (cinco) dias, os descontos** relativos ao contrato {num} e se abstenha de novas "
                       "cobranças, cessões e inscrições em cadastros restritivos, sob pena de multa diária de R$ 500,00, na forma dos artigos 300 e 537 do Código de Processo Civil.")
            + doc.newp(p1, "A obrigação de fazer definitiva encontra fundamento no artigo 497 do Código de Processo Civil; nos artigos 6º, inciso VI, e 43 do Código de Defesa do Consumidor; no artigo 18, inciso III, da Lei nº 13.709/2018; "
                       "no artigo 422 do Código Civil; na Instrução Normativa INSS/PRES nº 138/2022; e na Resolução CMN nº 4.753/2019. O preenchimento do campo “Motivo da Exclusão” — hoje inexistente, por se tratar de contrato ativo — "
                       "documenta o reconhecimento judicial da ilicitude no histórico oficial e **impede a reaverbação do mesmo débito sob numeração distinta**."))
        g = doc.find('a concessão dos benefícios da gratuidade')
        doc.insert_after(g, doc.newp(g, f"a concessão de **tutela de urgência**, inaudita altera parte, para determinar a suspensão imediata dos descontos do contrato {num}, no prazo de 5 (cinco) dias, sob pena de multa diária de R$ 500,00, na forma do artigo 300 do Código de Processo Civil;"))
        doc.rep('a condenação da ré à obrigação de fazer consistente', f"a **condenação da ré à obrigação de fazer** consistente em promover, junto ao Instituto Nacional do Seguro Social e à DATAPREV, a exclusão definitiva da averbação do contrato {num} "
                "e o preenchimento do campo **“Motivo da Exclusão”** com a expressão **“Por força de decisão judicial”**, mantido inalterado o campo “Origem da Exclusão”, no prazo de 10 (dez) dias úteis, sob pena de multa diária de R$ 500,00, na forma dos artigos 497 e 537 do Código de Processo Civil;")

    # ---- pedidos e valor da causa
    doc.rep('no mérito, a declaração de nulidade da migração', f'no mérito, a **declaração de nulidade da migração** da averbação e de **inexistência de relação jurídica** entre a autora e a ré quanto ao contrato {num}, com a consequente inexigibilidade de todo e qualquer débito dele decorrente;')
    tail = ', bem como a devolução, também em dobro, das parcelas que venham a ser descontadas no curso da demanda;' if ativo else ';'
    doc.rep('a condenação da ré à restituição em dobro', f'a **condenação da ré à restituição em dobro** dos valores indevidamente descontados, no valor de {R_dobro}, correspondente à repetição do indébito sobre o total de {R_total} efetivamente subtraídos do benefício, '
            'na forma do artigo 42, parágrafo único, do Código de Defesa do Consumidor, com correção monetária desde a data de cada desconto (Súmula 43/STJ) e juros moratórios a contar do evento danoso (Súmula 54/STJ), '
            'aplicando-se, a partir de 30 de agosto de 2024, os critérios da Lei nº 14.905/2024' + tail)
    doc.rep('a condenação da ré ao pagamento de indenização', f'a **condenação da ré ao pagamento de indenização por danos extrapatrimoniais no montante de {brl(dano)}**, com correção monetária a partir do arbitramento (Súmula ')
    i = doc.find('Restituição do indébito (CDC')
    if i is not None:
        doc.setp(i + 1, R_dobro)
        doc.setp(i + 3, brl(dano))
        doc.setp(i + 5, R_causa)
    doc.rep('Dá-se à causa o valor de', f'Dá-se à causa o valor de {R_causa}, na forma do artigo 292, inciso VI, do Código de Processo Civil.')
    # Local da assinatura = cidade de residência da parte autora (procuração); OAB: BA -> OAB/BA 92.148; demais UFs -> OAB/MS 17.311
    cidade = cl.get('cidade') or cl.get('local')
    doc.rep('Manaus/AM,', (f"{cidade}, {dmy(cl['data'])}." if cidade and cl.get('data') else (f"{cidade}, [[__ de __________ de 2026 (DATA)]]." if cidade else '[[__________ (CIDADE DE RESIDÊNCIA – CONFORME PROCURAÇÃO)]], [[__ de __________ de 2026 (DATA)]].')))
    oab = 'OAB/BA 92.148' if uf == 'BA' else 'OAB/MS 17.311'
    doc.rep('CLEYTON DA SILVA BARBOSA', f'CLEYTON DA SILVA BARBOSA - {oab}', boldall=True)
    return {'ativo': ativo, 'n_desc': n_desc, 'estimado': est, 'total': total, 'dobro': dobro, 'causa': causa}

# ------------------------------------------------------------------ main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('json')
    ap.add_argument('-m', '--modelo', default=str(HERE / 'modelo_migrado.docx'))
    ap.add_argument('-o', '--saida')
    a = ap.parse_args()
    c = json.load(open(a.json, encoding='utf-8'))
    zin = zipfile.ZipFile(a.modelo)
    xml = zin.read('word/document.xml').decode('utf8')
    doc = Doc(xml)
    info = montar(doc, c)
    novo = doc.render()
    novo = re.sub(r'<w:i w:val="1"/>|<w:iCs w:val="1"/>', '', novo)  # evitar itálicos

    # cortes de deficiência/incapaz feitos via setp acima; checagem de resíduos do modelo
    plain = re.sub(r'<[^>]+>', '', re.sub(r'</w:p>', '\n', novo))
    resid = [k for k in MODEL_LEFTOVERS if k in plain]
    out = a.saida or str(Path(a.json).with_suffix('.docx'))
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == 'word/document.xml':
                data = novo.encode('utf8')
            elif item.filename == 'word/styles.xml':
                data = re.sub(r'<w:i w:val="1"/>|<w:iCs w:val="1"/>', '', data.decode('utf8')).encode('utf8')
            zout.writestr(item, data)
    vermelhos = len(re.findall(r'FF0000', novo))
    print(f'Gerado: {out}')
    print(f"Status: {'ATIVO (tutela + exclusão)' if info['ativo'] else 'EXCLUÍDO (campo Motivo da Exclusão)'} | descontos: {info['n_desc']}{' (estimado)' if info['estimado'] else ''} | causa: {info['causa']}")
    print(f'Trechos em vermelho (A PREENCHER/A CONFIRMAR): {vermelhos}')
    for w in doc.warn:
        print('AVISO:', w)
    for r in resid:
        print('RESÍDUO DO MODELO NO TEXTO:', r)
    print('Próximos passos: validar com validate.py, conferir no Word e subir na pasta da cliente no Drive.')

if __name__ == '__main__':
    main()
