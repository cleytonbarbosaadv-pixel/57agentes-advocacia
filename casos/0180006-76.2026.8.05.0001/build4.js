const fs=require('fs');
const D=require('/opt/node-tools/node_modules/docx');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,AlignmentType,BorderStyle,WidthType,ShadingType,LevelFormat,VerticalAlign,Footer,PageNumber}=D;
const NAVY='1F3864',BLUE='2E75B6';
function runs(t,o={}){ // **bold**, *italic*
  const out=[];
  t.split('**').forEach((seg,i)=>{ seg.split('*').forEach((s2,j)=>{ if(s2==='') return; out.push(new TextRun({text:s2,bold:(i%2===1)||o.bold,italics:(j%2===1)||o.italics,size:o.size||24,color:o.color,font:'Arial'})); }); });
  return out;
}
const body=(t)=>new Paragraph({alignment:AlignmentType.JUSTIFIED,spacing:{line:360,lineRule:'auto',before:0,after:160},indent:{firstLine:709},children:runs(t)});
const plain=(t,o={})=>new Paragraph({alignment:o.align||AlignmentType.JUSTIFIED,spacing:{line:360,before:0,after:o.after??160},indent:o.indent||{},children:runs(t,o)});
const H1=(t)=>new Paragraph({keepNext:true,spacing:{before:320,after:140,line:276},indent:{},border:{bottom:{style:BorderStyle.SINGLE,size:6,color:BLUE,space:1}},children:[new TextRun({text:t.toUpperCase(),bold:true,color:NAVY,size:24,font:'Arial'})]});
const H2=(t)=>new Paragraph({keepNext:true,spacing:{before:280,after:120,line:276},indent:{},children:[new TextRun({text:t.toUpperCase(),bold:true,color:NAVY,size:24,font:'Arial'})]});
const cons=(t)=>new Paragraph({alignment:AlignmentType.JUSTIFIED,spacing:{line:360,before:0,after:160},indent:{firstLine:709},children:[new TextRun({text:'Consequência processual: ',size:24,font:'Arial'}),...runs(t)]});
const Esp=(h)=>new Paragraph({spacing:{before:0,after:h},children:[]});
const bd={style:BorderStyle.SINGLE,size:1,color:'BECFE0'};const B={top:bd,bottom:bd,left:bd,right:bd};
function table(widths,head,rows,opt={}){
  const mk=(txt,w,fill,bold,al)=>new TableCell({width:{size:w,type:WidthType.DXA},borders:B,verticalAlign:VerticalAlign.CENTER,shading:{type:ShadingType.CLEAR,color:'auto',fill},margins:{top:70,bottom:70,left:110,right:110},children:[new Paragraph({alignment:al||AlignmentType.LEFT,spacing:{line:240,before:0,after:0},children:runs(String(txt),{size:20,bold,color:bold&&fill==='F0F4F8'?NAVY:undefined})})]});
  const tr=[new TableRow({tableHeader:true,cantSplit:true,children:head.map((h,i)=>mk(h,widths[i],'F0F4F8',true))})];
  rows.forEach((r,ri)=>tr.push(new TableRow({cantSplit:true,children:r.map((c,i)=>mk(c,widths[i],ri%2?'F7F9FB':'FFFFFF',false,(opt.right&&opt.right.includes(i))?AlignmentType.RIGHT:AlignmentType.LEFT))})));
  return new Table({width:{size:widths.reduce((a,b)=>a+b,0),type:WidthType.DXA},columnWidths:widths,rows:tr});
}
const legend=(t)=>new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:80,after:200,line:240},children:[new TextRun({text:t,italics:true,size:20,font:'Arial'})]});
const alinea=(t)=>new Paragraph({alignment:AlignmentType.JUSTIFIED,spacing:{line:360,before:0,after:120},indent:{left:709,hanging:425},children:runs(t)});
const C=[];
const ID='Processo nº 0180006-76.2026.8.05.0001';
C.push(new Paragraph({alignment:AlignmentType.JUSTIFIED,spacing:{after:160,line:276},children:[new TextRun({text:'AO JUÍZO DA 16ª VARA DO SISTEMA DOS JUIZADOS ESPECIAIS DO CONSUMIDOR (VESPERTINO) DA COMARCA DE SALVADOR — BAHIA',bold:true,size:24,font:'Arial'})]}));
C.push(new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:3,color:'CCCCCC',space:1}},spacing:{after:160},children:[]}));
['**'+ID+'**','**Recorrente:** SHEILA CRISTINA BARRETO VIEIRA','**Recorrida:** STONE INSTITUIÇÃO DE PAGAMENTO S.A.'].forEach(t=>C.push(plain(t,{after:60,align:AlignmentType.LEFT})));
C.push(Esp(200));
C.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:80},children:[new TextRun({text:'RECURSO INOMINADO',bold:true,color:NAVY,size:30,font:'Arial'})]}));
C.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:240},children:[new TextRun({text:'arts. 41 e 42 da Lei 9.099/95 — com pedido de gratuidade da justiça e de arbitramento de danos morais',italics:true,size:22,font:'Arial'})]}));
C.push(new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:6,color:NAVY,space:1}},spacing:{after:200},children:[]}));

