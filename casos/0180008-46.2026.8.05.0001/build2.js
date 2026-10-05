const fs=require('fs');
const D=require('/opt/node-tools/node_modules/docx');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,AlignmentType,BorderStyle,WidthType,ShadingType,LevelFormat,VerticalAlign,Footer,PageNumber}=D;
const NAVY='1F3864',BLUE='2E75B6';
function runs(t,o={}){ // **bold**
  return t.split('**').map((s,i)=>new TextRun({text:s,bold:(i%2===1)||o.bold,italics:o.italics,size:o.size||24,color:o.color,font:'Times New Roman'})).filter(r=>true);
}
const body=(t)=>new Paragraph({alignment:AlignmentType.JUSTIFIED,spacing:{line:360,lineRule:'auto',before:0,after:160},indent:{firstLine:709},children:runs(t)});
const plain=(t,o={})=>new Paragraph({alignment:o.align||AlignmentType.JUSTIFIED,spacing:{line:360,before:0,after:o.after??160},indent:o.indent||{},children:runs(t,o)});
const H1=(t)=>new Paragraph({keepNext:true,spacing:{before:320,after:140,line:276},indent:{},border:{bottom:{style:BorderStyle.SINGLE,size:6,color:BLUE,space:1}},children:[new TextRun({text:t.toUpperCase(),bold:true,color:NAVY,size:24,font:'Times New Roman'})]});
const H2=(t)=>new Paragraph({keepNext:true,spacing:{before:280,after:120,line:276},indent:{},children:[new TextRun({text:t.toUpperCase(),bold:true,color:NAVY,size:24,font:'Times New Roman'})]});
const cons=(t)=>new Paragraph({alignment:AlignmentType.JUSTIFIED,spacing:{line:360,before:0,after:160},indent:{firstLine:709},children:[new TextRun({text:'Consequência processual: ',size:24,font:'Times New Roman'}),...runs(t)]});
const Esp=(h)=>new Paragraph({spacing:{before:0,after:h},children:[]});
const bd={style:BorderStyle.SINGLE,size:1,color:'BECFE0'};const B={top:bd,bottom:bd,left:bd,right:bd};
function table(widths,head,rows,opt={}){
  const mk=(txt,w,fill,bold,al)=>new TableCell({width:{size:w,type:WidthType.DXA},borders:B,verticalAlign:VerticalAlign.CENTER,shading:{type:ShadingType.CLEAR,color:'auto',fill},margins:{top:70,bottom:70,left:110,right:110},children:[new Paragraph({alignment:al||AlignmentType.LEFT,spacing:{line:240,before:0,after:0},children:runs(String(txt),{size:20,bold,color:bold&&fill==='F0F4F8'?NAVY:undefined})})]});
  const tr=[new TableRow({tableHeader:true,cantSplit:true,children:head.map((h,i)=>mk(h,widths[i],'F0F4F8',true))})];
  rows.forEach((r,ri)=>tr.push(new TableRow({cantSplit:true,children:r.map((c,i)=>mk(c,widths[i],ri%2?'F7F9FB':'FFFFFF',false,(opt.right&&opt.right.includes(i))?AlignmentType.RIGHT:AlignmentType.LEFT))})));
  return new Table({width:{size:widths.reduce((a,b)=>a+b,0),type:WidthType.DXA},columnWidths:widths,rows:tr});
}
const legend=(t)=>new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:80,after:200,line:240},children:[new TextRun({text:t,italics:true,size:20,font:'Times New Roman'})]});
const alinea=(t)=>new Paragraph({alignment:AlignmentType.JUSTIFIED,spacing:{line:360,before:0,after:120},indent:{left:709,hanging:425},children:runs(t)});
const C=[];
const ID='Processo nº 0180008-46.2026.8.05.0001';
C.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:160,line:276},children:[new TextRun({text:'EXCELENTÍSSIMA SENHORA DOUTORA JUÍZA DE DIREITO DA 6ª VSJE DO CONSUMIDOR (VESPERTINO) DA COMARCA DE SALVADOR/BA',bold:true,size:24,font:'Times New Roman'})]}));
C.push(new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:3,color:'CCCCCC',space:1}},spacing:{after:160},children:[]}));
['**'+ID+'**','**Recorrente:** SHEILA CRISTINA BARRETO VIEIRA','**Recorrida:** XP INVESTIMENTOS CORRETORA DE CÂMBIO, TÍTULOS E VALORES MOBILIÁRIOS S/A'].forEach(t=>C.push(plain(t,{after:60,align:AlignmentType.LEFT})));
C.push(Esp(240));
C.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:80},children:[new TextRun({text:'RECURSO INOMINADO',bold:true,color:NAVY,size:30,font:'Times New Roman'})]}));
C.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:280},children:[new TextRun({text:'arts. 41 e 42 da Lei 9.099/95 — pedido de gratuidade da justiça (art. 99, § 7º, do CPC) e de juízo de retratação (art. 485, § 7º, do CPC)',italics:true,size:22,font:'Times New Roman'})]}));
C.push(new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:6,color:NAVY,space:1}},spacing:{after:200},children:[]}));

