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
// Folha de rosto
C.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:160,line:276},children:[new TextRun({text:'EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA 2ª VARA DO SISTEMA DOS JUIZADOS ESPECIAIS DA COMARCA DE ILHÉUS/BA',bold:true,size:24,font:'Times New Roman'})]}));
C.push(new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:3,color:'CCCCCC',space:1}},spacing:{after:160},children:[]}));
['**Processo nº 0014927-30.2026.8.05.0103**','**Autora:** JACIARA SANTOS DE JESUS','**Ré:** BANCO MERCANTIL DO BRASIL S.A.'].forEach(t=>C.push(plain(t,{after:60,align:AlignmentType.LEFT})));
C.push(Esp(240));
C.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:80},children:[new TextRun({text:'IMPUGNAÇÃO À CONTESTAÇÃO',bold:true,color:NAVY,size:30,font:'Times New Roman'})]}));
C.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:280},children:[new TextRun({text:'art. 437 do CPC c/c art. 6º, VIII, do CDC e art. 373, II, do CPC',italics:true,size:22,font:'Times New Roman'})]}));
C.push(new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:6,color:NAVY,space:1}},spacing:{after:200},children:[]}));

C.push(body('**JACIARA SANTOS DE JESUS**, já qualificada nos autos da **AÇÃO REVISIONAL** que move em face de **BANCO MERCANTIL DO BRASIL S.A.**, vem, por seu advogado, apresentar **IMPUGNAÇÃO À CONTESTAÇÃO** (Id. 205921995, Págs. 34–53), o que faz **ponto a ponto, na exata ordem dos argumentos deduzidos pela parte ré**, pelas razões a seguir.'));

C.push(H1('I — Síntese e mapa dos argumentos da contestação'));
C.push(body('A Ré articulou cinco preliminares e seis razões de improcedência. Todas são enfrentadas abaixo, na ordem em que aparecem na contestação, conforme o mapa:'));
C.push(table([560,3900,1100,3466],['#','Argumento da Ré','Pág.','Rebatido na seção'],[
['1','Incompetência do JEC (perícia contábil)','35–36','III.1'],
['2','Irregularidade da procuração (ZapSign / não ICP-Brasil)','36–39','III.2'],
['3','Ausência de interesse de agir','39–40','III.3'],
['4','Fracionamento injustificado de ações','41–42','III.4'],
['5','Conexão','42','III.5'],
['6','Regularidade da taxa de juros / perfil de risco / ônus da autora','43–46','IV.B, IV.C'],
['7','Legalidade da capitalização','47','IV.D'],
['8','Imprestabilidade da "Calculadora do Cidadão"','47–48','IV.E'],
['9','Inexistência de dano material; impossibilidade de restituição em dobro','48–49','IV.F'],
['10','Inexistência de dano moral','49–50','IV.G'],
['11','Impossibilidade de inversão do ônus da prova','50–51','IV.H'],
['12','Omissões: tutela de urgência e demais fatos da inicial','—','IV.I e art. 341 do CPC'],
]));
C.push(legend('Quadro 1 — Mapa de argumentos da contestação (Id. 205921995)'));

C.push(H1('II — Retificação dos números da inicial com base no contrato juntado pela Ré'));
C.push(body('A inicial e a memória de cálculo que a acompanha (Id. 204565269) foram elaboradas **sem acesso ao instrumento contratual**, a partir de telas de aplicativo. O próprio laudo ressalva, em sua seção 6, que a parcela de R$ 543,91 foi "reconstituída pela fórmula de Price" e "deve ser confirmada contra o extrato/boleto real". A Ré, ao contestar, juntou o instrumento (Id. 205921999, Págs. 107–109) e **confirmou os dados reais** (Id. 205921995, Pág. 43). Cumpre à Autora, por lealdade processual, **ajustar os números aos documentos da própria Ré**, que prevalecem por serem a fonte primária e por constituírem admissão:'));
C.push(table([2900,2050,2050,2026],['Elemento','Inicial / laudo','Contrato da Ré','Fonte'],[
['Valor financiado','R$ 4.598,72','R$ 4.598,72','Id. 205921999, Pág. 107'],
['Parcela','R$ 543,91 (reconstituída)','**R$ 605,12**','Id. 205921999, Pág. 107; Contest. Pág. 43'],
['Nº de parcelas / 1º vencimento','36 / nov-2025','36 / **dez-2025**','Id. 205921999, Pág. 107'],
['Total a pagar','R$ 19.580,76 (calculado)','**R$ 21.784,32**','Id. 205921999, Pág. 107'],
['Taxa mensal / anual','11,60% / 273,22%','11,60% / 273,22%','idem'],
['CET mensal / anual','11,73% (laudo)','11,73% / 285,40%','idem'],
['Líquido creditado ao cliente','R$ 1.452,48 (laudo)','**R$ 542,88**','idem'],
['Taxa média Bacen na contratação','6,00%','6,00% (admitida pela Ré)','Contest. Pág. 43'],
]));
C.push(legend('Quadro 2 — Dados da inicial confrontados com o contrato e a contestação'));
C.push(body('Os dados reais **agravam, e não atenuam**, o excesso: a parcela efetivamente cobrada é 11,2% maior que a reconstituída. Registre-se ainda que a inicial (itens 2.2, 4.4, 4.8 e pedidos "c", "g" e "h") contém referências cruzadas de outros contratos da mesma beneficiária (taxa média de 4,50%, competência "set/2020", parcela de R$ 47,92, excesso global de R$ 2.328,92). Trata-se de **erro material de transcrição**, sem qualquer reflexo na causa de pedir — que é a taxa de 11,60% a.m. do contrato nº 998001031438 frente à média de 6,00% — e que fica **expressamente corrigido** pelos valores desta peça, todos extraídos dos documentos da Ré.'));