C.push(H1('Parte A — Petição de interposição'));
C.push(body('**SHEILA CRISTINA BARRETO VIEIRA**, já qualificada nos autos da ação declaratória de inexistência de relação jurídica c/c obrigação de fazer e indenização por danos morais que move em face de **STONE INSTITUIÇÃO DE PAGAMENTO S.A.**, vem, **tempestivamente**, com fundamento no **art. 41 da Lei nº 9.099/95**, interpor **RECURSO INOMINADO** contra a r. sentença de Id. 206952353 (Págs. 101–102), que julgou improcedentes todos os pedidos, pelas razões anexas, que requer sejam recebidas e processadas.'));
C.push(body('**Tempestividade.** A Recorrente foi intimada da sentença em **30/09/2026** [VERIFICAR ANTES DE PROTOCOLAR a data exata de intimação]; o prazo é de 10 (dez) dias úteis (art. 42 da Lei 9.099/95 c/c art. 219 do CPC e Enunciado 165 do FONAJE), de modo que o recurso é tempestivo.'));
C.push(body('**Preparo e gratuidade.** A gratuidade da justiça foi requerida na inicial (Id. 203480486, Pág. 1; declaração de hipossuficiência, Id. 203480487, Pág. 13) e **não foi apreciada**, pois a sentença apenas dispensou custas e honorários no primeiro grau (arts. 54 e 55 da Lei 9.099/95). O pedido é **renovado** nesta oportunidade, instruído com o **Histórico de Créditos do INSS (Doc. 1)**, conforme o tópico II.2 das razões. Requer-se a dispensa do preparo (art. 42, § 1º, da Lei 9.099/95 c/c arts. 98 e 99, § 7º, do CPC [VERIFICAR ANTES DE PROTOCOLAR]) e, apenas por cautela e sem prejuízo do pedido, que, se indeferida a gratuidade, seja fixado prazo para recolhimento, evitando-se a deserção.'));
C.push(body('Requer, ao final, o recebimento do recurso, a intimação da Recorrida para contrarrazões e a remessa à Egrégia Turma Recursal.'));
C.push(plain('Nestes termos, pede deferimento.',{align:AlignmentType.LEFT,indent:{firstLine:708},after:60}));
C.push(plain('Salvador/BA, ___ de outubro de 2026.',{align:AlignmentType.LEFT,indent:{firstLine:708},after:200}));
C.push(plain('CLEYTON DA SILVA BARBOSA',{align:AlignmentType.CENTER,after:0,bold:true}));
C.push(plain('OAB/MS 17.311 — OAB/BA 92.148 [VERIFICAR inscrição suplementar]',{align:AlignmentType.CENTER,after:300}));

C.push(new Paragraph({pageBreakBefore:true,alignment:AlignmentType.JUSTIFIED,spacing:{after:160,line:276},children:[new TextRun({text:'EGRÉGIA TURMA RECURSAL DOS JUIZADOS ESPECIAIS CÍVEIS E CRIMINAIS DO ESTADO DA BAHIA',bold:true,size:24,font:'Arial'})]}));
['**Recurso Inominado — '+ID+'** (origem: 16ª VSJE do Consumidor — Vespertino — Salvador/BA)','**Recorrente:** SHEILA CRISTINA BARRETO VIEIRA','**Recorrida:** STONE INSTITUIÇÃO DE PAGAMENTO S.A.'].forEach(t=>C.push(plain(t,{after:60,align:AlignmentType.LEFT})));
C.push(H1('Parte B — Razões do recurso inominado'));
C.push(plain('**Colenda Turma, Eméritos Julgadores,**',{align:AlignmentType.LEFT,after:160}));