C.push(H1('Petição de interposição'));
C.push(body('**SHEILA CRISTINA BARRETO VIEIRA**, já qualificada, vem, por seu advogado, com fundamento nos arts. 41 e 42 da Lei 9.099/95, interpor **RECURSO INOMINADO** contra a **sentença de extinção** (Id. 206482987), que julgou extinto o processo, sem resolução do mérito, com base no art. 485, I, do CPC, por suposta ausência de comprovante de residência. Requer que o recurso seja recebido, **dispensado o preparo** em razão do pedido de gratuidade da justiça, comprovado nesta peça (art. 99, § 7º, do CPC), e que, **não havendo retratação** (art. 485, § 7º, do CPC), seja remetido à Egrégia Turma Recursal, com as razões a seguir.'));
C.push(plain('Nestes termos, pede deferimento.',{align:AlignmentType.LEFT,indent:{firstLine:709},after:60}));
C.push(plain('Salvador/BA, ___ de outubro de 2026.',{align:AlignmentType.LEFT,indent:{firstLine:709},after:200}));

C.push(H1('Razões do recurso inominado'));
C.push(plain('**Egrégia Turma Recursal, Colenda Câmara, Eminentes Julgadores,**',{align:AlignmentType.LEFT,after:160}));

C.push(H2('I — Admissibilidade'));
C.push(body('**Cabimento e interesse.** A sentença extinguiu o processo sem resolução do mérito e é impugnável por recurso inominado (art. 41 da Lei 9.099/95). A Recorrente é parte vencida: sofreu a extinção de sua ação, que busca a declaração de inexistência de relação jurídica relativa a conta bancária aberta sem sua autorização e a reparação dos danos.'));
C.push(body('**Tempestividade.** O prazo é de 10 (dez) dias úteis (art. 42 da Lei 9.099/95 c/c art. 219 do CPC e Enunciado 165 do FONAJE), contados da intimação da sentença (Id. 206482987), de modo que o recurso é tempestivo.'));
C.push(body('**Preparo.** A Recorrente requereu a gratuidade da justiça desde a inicial (declaração de hipossuficiência — Id. 203480515, Pág. 14), e o pedido não foi indeferido nem apreciado. Nos termos do art. 99, § 7º, do CPC, "requerida a gratuidade da justiça em recurso, o recorrente estará dispensado de comprovar o recolhimento do preparo", cabendo ao relator apreciar o pedido e, se o indeferir, fixar prazo para o recolhimento. A comprovação da insuficiência de recursos consta do tópico V, instruída com o **Histórico de Créditos do INSS (Doc. 1)**.'));
C.push(body('**Inexistência de fato impeditivo.** Na data de 29/09/2026, foi juntada a petição de Id. 206704108, que informa "abrir mão do prazo recursal". Como essa peça poderia ser invocada como renúncia ou aceitação da sentença (arts. 999 e 1.000 do CPC), a questão é enfrentada **em preliminar** (tópico III), a demonstrar que ela não obsta o recurso.'));