C.push(H1('III — Preliminares'));
C.push(H2('III.1 — Incompetência do Juizado Especial (perícia contábil)'));
C.push(body('A Ré sustenta que a análise da taxa exigiria perícia contábil (Pág. 35–36). Invoca o Enunciado 54 do FONAJE, segundo o qual a complexidade é aferida "pelo objeto da prova". É precisamente por esse critério que a preliminar cai: **não há prova técnica a produzir**. O objeto da prova se resume a (i) o contrato, **juntado pela própria Ré**; (ii) a taxa média do Banco Central, **fato público e oficial, admitido pela Ré** em sua contestação ("a taxa média do mercado era de 6.00%, segundo os dados do BACEN" — Pág. 43); e (iii) operação aritmética da Tabela Price, que o Juízo domina e que qualquer contador do foro refaz em minutos. Não existe fato controvertido a exigir perito: todos os números relevantes foram **confessados** (art. 374, II e III, do CPC).'));
C.push(body('Ainda que se entendesse necessário algum auxílio técnico, a Lei 9.099/95 o admite em formato compatível com o rito (art. 35: inquirição de técnico de confiança do Juízo e parecer técnico das partes, que aqui já consta como memória de cálculo — Id. 204565269). A tese da Ré, levada a sério, afastaria dos Juizados **toda e qualquer** ação revisional de taxa, o que a lei não prevê: a competência do art. 3º da Lei 9.099/95 é fixada pelo valor (até 40 salários mínimos) e pela matéria, e a causa, de R$ 14.657,84, está bem abaixo do teto. Os precedentes do TJSP citados (notas 3, 4 e 6) tratam de casos em que havia controvérsia sobre encargos e metodologia de cálculo; aqui não há — a Ré **sequer apresentou contra-cálculo**.'));
C.push(cons('rejeição da preliminar, com manutenção da competência deste Juizado (art. 3º da Lei 9.099/95; Enunciado 54 do FONAJE; art. 374, II e III, do CPC).'));

C.push(H2('III.2 — Regularização da procuração (assinatura ZapSign)'));
C.push(body('A impugnação não procede por quatro razões independentes. **Primeira:** no Juizado Especial "o mandato ao advogado poderá ser verbal, salvo quanto aos poderes especiais" (art. 9º, § 3º, da Lei 9.099/95). O rito dispensa o formalismo que a Ré pretende importar do CPC. **Segunda:** o art. 105, § 1º, do CPC admite procuração assinada digitalmente "na forma da lei", e a lei não restringe a assinatura eletrônica à ICP-Brasil: a Lei 14.063/2020 (art. 4º) reconhece as assinaturas eletrônicas simples e avançada, e o próprio art. 10, § 2º, da MP 2.200-2/2001, invocado pela Ré, admite "outro meio de comprovação da autoria e integridade de documentos em forma eletrônica, inclusive os que utilizem certificados não emitidos pela ICP-Brasil, desde que admitido pelas partes como válido ou aceito pela pessoa a quem for oposto o documento". **Terceira:** o relatório de assinaturas anexo à procuração registra token, e-mail, telefone, IP, geolocalização e dispositivo da outorgante, e consigna "INTEGRIDADE CERTIFICADA – ICP-BRASIL" (Id. 204565264, Pág. 14). **Quarta:** a Ré **não nega** que a outorgante seja a Autora, **não alega falsidade** nem sustenta que a Autora não conferiu mandato; discute apenas a forma da assinatura, o que não compromete a existência do mandato.'));
C.push(body('Quanto à alegada "generalidade", o instrumento outorga poderes para o foro em geral e poderes especiais (transigir, desistir, receber e dar quitação, renunciar ao excedente do limite da Lei 9.099/95) e menciona expressamente a propositura de ações sobre "Empréstimos Pessoais" e repetição de indébito (Id. 204565263, Pág. 12–13). O art. 105 do CPC exige poderes especiais apenas para os atos que enumera — todos presentes. Subsidiariamente, o vício de representação é **sanável** (art. 76, § 1º, do CPC): a consequência de eventual irregularidade seria prazo para regularização, jamais extinção. A Autora, **por cautela e sem reconhecer qualquer vício**, juntará, se o Juízo assim entender, instrumento com assinatura certificada, ou ratificará o mandato em audiência (art. 9º, § 3º, Lei 9.099/95). Fica **impugnado** o pedido de responsabilização do patrono (art. 104, § 2º, CPC), manifestamente descabido.'));
C.push(cons('rejeição da preliminar; subsidiariamente, concessão de prazo para regularização, nunca extinção (art. 76, § 1º, CPC).'));