C.push(H2('I — Síntese da demanda e da sentença recorrida'));
C.push(body('A Recorrente consultou o Registrato do Banco Central e constatou relacionamento em seu nome com a Recorrida, iniciado em **25/07/2025** (Id. 203480491, Págs. 23–25), que afirma jamais ter solicitado. Ajuizou ação declaratória c/c obrigação de fazer e indenização por danos morais (R$ 8.000,00) e por desvio produtivo (R$ 2.000,00) (Id. 203480486, Págs. 7–8).'));
C.push(body('A Recorrida contestou apresentando **capturas de tela do seu painel administrativo** e duas imagens avulsas (um RG fotografado e uma selfie), e declarou que **"não se opõe ao encerramento cadastral"** da conta (Id. 205536487, Pág. 73). A sentença julgou **improcedentes todos os pedidos**, sob o fundamento de que a Recorrida "apresentou elementos relativos ao procedimento de abertura da conta, incluindo validação documental e biométrica, não havendo prova suficiente de falha nos mecanismos de segurança empregados", de que a conta "permaneceu sem qualquer movimentação financeira", e de que "a mera existência do vínculo cadastral no Registrato, desacompanhada de repercussão concreta, não configura dano moral" (Id. 206952353, Pág. 101).'));
C.push(body('**A *ratio decidendi* atacada:** o Juízo tratou como prova suficiente da contratação o que são **telas do sistema interno da própria ré**, e exigiu da consumidora a prova de "falha nos mecanismos de segurança", invertendo o ônus que a lei põe sobre o fornecedor. Ao fazê-lo, julgou improcedente até o pedido de encerramento da conta, **a que a Recorrida expressamente não se opôs**.'));

C.push(H2('II — Admissibilidade'));
C.push(H2('II.1 — Cabimento, tempestividade e interesse'));
C.push(body('O recurso é cabível (art. 41 da Lei 9.099/95), foi interposto no prazo de 10 dias úteis (art. 42) e a Recorrente tem interesse, pois teve todos os pedidos julgados improcedentes.'));
C.push(H2('II.2 — Gratuidade da justiça: comprovação pelo Histórico de Créditos do INSS'));
C.push(body('A Recorrente declarou, sob as penas da lei, não poder arcar com as despesas do processo sem prejuízo do próprio sustento (Id. 203480487, Pág. 13). A declaração de pessoa natural presume-se verdadeira (art. 99, § 3º, do CPC), e o benefício só pode ser indeferido se houver nos autos elementos que evidenciem a falta dos pressupostos, após intimação da parte para comprová-los (art. 99, § 2º). Nada nos autos infirma a declaração. Ao contrário, o **Histórico de Créditos do INSS (Doc. 1)**, emitido em 04/09/2026 e autenticável em meu.inss.gov.br/central com o código **2609040MN2-ZGRGNZNQ139**, a confirma:'));
C.push(table([5000,2000,2026],['Dado do benefício (NB 158.754.955-4 — Pensão por morte previdenciária, espécie 21)','Valor','Observação'],[
['Valor total do benefício na competência 08/2026 (rubrica 101)','R$ 1.621,00','Equivale a um salário mínimo'],
['Consignação empréstimo bancário (rubrica 216)','R$ 23,19','—'],
['Consignação empréstimo bancário (rubrica 216)','R$ 23,00','—'],
['Consignação empréstimo bancário (rubrica 216)','R$ 35,99','—'],
['Consignação empréstimo bancário (rubrica 216)','R$ 485,11','—'],
['Empréstimo sobre a RMC (rubrica 217)','R$ 81,05','—'],
['Consignação — cartão (rubrica 268)','R$ 81,05','—'],
['**Total de descontos**','**R$ 729,39**','**45,0% do benefício**'],
['**Valor líquido efetivamente pago (08/2026)**','**R$ 891,61**','**55,0% de um salário mínimo**'],
],{right:[1]}));
C.push(legend('Quadro 1 — Composição do benefício previdenciário (Histórico de Créditos, Doc. 1)'));
C.push(body('A Recorrente é viúva e pensionista; sua única renda comprovada é uma pensão por morte de **um salário mínimo**, da qual **R$ 729,39 (45%)** são consumidos por descontos consignados, restando **R$ 891,61** líquidos, importância inferior a um salário mínimo. Destinar parte dessa renda ao preparo recursal comprometeria o sustento, situação a que o art. 5º, LXXIV, da CF/88 e o art. 98 do CPC visam a obstar. Requer-se a **concessão da gratuidade**, com dispensa do preparo (art. 99, § 7º, do CPC [VERIFICAR ANTES DE PROTOCOLAR]); se o Colegiado entender necessária prova complementar, requer-se **intimação prévia para complementação** (art. 99, § 2º) e, em último caso, prazo para recolhimento, sem deserção. A gratuidade suspende, ainda, a exigibilidade de eventual sucumbência recursal (art. 98, § 3º, do CPC [VERIFICAR ANTES DE PROTOCOLAR]).'));