C.push(H2('II — Síntese do processo'));
C.push(body('A Recorrente, viúva e pensionista do INSS, ajuizou em 15/08/2026 ação declaratória de inexistência de relação jurídica c/c obrigação de fazer e indenização por danos morais em face da Recorrida, em razão de conta bancária aberta em seu nome sem autorização, descoberta pelo Sistema Registrato do Banco Central (Id. 203480514). A inicial veio acompanhada de procuração, declaração de hipossuficiência, documento de identidade, **comprovante de residência (Id. 203480517)**, requerimento administrativo e relatório (Id. 203480515 a 203480519).'));
C.push(body('Em 18/08/2026, a decisão de Id. 203629555 (Págs. 27–28) afirmou que "o comprovante de residência juntado no evento nº 01 está em dissonância com o previsto no art. 1º da Lei 6.629/79" e determinou a juntada, em 5 dias, de "comprovante de residência emitido nos últimos 90 (noventa) dias por órgão público ou concessionária de serviços públicos, tais como conta de água, telefonia (telefone fixo, Wi-fi ou serviços de TV) ou de energia elétrica, ou gás encanado", sob pena de indeferimento da inicial. A decisão, contudo, **não indicou em que consistiria a "dissonância"**. A Recorrida compareceu, manifestou-se sobre a liminar (Id. 203987465) e contestou o mérito (Id. 206531014), sem qualquer questionamento sobre o endereço da Autora.'));
C.push(body('Em 26/09/2026, a sentença (Id. 206482987, Pág. 74) extinguiu o feito, por considerar que a Autora, "intimada para apresentar comprovante de endereço válido, permaneceu silente", e que a ausência do documento "impede a adequada verificação do endereço". É esse o ato recorrido.'));

C.push(H2('III — Preliminar: a petição de 29/09/2026 (Id. 206704108) não é renúncia nem aceitação da sentença'));
C.push(body('A petição de Id. 206704108 diz, em uma única frase, que a parte autora, "em atendimento ao despacho de fls., informa que abre mão do prazo recursal". Ela **não impede** este recurso, pelas razões a seguir.'));
C.push(body('**Primeiro**, a petição **não declara renúncia ao direito de recorrer** (art. 999 do CPC) nem aceita o conteúdo da sentença; refere-se a "abrir mão do prazo", o que não equivale a abrir mão do próprio direito. Os atos de disposição de direitos processuais, que implicam perda de uma garantia constitucional (art. 5º, LV, da CF/88), exigem manifestação **inequívoca** e se interpretam restritivamente; na dúvida, prevalece o direito ao recurso e à primazia do julgamento de mérito (arts. 4º e 6º do CPC; art. 2º da Lei 9.099/95).'));
C.push(body('**Segundo**, a petição invoca um "despacho de fls." **que não existe nos autos**: não há despacho nem determinação judicial que mandasse a Autora manifestar-se sobre recurso. A referência a ato inexistente evidencia que se trata de **peça padronizada protocolada por equívoco**, como indica, ainda, o seu registro no sistema sob o tipo "Petição Inicial". Um equívoco material de protocolo não pode produzir o efeito grave de impedir a Autora de recorrer de sentença que a priva, sem exame do mérito, da tutela que busca.'));
C.push(body('**Terceiro**, a aceitação tácita pressupõe "a prática, sem nenhuma reserva, de ato incompatível com a vontade de recorrer" (art. 1.000, parágrafo único, do CPC). Não há incompatibilidade entre a petição e a vontade da Autora, que é patente: o recurso é interposto **dentro do prazo comum**, sem que a Recorrida tenha adquirido qualquer direito, sem contrapartida e sem acordo. A sentença não transitou em julgado. Nenhuma boa-fé objetiva foi violada nem expectativa legítima foi criada (art. 5º do CPC): inexiste prejuízo à parte contrária que justifique a preclusão.'));
C.push(body('**Em síntese**, o ato é manifestamente equivocado e não traduz vontade de renunciar, o que esta peça, apresentada dentro do prazo, esclarece. Requer-se seja declarado que a petição de Id. 206704108 **não configura renúncia nem aceitação** e seja conhecido o recurso.'));
C.push(cons('conhecimento do recurso, inexistente fato impeditivo (arts. 999 e 1.000 do CPC).'));