C.push(H2('III.3 — Ausência de interesse de agir'));
C.push(body('O interesse de agir é a necessidade e a utilidade do provimento. A necessidade está demonstrada **pela própria contestação**: a Ré não reconheceu a abusividade, não ofereceu revisão ou acordo e requereu a improcedência integral do pedido. Instaurou-se a pretensão resistida. A Constituição não condiciona o acesso ao Judiciário ao esgotamento de via administrativa privada (art. 5º, XXXV, da CF/88); a "tentativa de negociar pelo site" que a Ré aponta como requisito (nota 11) não encontra amparo em nenhuma norma. A suposta "ausência de perfil de crédito" na inicial não é matéria de interesse de agir, mas de mérito, tratada em IV.C.'));
C.push(body('A menção à Recomendação CNJ nº 159/2024 e ao "Tema 1.198/STJ" tampouco socorre a Ré. Essas diretrizes visam coibir **demandas predatórias**, caracterizadas por ausência de documentos, procurações genéricas e petições-modelo sem lastro. Aqui a inicial veio instruída com **procuração, declaração de hipossuficiência, documento de identidade, comprovante de residência, o contrato e memória de cálculo com fontes oficiais** (Id. 204565264 a 204565269), em ação ajuizada com valor certo e pedido específico. A inicial sequer necessitaria de emenda: o instrumento do contrato foi, depois, trazido pela própria Ré.'));
C.push(cons('rejeição da preliminar; subsidiariamente, o eventual prazo para emenda não importa extinção (art. 321 do CPC).'));

C.push(H2('III.4 — Fracionamento injustificado de ações'));
C.push(body('A Ré lista quatro processos (Pág. 41) e pede a extinção de três e a reunião de todos. A alegação não procede. **Cada ação tem por objeto um contrato distinto**, com número, data, valor, prazo e taxa próprios, como se vê da memória de cálculo (Id. 204565269, Págs. 25–30), que identifica contratos de números 998001031438 (06/10/2025; 11,60% a.m.), 998001043863 (15/10/2025; 15,19% a.m.) e 998001184290 (28/01/2026; 15,87% a.m.), entre outros. Cada contrato é um negócio jurídico autônomo, com taxa e cláusulas próprias; **a causa de pedir é diversa**, pois a abusividade se afere contrato a contrato, por confronto com a média do mês de cada contratação (REsp 1.061.530/RS). Não há fracionamento do que não é uma pretensão única.'));
C.push(body('A Ré **não demonstra** a alegada identidade de causa de pedir e de pedido nem aponta qual dos contratos seria o mesmo. O precedente que cita (nota 15) cuida de duas ações sobre **mesmo contrato** ou de "mesmas razões de direito, mesma causa de pedir e mesmo pedido". Ademais, a Ré pede a extinção de processos que são **autônomos e não estão em julgamento neste feito**: não cabe a esta ação decretar a extinção de outras. Por fim, o Comunicado CG nº 02/2017, do TJSP, é norma da corregedoria de outro tribunal, sem aplicação aqui.'));
C.push(cons('rejeição da preliminar; inexistência de fracionamento, por tratarem os feitos de contratos distintos (art. 485, I e V, do CPC inaplicável).'));

C.push(H2('III.5 — Conexão'));
C.push(body('A conexão (art. 55 do CPC) exige identidade de pedido **ou** de causa de pedir. Cada contrato é causa de pedir própria, com pedido de revisão de taxa distinta e valores próprios; o simples fato de a parte e a matéria jurídica serem as mesmas não gera conexão. Tampouco existe risco de decisões conflitantes: a revisão de um contrato a 11,60% a.m. e a de outro a 15,19% a.m. são conclusões compatíveis entre si. Observe-se, ainda, que a Ré **pede a reunião deste processo com ele mesmo**: o nº 0014927-30.2026.8.05.0103 consta da lista de processos a reunir "àquele que tramita sob o nº 0014927-30.2026.8.05.0103" (Págs. 34 e 42). A peça é, como se vê, modelo reaproveitado de outro feito, sem a necessária adaptação ao caso. A Súmula 235 do STJ ainda ressalva que a conexão não determina a reunião quando um dos processos já foi julgado.'));
C.push(body('Registre-se, **sem abrir mão da rejeição acima**, que a Autora não se opõe à reunião para julgamento conjunto apenas se o Juízo a entender conveniente à economia processual, desde que preservado o rito sumaríssimo e a individualização de cada contrato, com seus respectivos cálculos.'));
C.push(cons('rejeição da conexão; subsidiariamente, reunião sem prejuízo da individualização dos contratos.'));