C.push(H2('III — Delimitação do objeto e mapa dos fundamentos da sentença'));
C.push(body('Como a sentença é de **improcedência total**, devolve-se à Turma o capítulo integral: o mérito da contratação, o encerramento da conta e as indenizações.'));
C.push(table([480,3500,2400,2646],['#','Fundamento da sentença (Id. 206952353, Pág. 101)','Erro apontado','Atacado em'],[
['1','"Não havendo prova suficiente de falha nos mecanismos de segurança"','Erro de direito: ônus da prova da regularidade é do fornecedor','IV.1'],
['2','"Elementos relativos ao procedimento de abertura, incluindo validação documental e biométrica"','Erro de fato: valorou telas internas, selfie avulsa e RG sem lastro técnico, sem contrato ou aceite','IV.2'],
['3','Improcedência do pedido de encerramento da conta','Erro: a Recorrida não se opôs; pedido incontroverso','IV.3'],
['4','Ausência de movimentação e de "repercussão concreta": sem dano moral','Erro de direito: dano presumido (reconhecida a ausência de contratação)','IV.4'],
['5','Desvio produtivo: mera tentativa administrativa seguida de ação','Consideração subsidiária','IV.5'],
]));
C.push(legend('Quadro 2 — Fundamentos da sentença, erros e seções de ataque'));

C.push(H2('IV — Razões de reforma'));
C.push(H2('IV.1 — Do erro na distribuição do ônus da prova'));
C.push(body('A sentença julgou improcedente o pedido porque "não [há] prova suficiente de falha nos mecanismos de segurança empregados". A frase põe o ônus do lado errado. A Recorrente nega, desde a inicial, ter solicitado a conta. **O fato que daria validade à relação, a manifestação de vontade da titular, é fato impeditivo do direito da autora, e prová-lo incumbe ao réu (art. 373, II, do CPC).** A autora não precisa demonstrar uma "falha" nos sistemas da Recorrida, a que não tem acesso; cabe à Recorrida demonstrar, com elementos técnicos idôneos, que foi a própria titular quem abriu a conta.'));
C.push(body('A relação é de consumo e a responsabilidade, objetiva (art. 14 do CDC; Súmula 479/STJ); a hipossuficiência técnica e informacional é manifesta, pois logs, IP, dispositivo, trilha de abertura e relatórios biométricos estão sob domínio exclusivo da Recorrida; exigir da consumidora a prova de que **não** contratou é prova diabólica de fato negativo; e a distribuição dinâmica (art. 373, § 1º, do CPC) e a inversão de pleno direito (art. 6º, VIII, do CDC), pedida na inicial e **não apreciada** na sentença, levam ao mesmo resultado. Ao exigir "falha nos mecanismos de segurança" comprovada pela autora, a sentença fez recair sobre a consumidora o risco da atividade, em sentido contrário à Súmula 479/STJ.'));
C.push(cons('a sentença errou ao exigir da consumidora a prova de falha nos sistemas do fornecedor; reexamina-se a prova sob o ônus correto.'));

