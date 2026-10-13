# -*- coding: utf-8 -*-
"""Gera PROCURAÇÃO + DECLARAÇÃO DE HIPOSSUFICIÊNCIA (e, opcionalmente, CONTRATO DE HONORÁRIOS)
a partir dos modelos do escritório (modelo_*.docx desta pasta), em .docx e PDF.

    python gerar_procuracao.py cliente.json -o "<pasta de saída>" [--sem-pdf] [--sem-contrato]

cliente.json (campos; omitir/null = não aparece na qualificação):
{
  "nome": "ILDA DUARTE",
  "sexo": "F",                       # F | M  (flexiona brasileira/o, portadora/or, domiciliada/o...)
  "nacionalidade": "brasileira",     # opcional (padrão: brasileiro/a)
  "estado_civil": "casada",          # opcional — se não constar nos documentos, OMITIR
  "condicao": "beneficiária do INSS",# opcional (padrão: beneficiário/a do INSS)
  "rg": "111.501", "cpf": "045.582.514-91",
  "logradouro": "Praça Jacome Calheiros, 52, Centro Histórico",   # via, nº, complemento, bairro
  "cidade": "Penedo", "uf": "AL", "cep": "57200-000",             # cidade = a do comprovante de residência
  "data": "2026-10-13",              # opcional (padrão: hoje); local da assinatura = cidade/uf
  "honorarios_percentual": 50        # só para o contrato (padrão 50)
}
"""
import argparse, datetime, json, os, re, shutil, subprocess, sys, unicodedata
import docx

AQUI = os.path.dirname(os.path.abspath(__file__))
MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
         "agosto", "setembro", "outubro", "novembro", "dezembro"]
FEM = {"casado": "casada", "solteiro": "solteira", "viúvo": "viúva", "viuvo": "viúva",
       "divorciado": "divorciada", "separado": "separada", "brasileiro": "brasileira",
       "aposentado": "aposentada", "beneficiário": "beneficiária", "beneficiario": "beneficiária"}
MASC = {v: k for k, v in FEM.items() if k == unicodedata.normalize("NFC", k)}
MASC.update({"casada": "casado", "solteira": "solteiro", "viúva": "viúvo", "divorciada": "divorciado",
             "separada": "separado", "brasileira": "brasileiro", "aposentada": "aposentado",
             "beneficiária": "beneficiário"})
NA = ("rua avenida praça travessa alameda estrada rodovia quadra vila fazenda ladeira via "
      "chácara colônia comunidade aldeia").split()
NO = ("povoado sítio sitio loteamento conjunto distrito bairro residencial largo parque "
      "condomínio setor beco km lote assentamento").split()


def flex(palavra, sexo):
    """Flexiona por palavra (casado/casada...) conforme o sexo; palavras desconhecidas passam direto."""
    out = []
    for w in palavra.split(" "):
        k = w.lower()
        if sexo == "F" and k in FEM:
            out.append(FEM[k])
        elif sexo == "M" and k in MASC:
            out.append(MASC[k])
        else:
            out.append(w)
    return " ".join(out)


def prep_endereco(logradouro):
    p = logradouro.strip().split(" ")[0].lower().rstrip(".,")
    return "na" if p in NA else "no" if p in NO else "em"


def qualificacao(c):
    f = c.get("sexo", "F").upper() == "F"
    s = "F" if f else "M"
    partes = [c["nome"].strip()]
    partes.append(flex(c.get("nacionalidade") or "brasileiro", s))
    if c.get("estado_civil"):
        partes.append(flex(c["estado_civil"].strip(), s))
    partes.append(flex(c.get("condicao") or "beneficiário do INSS", s))
    docs = []
    if c.get("rg"):
        docs.append("RG " + c["rg"].strip())
    if c.get("cpf"):
        docs.append("CPF " + c["cpf"].strip())
    if docs:
        partes.append(("portadora" if f else "portador") + " do " + " e do ".join(docs))
    end = c["logradouro"].strip().rstrip(",")
    loc = f'{c["cidade"].strip()}/{c["uf"].strip().upper()}'
    tail = f"{end}, {loc}" + (f', CEP {c["cep"].strip()}' if c.get("cep") else "")
    partes.append(("residente e domiciliada " if f else "residente e domiciliado ")
                  + prep_endereco(end) + " " + tail)
    return ", ".join(partes)