C.push(H2('IV — Mérito: o comprovante exigido já constava dos autos'));
C.push(H2('IV.1 — O documento atende, ponto a ponto, ao que o próprio Juízo exigiu'));
C.push(body('O Juízo exigiu comprovante de residência (i) **emitido nos últimos 90 dias**, (ii) por **órgão público ou concessionária de serviços públicos**, "tais como conta de água, **telefonia** (telefone fixo, Wi-fi ou serviços de TV) ou energia elétrica, ou gás encanado". Foi juntada, desde a distribuição, **fatura de telefonia da Vivo (Telefônica Brasil S.A.) em nome da Recorrente** (Id. 203480517, Págs. 17–21). O confronto é este:'));
C.push(table([2300,3900,2826],['Requisito da decisão (Id. 203629555)','O que o documento comprova','Fonte'],[
['Titularidade','Fatura em nome de **SHEILA CRISTINA BARRETO VIEIRA**, a própria Autora; sem necessidade de declaração de terceiro','Id. 203480517, Pág. 17'],
['Endereço','"2ª Tv. na 2 de Julho, 11, Fazenda Grande do Retiro, CEP 40350-143, Salvador/BA": **idêntico** ao da qualificação na inicial, na procuração, na declaração de hipossuficiência e no cadastro do Projudi','Id. 203480517, Pág. 17; Id. 203480515, Págs. 13–14'],
['Emitente','Telefônica Brasil S.A. (Vivo), CNPJ 02.558.157/0001-62, prestadora de serviço de telecomunicações; conta nº 00001378228798','Id. 203480517, Pág. 17'],
['Natureza','Serviço de **telefonia** (plano Vivo Controle), um dos tipos expressamente indicados na decisão','idem'],
['Prazo de 90 dias','Referência 05/2026 (período de 25/04 a 24/05/2026); **vencimento em 10/06/2026**','idem'],
]));
C.push(legend('Quadro 1 — Requisitos da decisão de 18/08/2026 × documento juntado'));
C.push(body('Quanto ao **prazo**, a contagem em relação às datas relevantes é a seguinte:'));
C.push(table([4300,2363,2363],['Marco','Data','Dias após o vencimento (10/06/2026)'],[
['Distribuição da ação (juntada do documento)','15/08/2026','66'],
['Decisão que exigiu novo comprovante','18/08/2026','69'],
['Início da janela de 90 dias anterior à decisão','20/05/2026','—'],
['Fim do período de apuração da fatura','24/05/2026','posterior ao início da janela'],
],{right:[1,2]}));
C.push(legend('Quadro 2 — Contagem do prazo de 90 dias'));
C.push(body('Em qualquer marco razoável (ajuizamento ou decisão), a fatura está dentro dos 90 dias: o vencimento (10/06/2026) ocorreu 66 dias antes da distribuição e 69 dias antes da decisão, e o próprio período de apuração da fatura (encerrado em 24/05/2026) é posterior ao início da janela (20/05/2026). Já a fatura, de referência mensal, só pode ter sido emitida após o fim do período de apuração, e portanto dentro da janela. Eventual contagem do prazo de 90 dias até a **sentença** (26/09/2026) é indevida: o prazo de que tratava a decisão era o da exigência de **comprovante "emitido nos últimos 90 dias"** relativamente ao momento em que o documento foi exigido, não à data em que, meses depois, o Juízo viesse a sentenciar.'));
C.push(body('Quanto à natureza, a decisão fala em "telefonia (telefone fixo, Wi-fi ou serviços de TV)" em rol **exemplificativo** ("tais como"). A telefonia móvel é, igualmente, serviço de telefonia, e é, em larga medida, o único serviço de telefonia contratado pela população de baixa renda; exigir exclusivamente telefone fixo, Wi-fi ou TV seria restrição que a decisão não impôs e que a Lei 6.629/79, no rol de comprovantes que contempla, também não faz: a conta de telefone é expressamente admitida. A fatura não foi emitida por terceiros, mas pela prestadora, em nome da Autora.'));
C.push(cons('o documento exigido pela decisão **já estava nos autos** e atendia a todos os seus requisitos; não havia o que cumprir.'));