C.push(H2('IV.2 — Do erro na valoração da prova da Recorrida'));
C.push(body('A sentença concluiu que a Recorrida apresentou "validação documental e biométrica". O que a Recorrida juntou, examinado documento a documento (todos já nos autos), é o seguinte:'));
C.push(table([2300,3500,3226],['Documento da Recorrida','O que é, de fato','O que não comprova'],[
['"Detalhes da conta" (Id. 205536488, Pág. 81)','Captura de tela do painel administrativo da Recorrida ("stone | admin"), sem assinatura, sem data e hora de captura, sem identificação do operador','Contratação pela titular: mostra apenas que o cadastro existe no sistema da própria Recorrida'],
['Análise de KYC (Id. 205536492, Pág. 85)','Captura de tela do painel interno: canal "self_register"; "Facematch Bureau — score 95"; "Liveness 3D — temos evidências de que o rosto da selfie é um rosto real"; resultados automáticos, sem identificar o motor biométrico, a versão ou os limiares','Que quem apresentou o rosto foi a titular: não há relatório técnico (algoritmo, limiares, FAR/FRR, hash de integridade), nem log da sessão (IP, dispositivo, geolocalização, carimbo de cada etapa)'],
['Selfie (Id. 205536493, Pág. 86)','Imagem avulsa, sem metadados, data, hora ou vínculo verificável com a sessão','Captura viva pela titular; selfie isolada não é biometria validada'],
['RG (Id. 205536490, Pág. 83)','Fotografia de documento sobre fundo escuro, sem data ou origem','Que foi a titular quem o fotografou e enviou; o RG é dado obtível por terceiros'],
['Extrato (Id. 205536491, Pág. 84)','Extrato sem nenhuma transação desde 25/07/2025','Autoria da abertura: prova apenas a inatividade da conta'],
['Contrato / termos de uso / aceite','**Não foram juntados**','Que a titular conheceu e aceitou as condições do serviço'],
]));
C.push(legend('Quadro 3 — Prova da Recorrida: natureza e limites'));
C.push(body('**1. Telas do sistema interno não são prova da contratação.** Os documentos de Ids. 205536488 e 205536492 são **registros unilaterais, produzidos pelo painel administrativo da própria Recorrida**, sem chancela de terceiro, sem fé pública e sem metadados que permitam verificar quando e por quem foram gerados. O art. 425, V, do CPC confere força a reproduções digitais atestadas pelo emitente como referentes ao caso concreto; telas de sistema que apenas exibem "aprovado" para etapas automáticas não suprem a prova do ato. Prova-se que o sistema da Recorrida registrou um resultado, não que a titular praticou o ato. A própria Recorrida o reconhece indiretamente: afirma que, "caso tenha ocorrido atuação indevida de terceiro na posse dos dados e da imagem da Autora", haveria fato de terceiro (Id. 205536487, Pág. 73), isto é, admite não ter certeza da regularidade que, em outro passo, afirma "categoricamente".'));
C.push(body('**2. Não há contrato assinado nem aceite eletrônico.** A Recorrida não juntou contrato de abertura, termos de uso, registro de aceite com data e hora ou comprovante de ciência dos termos pela titular. A conta é de um serviço financeiro, regido por contrato de adesão; sem instrumento ou aceite específico, não há prova de manifestação de vontade (art. 104 do CC; MP 2.200-2/2001, art. 10, § 2º, e Lei 14.063/2020 quanto à autenticação eletrônica). O precedente que a Recorrida invoca, do TJ-PR (Id. 205536487, Pág. 77), confirma o ponto: nele a instituição apresentou "documentação de contratação, **termo de adesão assinado e reconhecimento de firma em cartão autógrafo**", elementos que **aqui não existem**.'));
C.push(body('**3. A cadeia de autenticação tem elo rompido.** A Recorrente reconhece, com lealdade processual (como já o fizera na réplica, Id. 205585281, Pág. 90), que nome, CPF, data de nascimento, endereço e e-mail do cadastro coincidem com os seus. Tais dados, porém, são obteníveis por terceiros por vazamento ou proximidade, e a Recorrida não comprova ter exigido confirmação ativa de titularidade do e-mail. O **telefone** do cadastro, com final 8042, é **diverso** do que a Recorrente utiliza, (71) 98441-7275, como registra o log de assinatura da procuração (Id. 203480487, Pág. 14). Em fluxos de autoatendimento, o código de segurança de uso único segue ao telefone informado; a Recorrida **não juntou** o log de envio e confirmação do código, nem o IP, dispositivo ou geolocalização da sessão, que estão em seu poder exclusivo.'));
C.push(body('**4. Selfie e RG não valem por si.** A sentença acolheu, como "validação biométrica", uma imagem avulsa e a indicação textual de "score 95" e de "evidências de liveness", extraídas da tela da própria ré. Sem o relatório técnico do motor biométrico e sem o registro da sessão, não é possível aferir se a captura foi viva, de quem partiu e por qual dispositivo; sistemas de liveness reduzem, mas não eliminam, o risco de fraude, e é por isso que o ônus de demonstrá-lo com elementos técnicos recai sobre quem os opera. Perícia ou exibição de documentos não podem ser requeridas no rito dos Juizados (art. 35, IV, da Lei 9.099/95); a lacuna probatória da Recorrida opera, portanto, **como fundamento de mérito**: sob a inversão do ônus, quem detém a prova técnica e não a traz suporta o resultado.'));
C.push(body('**5. A sentença não indicou o que, nos autos, supriria essas lacunas.** Limitou-se a afirmar que foram apresentados "elementos relativos ao procedimento de abertura". Elementos não são prova da autoria; a distinção entre ambos é o que o recurso devolve à Turma.'));
C.push(cons('a prova da Recorrida se resume a telas internas e imagens avulsas, sem contrato, aceite, log ou relatório técnico; não se desincumbiu do ônus do art. 373, II, do CPC, e deve ser reconhecida a inexistência da relação jurídica.'));