def extenso(n):
    u = "zero um dois três quatro cinco seis sete oito nove dez onze doze treze quatorze quinze dezesseis dezessete dezoito dezenove".split()
    d = {2: "vinte", 3: "trinta", 4: "quarenta", 5: "cinquenta", 6: "sessenta", 7: "setenta", 8: "oitenta", 9: "noventa"}
    if n < 20:
        return u[n]
    if n == 100:
        return "cem"
    return d[n // 10] + ("" if n % 10 == 0 else " e " + u[n % 10])


def data_extenso(iso):
    dt = datetime.date.fromisoformat(iso) if iso else datetime.date.today()
    return f"{dt.day} de {MESES[dt.month - 1]} de {dt.year}"


def preencher(modelo, saida, mapa):
    d = docx.Document(os.path.join(AQUI, modelo))
    for p in d.paragraphs:
        for r in p.runs:
            if "{{" in r.text:
                t = r.text
                for k, v in mapa.items():
                    t = t.replace("{{" + k + "}}", v)
                r.text = t
    for p in d.paragraphs:
        assert "{{" not in p.text, "marcador não preenchido: " + p.text[:80]
    d.save(saida)


def para_pdf(docx_path, pdf_path):
    """soffice (nuvem/Linux/qualquer) -> Word via COM (Windows) -> docx2pdf."""
    outdir = os.path.dirname(os.path.abspath(pdf_path))
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if soffice:
        subprocess.run([soffice, "--headless", "--convert-to", "pdf", "--outdir", outdir, docx_path],
                       check=True, capture_output=True, timeout=180)
        gerado = os.path.join(outdir, os.path.splitext(os.path.basename(docx_path))[0] + ".pdf")
        if os.path.abspath(gerado) != os.path.abspath(pdf_path):
            os.replace(gerado, pdf_path)
        return True
    if os.name == "nt":
        ps = ("$w=New-Object -ComObject Word.Application;$w.Visible=$false;"
              f"$d=$w.Documents.Open('{os.path.abspath(docx_path)}');"
              f"$d.SaveAs([ref]'{os.path.abspath(pdf_path)}',[ref]17);$d.Close($false);$w.Quit()")
        subprocess.run(["powershell", "-NoProfile", "-Command", ps], check=True, capture_output=True, timeout=180)
        return os.path.exists(pdf_path)
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("json")
    ap.add_argument("-o", "--saida", default=".")
    ap.add_argument("--sem-pdf", action="store_true")
    ap.add_argument("--sem-contrato", action="store_true", help="não gera o contrato de honorários (por padrão sempre gera)")
    a = ap.parse_args()
    c = json.load(open(a.json, encoding="utf-8"))
    for k in ("nome", "logradouro", "cidade", "uf"):
        if not c.get(k):
            sys.exit(f"campo obrigatório ausente: {k}")
    os.makedirs(a.saida, exist_ok=True)
    pct = int(c.get("honorarios_percentual", 50))
    mapa = {"QUALIFICACAO": qualificacao(c), "NOME": c["nome"].strip().upper(),
            "CIDADE_UF": f'{c["cidade"].strip()}/{c["uf"].strip().upper()}',
            "DATA": data_extenso(c.get("data")), "HONORARIOS": f"{pct}% ({extenso(pct)} por cento)"}
    nome = re.sub(r'[\\/:*?"<>|]', "", mapa["NOME"])
    saidas = [("modelo_procuracao_declaracao.docx", f"PROCURAÇÃO E DECLARAÇÃO - {nome} (CLEYTON)"),
              ("modelo_procuracao_declaracao_ana.docx", f"PROCURAÇÃO E DECLARAÇÃO - {nome} (ANA CRISTINA)")]
    if not a.sem_contrato:
        saidas.append(("modelo_contrato_honorarios.docx", f"CONTRATO DE HONORÁRIOS - {nome}"))
    for modelo, base in saidas:
        dx = os.path.join(a.saida, base + ".docx")
        preencher(modelo, dx, mapa)
        print(dx)
        if not a.sem_pdf:
            pdf = os.path.join(a.saida, base + ".pdf")
            print(pdf if para_pdf(dx, pdf) else "PDF não gerado (sem soffice/Word)")


if __name__ == "__main__":
    main()