C.push(H1('IV — Mérito'));
C.push(H2('IV.A — Confissões e fatos incontroversos'));
C.push(body('A contestação, redigida de forma genérica, é pródiga em admissões que a Ré faz **contra seu próprio interesse e a favor da Autora**. Pelo art. 389 do CPC há confissão quando a parte admite a verdade de fato contrário ao seu interesse e favorável ao adversário; a confissão judicial "faz prova contra o confitente" (art. 391) e fatos assim afirmados "não dependem de prova" (art. 374, II e III). O quadro abaixo sintetiza:'));
C.push(table([480,3500,2300,2746],['#','Fato admitido ou não impugnado','Onde','Efeito'],[
['1','O contrato nº 998001031438 foi firmado em 06/10/2025, no valor de R$ 4.598,72, em 36 parcelas, à taxa de **11,60% a.m.**','Contest. Pág. 43','Confissão: taxa pactuada e valor'],
['2','A parcela é de **R$ 605,12**','Contest. Pág. 43; Id. 205921999 Pág. 107','Confissão: base do cálculo do excesso'],
['3','**A taxa média de mercado, na data da contratação, era de 6,00%** segundo o Bacen','Contest. Pág. 43','Confissão: parâmetro do Tema 27/STJ'],
['4','A taxa pactuada é **superior à média** ("a simples fixação de uma taxa superior à média... não configura, automaticamente, abusividade") e equivale a 1,93 vez o referencial, o que a Ré quantifica ao dizer que "não atinge" três vezes','Contest. Págs. 44–45','Confissão: o excesso existe; a Ré discute apenas se ele basta'],
['5','A capitalização é **mensal** (Tabela Price) e o contrato cobra 273,22% a.a. contra 139,20% do duodécuplo','Contest. Pág. 47, nota 24; Id. 205921999 Págs. 107–108','Confissão: custo efetivo anual de 273,22%'],
['6','**Não há garantia** na operação','Contest. Pág. 45 (quadro de perfil)','Confissão: crédito sem garantia real; ver risco em IV.C'],
['7','A diferença entre o valor contratado e o creditado resulta de "tributos" e "dívidas anteriores"','Contest. Pág. 43, nota 16','Confissão: operação de renovação / rolagem de dívida'],
['8','Os descontos de empréstimos comprometem mais de 60% do benefício; contrato de adesão; ausência de informação qualificada; pedido de tutela de urgência','Inicial, itens 2.3, 3.1, 3.3, 4.8','**Não impugnados** (art. 341 do CPC)'],
['9','A Ré não juntou planilha de evolução, custo de captação, score, histórico de inadimplência, ofertas de outras instituições ou qualquer elemento do "perfil de crédito" que invoca','Contest., passim','Ausência de prova da tese da Ré (art. 373, II, do CPC)'],
]));
C.push(legend('Quadro 3 — Confissões e fatos incontroversos'));
C.push(cons('os fatos 1 a 8 estão provados por admissão da Ré; resta ao Juízo apenas o enquadramento jurídico, o que autoriza o julgamento antecipado do mérito (art. 355, I, do CPC).'));

C.push(H2('IV.B — O excesso de juros: demonstração aritmética'));
C.push(body('O parâmetro de controle foi fixado pela Segunda Seção do STJ no REsp 1.061.530/RS (Tema 27): admite-se a revisão dos juros remuneratórios quando a abusividade, capaz de colocar o consumidor em desvantagem exagerada (art. 51, § 1º, do CDC), fique demonstrada à luz das peculiaridades do caso concreto, tendo-se a taxa média do Bacen na data da contratação como referencial. A própria Ré invoca esse precedente (Pág. 43) e **fornece o referencial: 6,00%**. Veja-se o confronto, calculado pela Tabela Price com os dados do contrato da Ré:'));
C.push(table([2900,2050,2050,2026],['Parâmetro','Contrato (Ré)','Média Bacen (6,00%)','Régua 1,5× (9,00%)'],[
['Taxa mensal','**11,60%**','6,00%','9,00%'],
['Taxa anual efetiva','**273,22%**','101,22%','181,27%'],
['Múltiplo da taxa sobre a média','**1,93×**','1,00×','1,50×'],
['Parcela (36×)','**R$ 605,12**','R$ 332,85','R$ 471,21'],
['Total a pagar (36 parcelas)','**R$ 21.784,32**','R$ 11.982,60','R$ 16.963,56'],
['Excesso mensal sobre a parcela cobrada','—','R$ 272,27','R$ 133,91'],
['Excesso global (36 parcelas)','—','**R$ 9.801,72**','R$ 4.820,76'],
],{right:[1,2,3]}));
C.push(legend('Quadro 4 — Taxa pactuada × taxa média do Bacen × régua de 1,5× (Tabela Price, n = 36, PV = R$ 4.598,72)'));
C.push(body('**Metodologia reprodutível.** Parcela = PV·i / [1 − (1+i)^(−n)], com PV = R$ 4.598,72 e n = 36. O único parâmetro não expresso no contrato é o prazo de carência entre a contratação (06/10/2025) e o 1º vencimento (dezembro/2025), que o contrato embute no financiamento: ele foi extraído do próprio instrumento e calibrado de modo a reproduzir exatamente a parcela de R$ 605,12 cobrada pela Ré à taxa de 11,60% a.m. (≈ 0,97 mês adicional); **o mesmo período de carência foi aplicado ao recálculo à taxa média**, de modo que a comparação é homogênea e conservadora. A memória da inicial (Id. 204565269), calculada sem essa carência e sobre a parcela reconstituída, apurou parcela revisada de R$ 314,53; o cálculo agora apresentado, com os dados reais da Ré, é **mais prudente** (parcela revisada maior, R$ 332,85).'));
C.push(body('**A abusividade não decorre apenas do múltiplo de 1,93.** O STJ, no mesmo Tema 27, manda considerar as peculiaridades do caso. Elas aqui são todas contra a Ré:'));
C.push(table([480,4400,4146],['#','Peculiaridade (dos documentos da Ré)','Fonte'],[
['1','Taxa de 273,22% a.a. e CET de 285,40% a.a.; **total a pagar de R$ 21.784,32 para um valor financiado de R$ 4.598,72 (4,74 vezes)**','Id. 205921999, Pág. 107'],
['2','Dos R$ 4.598,72 financiados, **só R$ 542,88 (11,8%) foram creditados** à Autora; R$ 3.095,52 (67,3%) quitaram três contratos anteriores com a própria Ré (nº 998000433565, 998000475113 e 998000689374), R$ 909,60 (19,8%) foram **seguro prestamista financiado** e R$ 50,72 (1,1%), IOF','idem'],
['3','Operação de **renovação**, sobre benefício previdenciário, com autorização de débito em conta mantida na própria Ré','Id. 205921999, Págs. 107–108'],
['4','Ausência de qualquer prova de inadimplência, restrição cadastral ou risco concreto da Autora','Contest., passim'],
]));
C.push(legend('Quadro 5 — Peculiaridades do caso concreto (Tema 27/STJ)'));
C.push(cons('presentes as circunstâncias concretas exigidas pelo Tema 27/STJ, a taxa de 11,60% a.m. (1,93 vez a média de 6,00% e 29% acima da régua de 1,5×) é abusiva (art. 51, IV e § 1º, III, do CDC), impondo-se a revisão da cláusula de juros.'));