C.push(H2('IV.3 — Do encerramento da conta: pedido a que a Recorrida não se opôs'));
C.push(body('Ainda que a Turma mantivesse a improcedência quanto à inexistência da relação, a sentença não poderia ter rejeitado o pedido de **encerramento da conta e de exclusão do vínculo**. A Recorrida declarou que "**não se opõe ao encerramento cadastral** da referida conta, tendo em vista a manifestação de desinteresse da Autora em manter o relacionamento", tratando-se de "conta inativa, cujo encerramento pode ser procedido administrativamente sem qualquer prejuízo" (Id. 205536487, Pág. 73). **Não há lide** sobre esse pedido: a ré concordou. A concordância da ré com o pedido equivale ao reconhecimento de sua procedência (art. 487, III, "a", do CPC [VERIFICAR ANTES DE PROTOCOLAR]) e impunha, no mínimo, a determinação de encerramento da conta e de atualização do cadastro no CCS/Registrato, com a manutenção do registro apenas dos dados cuja guarda decorra de obrigação legal. A sentença omitiu-se sobre essa concordância e julgou improcedente também esse capítulo, o que deve ser reformado.'));
C.push(cons('reforma para determinar o encerramento definitivo da conta e a atualização do vínculo no CCS/Registrato, com prazo e multa para o cumprimento.'));

C.push(H2('IV.4 — Do dano moral, presumido na abertura de conta sem consentimento'));
C.push(body('A sentença afirmou que "a mera existência do vínculo cadastral no Registrato, desacompanhada de repercussão concreta, não configura dano moral". Reconhecida a inexistência de manifestação de vontade da titular (tópicos IV.1 e IV.2), o dano é **presumido**: a constituição, em nome do consumidor e à sua revelia, de uma relação financeira registrada em cadastro oficial do sistema financeiro, com o uso de seus dados pessoais, viola direitos da personalidade (art. 5º, X, da CF/88), o direito à proteção de dados (art. 5º, LXXIX) e a LGPD (arts. 42 e 46), e independe de prejuízo patrimonial, negativação ou movimentação da conta, que seriam danos diversos e ulteriores. A responsabilidade é objetiva (art. 14 do CDC; Súmula 479/STJ).'));
C.push(body('**Parâmetros.** (a) **REsp 2.201.694/SP (Doc. 2)**: a Terceira Turma do STJ, por maioria (Rel. p/ acórdão Min. Nancy Andrighi; j. 05/08/2025; DJEN 15/08/2025), assentou que o gestor de banco de dados que disponibiliza indevidamente dados do cadastrado "deve responder objetivamente pelos danos morais causados ao cadastrado, **que são presumidos, diante da forte sensação de insegurança por ele experimentada**" (ementa, item 4), e fixou **R$ 11.000,00**. O caso tem objeto próprio (birô de crédito) e é invocado como parâmetro do dano presumido por tratamento indevido de dados e da ordem de grandeza da compensação. (b) **Sentença no processo nº 0022386-55.2026.8.05.0080 (5ª VSJ de Feira de Santana/BA — Antonieta Freitas Mota × Dock Instituição de Pagamento S.A.) (Doc. 3)**: conta de pagamento aberta sem prova de contratação, **sem negativação e sem prejuízo material alegado**; a sentença, homologada pela Juíza de Direito, reconheceu "dano *in re ipsa*, decorrente da própria constituição e manutenção, à revelia da titular, de relacionamento inserido em cadastro oficial do sistema financeiro nacional", "dispensando-se a comprovação de prejuízo patrimonial específico", e fixou **R$ 5.000,00**. É decisão de primeiro grau, sem eficácia vinculante, trazida como parâmetro de razoabilidade em hipótese fática idêntica, incluindo a inatividade da conta.'));
C.push(body('**Os precedentes da Recorrida.** O REsp 2.271.604/RS (Id. 205536487, Pág. 75) trata do compartilhamento no SCR de informação de **consumidor inadimplente**, com **autorização contratual expressa**; a Recorrida não provou autorização alguma. O acórdão da Quarta Turma Recursal (Alelo, proc. 0030435-07.2021.8.05.0001) trata de **cobrança indevida** sem inscrição, em relação contratual existente. Nenhum enfrenta a hipótese em que **a própria relação foi constituída sem manifestação de vontade da titular**.'));
C.push(cons('constatada a ausência de contratação, o dano moral é presumido e independe da movimentação da conta; impõe-se a reforma do capítulo e o arbitramento da indenização (IV.6).'));