C.push(H2('IV.2 — A decisão de 18/08/2026 não indicou a suposta "dissonância" (art. 321 do CPC)'));
C.push(body('A determinação de emenda deve "indicar com precisão o que deve ser corrigido ou completado" (art. 321 do CPC), e toda decisão judicial deve ser fundamentada (art. 93, IX, da CF/88; art. 489, § 1º, do CPC). A decisão limitou-se a afirmar que o documento do evento 1 "está em dissonância" com o art. 1º da Lei 6.629/79, sem apontar **qual** requisito faltaria: o titular? o endereço? a data? a natureza do serviço? Nenhum deles está ausente (Quadro 1). Sem essa indicação, a parte não tem como saber o que corrigir e o recurso, o que impugnar; a extinção com base em descumprimento de uma ordem que não explicitou sua própria premissa viola o contraditório e a ampla defesa (art. 5º, LV, da CF/88; art. 10 do CPC). Não por outra razão a sentença, ao se referir ao que "permaneceu silente", **não afirma que o documento juntado seja inválido** — apenas que a parte nada acrescentou.'));
C.push(body('A Recorrente, que já havia juntado documento que entendia atender ao requisito legal, não "permaneceu silente" por desídia: o documento solicitado já constava dos autos. Exigir a juntada de novo exemplar do mesmo documento seria **ato inútil**, contrário aos princípios da economia processual, da simplicidade e da informalidade que regem os Juizados (art. 2º da Lei 9.099/95).'));
C.push(cons('a decisão não precisou o vício, e a sentença extinguiu o feito por descumprimento de ordem cujo objeto já estava cumprido; impõe-se a cassação.'));

C.push(H2('IV.3 — Ainda que fosse insuficiente, a extinção seria desproporcional'));
C.push(body('A comprovação do endereço não é pressuposto processual cuja ausência justifique a extinção de ação em que a parte ré **já foi citada, compareceu, contestou e se manifestou sobre a liminar** sem jamais questionar o endereço da Autora. O art. 319, II, do CPC exige a indicação do domicílio na inicial, e seus §§ 2º e 3º são claros: a inicial "não será indeferida" se for possível a citação do réu ou se a obtenção das informações tornar impossível ou excessivamente oneroso o acesso à justiça. O endereço está informado na inicial, na procuração e na declaração de hipossuficiência (Id. 203480515, Págs. 13–14), esta firmada "sob as penas da lei" e, portanto, com a presunção de veracidade da **Lei 7.115/83** (art. 1º). A Lei 6.629/79, por sua vez, disciplina a comprovação de residência perante autoridades para emissão de documentos públicos e, de todo modo, admite a conta de telefone. Nos Juizados, "não se pronunciará qualquer nulidade sem que tenha havido prejuízo" (art. 13, § 1º, da Lei 9.099/95), e o processo deve orientar-se pelos critérios da simplicidade, da informalidade e da economia (art. 2º). **Nenhum prejuízo** foi sequer alegado pela Recorrida.'));
C.push(body('Ainda que o Juízo pudesse, em tese, exigir documento adicional para evitar litigância predatória, tal providência só se legitima se **fundamentada**, razoável e em contexto que a justifique, o que não ocorreu: trata-se de ação individual, com documentos que comprovam a contratação questionada, requerimento administrativo prévio, relatório do Registrato e contestação já apresentada. A extinção do processo é a mais gravosa das respostas e deve ser reservada aos casos em que não há outro caminho; aqui, o próprio documento exigido estava nos autos.'));
C.push(cons('a sentença, ao extinguir o feito sem prejuízo demonstrado e com documento já presente, contraria os arts. 2º e 13, § 1º, da Lei 9.099/95 e o art. 319, §§ 2º e 3º, do CPC.'));

C.push(H2('IV.4 — Efeito do provimento'));
C.push(body('Cassada a sentença, os autos devem retornar ao Juízo de origem para regular prosseguimento, já tendo havido citação e contestação: apreciação do pedido de tutela de urgência (Id. 203629555, que reservou sua análise ao cumprimento da exigência) e instrução. Não se aplica o art. 1.013, § 3º, do CPC, pois o mérito não foi examinado nem a causa está madura para julgamento nesta instância.'));