C.push(H2('IV.C — "Perfil de risco do autor" e ônus da prova (Págs. 44–46)'));
C.push(body('A Ré defende que a taxa se justifica pelo "alto risco" da Autora e que bastaria, ao Juízo, considerar o "perfil de crédito", cuja tabela (Pág. 45) **traz uma única linha: "Garantias ofertadas: Ausência de garantia"**. Nenhum score, histórico de relacionamento, restrição cadastral, inadimplência, custo de captação ou taxa de outra instituição foi apresentado, ainda que a Ré os detenha todos. O argumento é, ademais, **contraditório com os documentos que ela mesma juntou**:'));
C.push(alinea('a)\tO contrato é uma **renovação** que quitou três operações anteriores com a Ré (Id. 205921999, Pág. 107): há, portanto, relacionamento prévio e, não havendo prova de inadimplência, **histórico de adimplemento**. Foi a própria Ré que, na preliminar de interesse de agir, invocou "histórico de relacionamento" como elemento de análise (Pág. 34).'));
C.push(alinea('b)\tO risco de morte ou invalidez foi **transferido a uma seguradora** (Zurich Minas Brasil Seguros), mediante prêmio de R$ 909,60 **financiado pela Autora e remunerado por juros de 11,60% a.m.** (Id. 205921999, Págs. 107–108). Cobrar, simultaneamente, prêmio de seguro prestamista e juros que remunerariam o "alto risco" que o seguro cobre é remunerar duas vezes o mesmo risco.'));
C.push(alinea('c)\tO pagamento ocorre por **débito automático em conta** mantida pela Ré, que opera o crédito e tem acesso direto às entradas da conta (Id. 205921999, Pág. 108), o que reduz materialmente a probabilidade de inadimplência.'));
C.push(alinea('d)\tA "ausência de garantia" é característica **de toda a modalidade** de crédito pessoal não consignado, e portanto já está incorporada à taxa média de 6,00% que a Ré reconhece como referencial; não é fato que distinga a Autora do universo que compõe a média.'));
C.push(body('Tampouco procede a alegação de que o Bacen teria afirmado que a taxa média seria "alhos com bugalhos" (Págs. 43–44). O trecho transcrito do Parecer PGBC 256/2018 é opinião de órgão jurídico, que não vincula o Judiciário, e a média por modalidade é exatamente o instrumento que o STJ adotou no Tema 27 como referencial. A "heterogeneidade" da série (mínima de 0,13% e máxima de 21,52% em agosto de 2025, nota 20) não afasta a média; ao contrário, deixa claro que a taxa de 11,60% a.m. fica muito acima do ponto central. As ementas de 2ª instância transcritas, ao dizerem que duas ou três vezes a média **"por si só"** não configura abusividade, confirmam a tese da Autora: aqui o múltiplo **não é o único elemento**, mas se soma às peculiaridades do Quadro 5. E o precedente invocado (REsp 2.015.514/PR) concluiu, segundo a transcrição da própria Ré, que o Tribunal deve verificar "se as taxas de juros remuneratórios, na hipótese, revelam-se abusivas", exame que a presente impugnação faz com base em documentos.'));
C.push(body('Quanto ao **ônus da prova**, a Ré afirma que cabe à Autora "demonstrar que outras instituições ofertaram condições mais vantajosas". Essa exigência não consta do Tema 27 e é impossível de cumprir pelo consumidor: é a instituição que detém os dados de captação, score e inadimplência. A Autora cumpriu seu encargo (art. 373, I, do CPC) ao provar o contrato, a taxa pactuada e a taxa média oficial, por documentos da Ré e do Bacen; competia à Ré provar fatos impeditivos, modificativos ou extintivos (art. 373, II) — **que o "perfil de risco" da Autora justifica 1,93 vez a média** —, o que não fez. Quanto à inversão do ônus, ver IV.H.'));
C.push(cons('a Ré não provou o suposto risco diferenciado e os documentos que juntou o contradizem; ausente justificativa, prevalece o juízo de abusividade do item IV.B (art. 373, II, do CPC).'));