C.push(H2('IV.5 — Do desvio produtivo (subsidiário)'));
C.push(body('A sentença rejeitou o pedido autônomo por entender "insuficiente, para tanto, a simples tentativa de solução administrativa seguida do ajuizamento". A Recorrente buscou a solução administrativa (requerimento juntado com a inicial, Id. 203480490) e, sem resposta, ajuizou a ação, compareceu à audiência e acompanhou o processo. Ainda que a Turma entenda insuficiente a prova para a indenização autônoma, requer que o tempo despendido seja considerado **na quantificação do dano moral** como circunstância agravante, nos termos da Súmula 30 da Turma Recursal do TJBA, invocada na inicial [VERIFICAR ANTES DE PROTOCOLAR a redação da súmula].'));

C.push(H2('IV.6 — Do arbitramento dos danos morais'));
C.push(body('Os valores da inicial, **R$ 8.000,00** (danos morais) e **R$ 2.000,00** (desvio produtivo), totalizando **R$ 10.000,00**, são mantidos, por proporcionais à extensão do dano (art. 944 do CC). Situam-se **entre** o valor fixado em primeiro grau em caso idêntico (R$ 5.000,00) e o fixado pelo STJ em caso de dano presumido por tratamento indevido de dados (R$ 11.000,00):'));
C.push(table([2900,2800,1500,1826],['Parâmetro','Natureza da lesão','Exigiu negativação?','Valor'],[
['REsp 2.201.694/SP (3ª T., STJ, 2025)','Dados pessoais disponibilizados indevidamente (dano presumido)','Não','R$ 11.000,00'],
['Proc. 0022386-55.2026.8.05.0080 (JEC Feira de Santana/BA, 2026)','Conta aberta sem prova de contratação, registrada no CCS, sem movimentação alegada','Não','R$ 5.000,00'],
['Pedido da Recorrente (inicial)','Conta aberta sem consentimento, ativa desde 25/07/2025','—','R$ 8.000,00 + R$ 2.000,00'],
]));
C.push(legend('Quadro 4 — Parâmetros de arbitramento'));
C.push(body('Caso a Turma não acolha os valores integrais, requer-se o **arbitramento pelo próprio Colegiado**, dentro do limite do pedido (R$ 10.000,00), em valor **não inferior a R$ 5.000,00**. Sobre o valor incidem juros de mora desde o evento danoso (Súmula 54/STJ) ou, subsidiariamente, desde a citação, e correção monetária desde o arbitramento (Súmula 362/STJ), observado, para os períodos a partir de 30/08/2024, o art. 406 do CC, com a redação da Lei 14.905/2024.'));