C.push(H1('V — Gratuidade da justiça: comprovação da insuficiência de recursos'));
C.push(body('A Recorrente é pensionista, viúva, e declarou, sob as penas da lei, não ter condições de arcar com as despesas do processo sem prejuízo do próprio sustento (Id. 203480515, Pág. 14). Para os fins do art. 99, § 3º, do CPC, essa declaração goza de presunção de veracidade, e o § 2º do mesmo artigo somente permite o indeferimento quando houver nos autos elementos que evidenciem a falta dos pressupostos. Longe disso, o **Histórico de Créditos do INSS (Doc. 1)** — emitido em 04/09/2026, autenticável em meu.inss.gov.br/central com o código **2609040MN2-ZGRGNZNQ139** — confirma a condição de hipossuficiência:'));
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
C.push(legend('Quadro 3 — Composição do benefício previdenciário (Histórico de Créditos, Doc. 1)'));
C.push(body('Os dados demonstram que (i) a única fonte de renda comprovada da Recorrente é uma pensão por morte de **um salário mínimo**; (ii) **R$ 729,39 (45%)** são consumidos por descontos consignados em seis rubricas, restando-lhe **R$ 891,61** líquidos para a subsistência — importância inferior a um salário mínimo; e (iii) a Recorrente é parte, justamente, em ação que discute abertura de conta bancária que não autorizou, o que reforça sua condição de consumidora vulnerável. Destinar parte dessa renda ao pagamento de preparo comprometeria o sustento, o que é exatamente a situação que o art. 98 do CPC e o art. 5º, LXXIV, da CF/88 buscam evitar. Requer-se, portanto, a concessão da gratuidade da justiça, com dispensa do preparo recursal (art. 99, § 7º, do CPC); subsidiariamente, caso se entenda de modo diverso, a fixação de prazo para recolhimento, nos termos do mesmo dispositivo, sem deserção.'));

C.push(H1('VI — Pedidos'));
C.push(body('Ante o exposto, requer a Recorrente:'));
[
'a)\tO **recebimento do recurso** no efeito devolutivo e a **concessão da gratuidade da justiça**, com dispensa do preparo (art. 99, § 7º, do CPC), à vista da declaração de hipossuficiência e do Histórico de Créditos do INSS (Doc. 1);',
'b)\tO **juízo de retratação** pelo Juízo de origem, na forma do art. 485, § 7º, do CPC, reconhecendo que o comprovante de residência exigido já constava dos autos (Id. 203480517) e determinando o prosseguimento do feito;',
'c)\tNão havendo retratação, a **remessa à Egrégia Turma Recursal**, com o **conhecimento do recurso**, declarando-se que a petição de Id. 206704108 **não configura renúncia nem aceitação** da sentença (arts. 999 e 1.000 do CPC);',
'd)\tNo mérito, o **provimento do recurso**, para **cassar a sentença** de Id. 206482987, reconhecendo-se que o comprovante de residência exigido já estava nos autos e atendia aos requisitos da decisão de 18/08/2026, e determinar o retorno dos autos à origem para o regular processamento, com a apreciação da tutela de urgência e a instrução do feito;',
'e)\tSubsidiariamente, caso se entenda insuficiente o documento, a **anulação da sentença** por ausência de indicação precisa do vício (art. 321 do CPC) e a concessão de prazo à Recorrente para complementação, sem extinção do processo (arts. 321, 932, parágrafo único, do CPC);',
'f)\tA ausência de condenação em custas e honorários (art. 55 da Lei 9.099/95), por ser a Recorrente beneficiária da gratuidade;',
'g)\tQue as intimações sejam realizadas exclusivamente em nome do advogado **CLEYTON DA SILVA BARBOSA, OAB/BA 92.148 e OAB/MS 17.311**, sob pena de nulidade (art. 272, § 5º, do CPC).'
].forEach(t=>C.push(alinea(t)));
C.push(plain('**Documento anexo:** Doc. 1 — Histórico de Créditos do INSS (NB 158.754.955-4), emitido em 04/09/2026.',{align:AlignmentType.LEFT,after:200}));
C.push(plain('Nestes termos, pede deferimento.',{align:AlignmentType.LEFT,indent:{firstLine:709},after:60}));
C.push(plain('Salvador/BA, ___ de outubro de 2026.',{align:AlignmentType.LEFT,indent:{firstLine:709},after:400}));
C.push(plain('CLEYTON DA SILVA BARBOSA',{align:AlignmentType.CENTER,after:0,bold:true}));
C.push(plain('OAB/BA 92.148 — OAB/MS 17.311',{align:AlignmentType.CENTER,after:0}));
const doc=new Document({styles:{default:{document:{run:{font:'Times New Roman',size:24}}}},
 sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1418,bottom:1134,left:1701,right:1134}}},
 footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:ID+' — Recurso Inominado — página ',size:18,font:'Times New Roman'}),new TextRun({children:[PageNumber.CURRENT],size:18,font:'Times New Roman'}),new TextRun({text:' de ',size:18,font:'Times New Roman'}),new TextRun({children:[PageNumber.TOTAL_PAGES],size:18,font:'Times New Roman'})]})]})},
 children:C}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync('recurso_inominado.docx',b);console.log('ok',b.length)});