C.push(H2('IV.D — Capitalização de juros (Pág. 47)'));
C.push(body('A Ré defende a legalidade da capitalização mensal (art. 28, § 1º, I, da Lei 10.931/2004; Súmulas 539 e 541 do STJ) e afirma que o contrato a prevê ("JUROS: METODOLOGIA PRICE E CAPITALIZAÇÃO MENSAL A PARTIR DA CONTRATAÇÃO" — nota 24; Id. 205921999, Pág. 108). **A Autora não discute a existência de previsão contratual de capitalização**, e a admissão da Ré a confirma. Registre-se, no entanto, três pontos: (i) a admissão confirma que o custo efetivo anual da operação é de **273,22%**, quase o dobro do duodécuplo de 139,20%, comprovando o elevadíssimo peso dos juros compostos sobre a taxa nominal; (ii) a Súmula 541 permite cobrar a taxa anual contratada, não torna lícita a **taxa mensal** abusiva, que continua sujeita ao controle do art. 51 do CDC e do Tema 27/STJ; e (iii) o art. 28 da Lei 10.931/2004 pressupõe cédula de crédito bancário emitida, e o documento juntado pela Ré (Id. 205921999, Págs. 107–109) é tela de "renovação de empréstimo", **emitida em 18/09/2026** (data da própria contestação), sem número de cédula, sem assinatura identificável e sem trilha de autenticação.'));
C.push(body('Diante da pactuação expressa, a Autora **esclarece o pedido de revisão**: o excesso é demonstrado pela readequação da **taxa** à média do Bacen (6,00% a.m.), **mantido o Sistema Francês de Amortização e a capitalização mensal contratada**, tal como calculado no Quadro 4. A alusão da inicial a "juros simples" fica prejudicada nesse ponto, e o cálculo apresentado — que é o mais favorável à Ré — é o que prevalece.'));
C.push(cons('a capitalização mensal, ainda que lícita, não imuniza a taxa abusiva; o pedido é a redução da taxa à média, mantido o regime de capitalização contratado.'));

C.push(H2('IV.E — "Imprestabilidade da Calculadora do Cidadão" (Págs. 47–48)'));
C.push(body('A impugnação da Ré é dirigida a instrumento que **não é a base do pedido**. A prova da Autora não é o resultado de uma simulação do site do Bacen, mas (i) o **contrato da Ré**, (ii) a **série oficial SGS 25464** do Bacen (taxa média de crédito pessoal não consignado — PF), (iii) a **tabela Price**, fórmula matemática pública. O laudo (Id. 204565269) é reprodutível passo a passo, e foi **agora recalculado com os dados do contrato da Ré** (Quadro 4). A Ré **não aponta nenhum erro de cálculo**, não apresenta contra-cálculo e não indica qual premissa do laudo estaria errada; limita-se a dizer que a ferramenta é "meramente informativa". Impugnação genérica não impede a valoração da prova: no Juizado, "todos os meios de prova moralmente legítimos são hábeis" (art. 32 da Lei 9.099/95), e a avaliação das provas cabe ao Juiz (art. 5º). A afirmação de que "os dados foram fornecidos unilateral e equivocadamente" foi, ainda, desmentida pela Ré: **os dados que ela mesma juntou coincidem com os da Autora** quanto a valor, prazo, taxa e média de mercado.'));
C.push(cons('rejeição da impugnação; o cálculo da Autora é reprodutível, não foi especificamente contestado e se apoia nos documentos da Ré (art. 341 do CPC).'));

C.push(H2('IV.F — Inexistência de dano material e restituição em dobro (Págs. 48–49)'));
C.push(body('A Ré nega o dano material por entender que "a cobrança decorreu de previsão contratual". A tese é circular: a previsão contratual é justamente a cláusula cuja nulidade se postula; cláusula abusiva é nula de pleno direito (art. 51, IV, do CDC) e não gera crédito. Reconhecida a abusividade, o excesso pago é indevido.'));
C.push(body('Sobre a repetição em dobro (art. 42, parágrafo único, do CDC), a Ré **transcreve** a tese da Corte Especial do STJ, segundo a qual a restituição em dobro **"independe da natureza do elemento volitivo do fornecedor"**, bastando que a cobrança indevida seja contrária à boa-fé objetiva (EAREsp 676.608/RS, Rel. Min. Og Fernandes, Corte Especial, j. 21/10/2020; REsp 2.196.064/BA, citado pela Ré na nota 30). Com isso, **a Ré abandona o argumento da má-fé** (Pág. 49: "o autor não apresentou qualquer elemento que indique má-fé") e passa a discutir apenas a boa-fé objetiva, que se aprecia pela conduta, não pela intenção. Os descontos mensais aqui impugnados ocorreram a partir de dezembro de 2025, **muito depois da data de 30/03/2021** a partir da qual a Corte Especial fixou a modulação da tese. Cobrar 1,93 vez a média de mercado, em operação de rolagem de dívidas que reduziu o dinheiro novo a 11,8% do financiado e embutiu seguro prestamista de 19,8%, sem prova alguma de risco diferenciado, é conduta objetivamente contrária à boa-fé (art. 422 do CC). Os precedentes do TJSP citados (notas 31 e 32) são anteriores à consolidação ou tratam de casos sem as peculiaridades acima.'));
C.push(body('Atualizado o cálculo com os dados reais do contrato (parcela de R$ 605,12; 10 parcelas vencidas, de dezembro de 2025 a setembro de 2026):'));
C.push(table([5400,3626],['Item','Valor'],[
['Excesso mensal (R$ 605,12 − R$ 332,85)','R$ 272,27'],
['Parcelas vencidas até set/2026 (dez/2025 a set/2026)','10'],
['Excesso pago até set/2026 (10 × R$ 272,27)','R$ 2.722,70'],
['**Repetição em dobro (art. 42, parágrafo único, CDC)**','**R$ 5.445,40**'],
['Excesso a pagar nas 26 parcelas vincendas, se mantido o contrato (26 × R$ 272,27)','R$ 7.079,02'],
],{right:[1]}));
C.push(legend('Quadro 6 — Repetição do indébito, valores nominais, sem correção, a atualizar até a sentença'));
C.push(body('O valor acima é nominal e se atualiza com o vencimento de cada nova parcela até a sentença (cada parcela a mais soma R$ 272,27 em simples e R$ 544,54 em dobro), com correção monetária desde cada desembolso e juros de mora desde a citação (comparecimento espontâneo da Ré em 18/09/2026, art. 239, § 1º, do CPC). Em atenção ao art. 38, parágrafo único, da Lei 9.099/95 (vedação de sentença ilíquida), o pedido é certo e determinado, conforme a alínea "h" dos pedidos. Subsidiariamente, caso o Juízo entenda não configurada a hipótese do dobro, requer a restituição **simples** (R$ 2.722,70 até set/2026), nos termos da própria Ré (Pág. 49, pedido subsidiário).'));
C.push(cons('rejeição da tese de inexistência de dano material; devida a restituição em dobro (art. 42, parágrafo único, CDC; EAREsp 676.608/RS), ou, subsidiariamente, simples.'));