C.push(H2('V — Prequestionamento'));
C.push(body('Para fins de eventual Recurso Extraordinário (art. 102, III, da CF/88) e de pedido de uniformização de jurisprudência, ficam prequestionados os arts. 5º, X, XXXV, LXXIV e LXXIX, da CF/88; os arts. 6º, VIII, e 14 do CDC; a Súmula 479/STJ; os arts. 42 e 46 da Lei 13.709/2018; os arts. 373 e 487 do CPC e os arts. 98 e 99 do CPC. Registra-se a divergência, quanto ao dano presumido na abertura de conta sem prova de contratação e sem movimentação, entre a sentença de Feira de Santana/BA (Doc. 3), que o reconhece, e decisões que o negam, a justificar, se necessário, a uniformização.'));

C.push(H2('VI — Pedidos'));
C.push(body('Ante o exposto, requer a Recorrente:'));
[
'a)\tO **recebimento do recurso** com a **concessão da gratuidade da justiça**, dispensado o preparo (art. 42, § 1º, da Lei 9.099/95; arts. 98 e 99 do CPC), à vista da declaração de hipossuficiência e do Histórico de Créditos do INSS (Doc. 1); subsidiariamente, a intimação para complementação da prova (art. 99, § 2º, do CPC) e, em último caso, prazo para recolhimento, sem deserção;',
'b)\tO **conhecimento e provimento do recurso** para reformar a sentença de Id. 206952353 e **declarar a inexistência da relação jurídica** relativa à conta nº 96210440-2, por ausência de prova de manifestação de vontade da titular, com inversão do ônus da prova (art. 6º, VIII, do CDC; art. 373, § 1º, do CPC);',
'c)\tA **determinação de encerramento definitivo da conta** e de atualização do vínculo no CCS/Registrato, em prazo razoável e sob multa diária, ressalvada a guarda de dados exigida por lei; **ainda que mantida a improcedência quanto à inexistência**, que se acolha o encerramento, ante a concordância expressa da Recorrida (Id. 205536487, Pág. 73);',
'd)\tA **condenação da Recorrida** ao pagamento de **R$ 8.000,00 a título de danos morais** e **R$ 2.000,00 a título de desvio produtivo**, valores da inicial, com juros e correção na forma do tópico IV.6;',
'e)\tSubsidiariamente, o **arbitramento judicial** dos danos morais pela Turma, em valor **não inferior a R$ 5.000,00**, dentro do limite do pedido, tomando-se por parâmetro o REsp 2.201.694/SP (R$ 11.000,00) e a sentença do processo nº 0022386-55.2026.8.05.0080 (R$ 5.000,00);',
'f)\tA ausência de condenação da Recorrente em custas e honorários, por ser beneficiária da gratuidade, e a condenação da Recorrida na sucumbência recursal, se vencida (art. 55 da Lei 9.099/95);',
'g)\tQue as intimações sejam feitas em nome do advogado **CLEYTON DA SILVA BARBOSA, OAB/MS 17.311 e OAB/BA 92.148**.'
].forEach(t=>C.push(alinea(t)));
C.push(plain('**Documentos anexos:** Doc. 1 — Histórico de Créditos do INSS da Recorrente (NB 158.754.955-4, emitido em 04/09/2026); Doc. 2 — Acórdão do REsp 2.201.694/SP (STJ); Doc. 3 — Sentença do processo nº 0022386-55.2026.8.05.0080 (5ª VSJ de Feira de Santana/BA).',{align:AlignmentType.JUSTIFIED,after:200}));
C.push(plain('Nestes termos, pede deferimento.',{align:AlignmentType.LEFT,indent:{firstLine:708},after:60}));
C.push(plain('Salvador/BA, ___ de outubro de 2026.',{align:AlignmentType.LEFT,indent:{firstLine:708},after:400}));
C.push(plain('CLEYTON DA SILVA BARBOSA',{align:AlignmentType.CENTER,after:0,bold:true}));
C.push(plain('OAB/MS 17.311 — OAB/BA 92.148',{align:AlignmentType.CENTER,after:0}));
const doc=new Document({styles:{default:{document:{run:{font:'Arial',size:24}}}},
 sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1701,bottom:1134,left:1701,right:1134}}},
 footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:ID+' — Recurso Inominado — página ',size:18,font:'Arial'}),new TextRun({children:[PageNumber.CURRENT],size:18,font:'Arial'}),new TextRun({text:' de ',size:18,font:'Arial'}),new TextRun({children:[PageNumber.TOTAL_PAGES],size:18,font:'Arial'})]})]})},
 children:C}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync('recurso_inominado_conta_fraudulenta.docx',b);console.log('ok',b.length)});