C.push(H2('IV.G — Dano moral (Págs. 49–50)'));
C.push(body('A Ré afirma que o pedido seria "genérico" e que não houve ato ilícito. O ato ilícito é a cobrança de encargo abusivo em contrato de adesão, sobre renda previdenciária da consumidora, que a Ré **não impugnou** estar comprometida em mais de 60% por descontos de empréstimos (art. 341 do CPC; inicial, item 2.3). A restituição do excesso repõe o patrimônio, mas não repara a **subtração continuada de renda de natureza alimentar**, a sobrecarga de dívidas encadeadas por sucessivas renovações (a operação aqui discutida rolou três contratos anteriores) e o tempo desperdiçado em tentar resolver o problema, hipóteses reconhecidas como lesão extrapatrimonial pela jurisprudência do desvio produtivo. A Autora reitera o pedido nos termos da inicial (item 5.2), cuja quantificação (R$ 10.000,00) se submete à prudente apreciação do Juízo. Ressalva-se que a referência da inicial à condição de pessoa idosa não é pressuposto do pedido, que se sustenta na vulnerabilidade da consumidora previdenciária e nas circunstâncias do contrato.'));
C.push(cons('configurado o ato ilícito e a lesão pela privação continuada de renda alimentar, o pedido do item 5.2 da inicial deve ser acolhido (art. 14 do CDC e art. 927 do CC).'));

C.push(H2('IV.H — Inversão do ônus da prova (Págs. 50–51)'));
C.push(body('A Ré admite que a inversão é possível "em caso de hipossuficiência do autor ou verossimilhança" (Pág. 50) e apenas nega que esses requisitos existam. Existem. A **verossimilhança** está pré-constituída: o contrato e a taxa média, confessados pela Ré, demonstram taxa de 1,93 vez a média. A **hipossuficiência** é técnica e econômica: a Ré, e não a Autora, detém os dados de captação, risco, score, composição de custos e histórico de relacionamento. É por isso que a Ré, ao justificar a taxa pelo "perfil de risco", assume o ônus de prová-lo. A inversão não é, aqui, sequer decisiva: **mesmo sem ela**, a Autora se desincumbiu do seu ônus pelos documentos da Ré. Mantém-se o pedido de inversão (art. 6º, VIII, do CDC), com a ressalva de que a **distribuição dinâmica** (art. 373, § 1º, do CPC) leva ao mesmo resultado quanto às provas do suposto risco.'));
C.push(cons('deferimento da inversão (art. 6º, VIII, do CDC), ou, ao menos, atribuição à Ré do ônus de provar a justificativa da taxa (art. 373, §§ 1º e 2º, do CPC).'));

C.push(H2('IV.I — Omissões da contestação: tutela de urgência e demais pontos'));
C.push(body('A contestação **não se manifestou** sobre o pedido de tutela de urgência (inicial, item 4.8 e pedido "c"), sobre a nulidade da Cláusula V (taxa) por abusividade (item 3.2), nem sobre o dever de informação (item 3.3), o comprometimento de mais de 60% da renda (item 2.3) e o mínimo existencial (item 4.6). Em relação a todos eles, os fatos alegados presumem-se verdadeiros (art. 341 do CPC).'));
C.push(body('Quanto à **tutela de urgência**, a probabilidade do direito está agora ainda mais robusta, pois a taxa e o contrato são **confessados**, e o perigo de dano é contínuo: a cada mês, R$ 272,27 são debitados em excesso, e a situação se agrava pela renovação encadeada. Registre-se a correção do item "c" dos pedidos da inicial: onde consta "R$ 47,92" (valor de outro contrato), leia-se **R$ 314,53**, valor consignado no item "g" e no item 4.8 da inicial; tendo em vista o recálculo com os dados reais do contrato e a mesma carência aplicada pela Ré, o valor de **R$ 332,85** é o parâmetro técnico que se adota **subsidiariamente**. Requer-se a limitação das parcelas vincendas ao valor de **R$ 314,53 (ou, no mínimo, R$ 332,85)**, com a multa diária da inicial.'));

C.push(H1('V — Do pedido de improcedência e da sucumbência'));
C.push(body('A Ré pede a condenação da Autora em custas e honorários (Pág. 52). **Não cabem** custas nem honorários em primeiro grau nos Juizados Especiais, salvo litigância de má-fé (art. 55 da Lei 9.099/95), que a Ré nem sequer alega, e a Autora é beneficiária de gratuidade (declaração de hipossuficiência, Id. 204565264, Pág. 13). A inicial, ao contrário, mostra-se **procedente**, pois a própria Ré confessou os fatos que a sustentam.'));

C.push(H1('VI — Índice de documentos conferidos'));
C.push(table([1700,3700,1500,2126],['Id.','Documento','Juntado por','Páginas'],[
['204565263','Petição inicial','Autora','1–12'],
['204565264','Procuração, declaração de hipossuficiência e relatórios ZapSign','Autora','13–15'],
['204565266 / 267','RG / declaração de residência','Autora','16–18'],
['204565268 / 269','Contratos (app) e memória de cálculo (laudo)','Autora','19–33'],
['205921995','Contestação','Ré','34–53'],
['205921996','Substabelecimento','Ré','54'],
['205921998','"Kit Mercantil" (procurações e atos societários)','Ré','55–106'],
['205921999','**Contrato nº 998001031438 (renovação)**','Ré','107–110'],
]));
C.push(legend('Quadro 7 — Índice real dos documentos dos autos (conferido na íntegra)'));

C.push(H1('VII — Pedidos'));
C.push(body('Ante o exposto, e reiterando todos os fundamentos e pedidos da petição inicial, requer a Autora:'));
[
'a)\tA **rejeição das preliminares** de incompetência do Juizado, irregularidade de representação, ausência de interesse de agir, fracionamento de ações e conexão, mantida a competência deste Juízo; subsidiariamente, quanto à procuração, prazo para regularização (art. 76, § 1º, do CPC), sem extinção;',
'b)\tA declaração de que **estão provados por confissão e/ou não impugnados** os fatos do Quadro 3 (art. 341, 374, II e III, 389 e 391 do CPC);',
'c)\tO **julgamento antecipado do mérito** (art. 355, I, do CPC), por se tratar de matéria de direito e de fatos provados por documentos e por confissão da Ré, **sem necessidade de perícia, exibição de documentos ou ofícios**, incompatíveis com o rito (art. 35 da Lei 9.099/95);',
'd)\tA **manutenção da inversão do ônus da prova** (art. 6º, VIII, do CDC; art. 373, § 1º, do CPC);',
'e)\tA **rejeição da impugnação à memória de cálculo** e o reconhecimento de que a taxa média de 6,00% é o referencial (Tema 27/STJ), por admissão da Ré;',
'f)\tA **concessão da tutela de urgência** (art. 300 do CPC), para limitar as parcelas vincendas a **R$ 314,53** (ou, no mínimo, R$ 332,85), sob multa diária de R$ 500,00 (corrigido o item "c" da inicial, onde se lê R$ 47,92);',
'g)\tA declaração de **abusividade e nulidade da cláusula de juros remuneratórios** do contrato nº 998001031438 (art. 51, IV e § 1º, III, do CDC) e a **revisão do contrato** com readequação da taxa a 6,00% a.m. (média do Bacen na contratação), mantido o Sistema Francês, com parcela revisada de R$ 332,85 (ou, subsidiariamente, R$ 314,53 conforme a inicial);',
'h)\tA **condenação da Ré à repetição em dobro** do excesso pago (art. 42, parágrafo único, do CDC; EAREsp 676.608/RS), no valor de **R$ 5.445,40** até setembro de 2026, acrescido de **R$ 544,54 por parcela vencida e paga até a sentença**, com correção monetária desde cada desembolso e juros de mora desde a citação; subsidiariamente, a restituição simples (R$ 2.722,70 até set/2026, mais R$ 272,27 por parcela subsequente);',
'i)\tA condenação da Ré ao pagamento de **indenização por danos morais de R$ 10.000,00**, nos termos do item 5.2 da inicial;',
'j)\tA concessão da **gratuidade da justiça** e a rejeição do pedido de custas e honorários da Ré (art. 55 da Lei 9.099/95);',
'k)\tSubsidiariamente, em caso de dúvida do Juízo, a **oitiva de preposto** da Ré com conhecimento dos fatos e a designação de audiência de instrução;',
'l)\tA procedência integral dos pedidos da inicial, com as retificações de valores desta peça;',
'm)\tQue as intimações sejam feitas **exclusivamente em nome do advogado CLEYTON DA SILVA BARBOSA, OAB/MS 17.311** (art. 272, § 5º, do CPC).'
].forEach(t=>C.push(alinea(t)));
C.push(Esp(200));
C.push(plain('Nestes termos,',{after:0,align:AlignmentType.LEFT,indent:{firstLine:709}}));
C.push(plain('Pede deferimento.',{after:200,align:AlignmentType.LEFT,indent:{firstLine:709}}));
C.push(plain('Ilhéus/BA, 5 de outubro de 2026.',{align:AlignmentType.LEFT,after:400,indent:{firstLine:709}}));
C.push(plain('CLEYTON DA SILVA BARBOSA',{align:AlignmentType.CENTER,after:0,bold:true}));
C.push(plain('OAB/MS 17.311',{align:AlignmentType.CENTER,after:0}));

const doc=new Document({styles:{default:{document:{run:{font:'Times New Roman',size:24}}}},
 sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1418,bottom:1134,left:1701,right:1134}}},
 footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'Processo nº 0014927-30.2026.8.05.0103 — Impugnação à Contestação — página ',size:18,font:'Times New Roman'}),new TextRun({children:[PageNumber.CURRENT],size:18,font:'Times New Roman'}),new TextRun({text:' de ',size:18,font:'Times New Roman'}),new TextRun({children:[PageNumber.TOTAL_PAGES],size:18,font:'Times New Roman'})]})]})},
 children:C}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync('impugnacao_contestacao.docx',b);console.log('ok',b.length)});
