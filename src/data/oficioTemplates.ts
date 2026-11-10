// Modelos pré-configurados e templates para o Editor de Ofício do Conselho Tutelar
// Inclui o modelo oficial extraído do anexo enviado pelo usuário (Ofício ao Ministério Público)

import { Oficio } from "../types";

export const DEFAULT_CONSELHEIROS = [
  { id: "c1", nome: "", cargo: "Conselheiro (a) tutelar", matricula: "", linhaAssinatura: true },
  { id: "c2", nome: "", cargo: "Conselheiro (a) tutelar", matricula: "", linhaAssinatura: true },
  { id: "c3", nome: "", cargo: "Conselheiro (a) tutelar", matricula: "", linhaAssinatura: true },
  { id: "c4", nome: "", cargo: "Conselheiro (a) tutelar", matricula: "", linhaAssinatura: true },
];

/**
 * Modelo Oficial extraído fielmente do documento em anexo:
 * Ofício de Maria Thaís ao MP 2026 (Ofício CT Nº 110/2026)
 */
export const MODELO_OFICIAL_ANEXO: Oficio = {
  id: "oficio-ct-110-2026",
  numero: "110",
  ano: "2026",
  numeroFormatado: "Ofício CT Nº 110/2026",
  dataEmissao: "2026-10-19",
  cidade: "Currais Novos",
  uf: "RN",

  // Destinatário
  tratamentoDestinatario: "A Excelentíssima Sra.",
  nomeDestinatario: "Bela Fladja Raiane Soares de Souza.",
  cargoDestinatario: "2º Promotora de Justiça da Comarca de Currais Novos",
  enderecoDestinatario: "Rua: Zuza Othon nº 1150, Valfredo Galvão- Currais Novos/RN",

  // Assunto & Procedimento
  assunto: "Informações referente ao procedimento",
  numeroProcedimento: "33.23.2001.0000093/2026-23",

  // Saudação
  saudacao: "Excelentíssima Senhora",

  // Parágrafos Oficiais
  paragrafos: [
    "Cumprimentando-a cordialmente, sirvo-me do presente para prestar informações atualizadas acerca do acompanhamento da Sra. Maria Thaís Bezerra de Araújo, inscrita no CPF nº 711.677.354-12, residente na Rua Manoel Bimba, nº 14, bairro Dr. José Dantas, no município de Currais Novos/RN, contato telefônico: (84) 99904-4191, genitora dos infantes Anthony Gabriel de Araújo, nascido em 27/10/2025, atualmente com 1 ano de idade, e Joaquim Pietro Araújo do Nascimento, nascido em 31/10/2021, atualmente com 5 anos de idade. A composição familiar informada é constituída pela genitora, seus dois filhos e seu atual companheiro, Sr. Judson, cujos documentos pessoais não foram apresentados a este órgão. Este Conselho recebeu comunicação da própria Sra. Thaís informando que havia realizado nova mudança de endereço e alterado seu contato telefônico, esclarecendo que vinha mantendo comunicação com este órgão por meio do aparelho celular de seu companheiro, Judson.",

    "No que se refere ao acompanhamento educacional de Joaquim Pietro, conforme relatório encaminhado pelo Centro Municipal de Educação Infantil (CMEI) Irmã Ananília, instituição na qual a criança está matriculada, consta que o infante é participativo e assíduo, sendo conduzido à unidade escolar pela genitora e por seu companheiro nos horários estabelecidos. O documento também informa que a criança demonstra interesse pela interação com os colegas, embora apresente dificuldade em permanecer sentada por períodos prolongados, necessitando de incentivo e envolvimento nas atividades pedagógicas. Ainda segundo o relatório escolar, Joaquim Pietro apresenta-se com boa higiene pessoal e não foram observados sinais aparentes de maus-tratos. Entretanto, demonstra resistência diante de situações de contrariedade, manifestando choro e dificuldade para lidar com a frustração quando seus desejos são contrariados ou algo lhe é negado. Tais comportamentos foram descritos no contexto do desenvolvimento da autorregulação emocional, conforme avaliação registrada pela instituição de ensino. O relatório correspondente segue anexo.",

    "Em relação à saúde, conforme informações encaminhadas pela Unidade Básica de Saúde de referência, Prefeito José Dantas, não constam documentos pessoais atualizados da genitora e de seus filhos nos registros consultados. Também foi informada a ausência de retorno para o acompanhamento de crescimento e desenvolvimento (CeD) do infante Anthony, apesar de terem sido realizados agendamentos pela própria unidade de saúde, sem a devida regularidade de comparecimento por parte da genitora. Quanto a Joaquim Pietro, foi destacada a necessidade de acompanhamento odontológico, ao qual a criança ainda não havia sido conduzida. A equipe de saúde informou, ainda, que não teve acesso à caderneta de vacinação, apesar de sua solicitação. Tais informações constam no relatório da unidade de saúde, que segue anexo.",

    "No âmbito da rede de proteção, registra-se que a Sra. Thaís não aderiu, até o momento, de forma regular aos atendimentos e acompanhamentos propostos pelo Centro de Atenção Psicossocial (CAPS), para o qual havia sido encaminhada. Conforme informações disponíveis, a genitora não compareceu aos atendimentos agendados, embora a equipe tenha se colocado à disposição para prestar assistência, considerando, inclusive, a ausência de rede de apoio familiar e social da usuária no município de Currais Novos/RN. Em atendimento realizado por este órgão de proteção, a Sra. Thaís relatou que frequenta os atendimentos psicossociais e comparece às consultas previamente agendadas. Contudo, informou não se sentir confortável em participar das atividades em grupo ofertadas pela unidade de saúde. Declarou, ainda, que não estaria mais fazendo uso de bebidas alcoólicas ou substâncias ilícitas.",

    "No que diz respeito ao acompanhamento odontológico de Joaquim Pietro, a genitora justificou a ausência da criança ao atendimento informando que o filho mais novo, Anthony, apresenta dificuldades para dormir, circunstância que, segundo ela, compromete seu descanso e dificulta que acorde em tempo hábil para conduzir o filho à unidade de saúde. Durante as observações realizadas, este órgão identificou comprometimento aparente dos dentes anteriores de Joaquim Pietro, situação que reforça a necessidade de avaliação e acompanhamento odontológico, a fim de prevenir o agravamento do quadro e assegurar os cuidados necessários à saúde bucal da criança.",

    "Diante do exposto, este órgão ressalta a importância da adesão da genitora aos serviços disponibilizados pela rede de proteção e pelas políticas públicas de saúde, assistência social e educação, com vistas à garantia dos direitos fundamentais das crianças, especialmente no que se refere ao acompanhamento do crescimento e desenvolvimento, à atualização da caderneta de vacinação, à assistência odontológica e à continuidade dos cuidados psicossociais pertinentes. Destaca-se, ainda, a necessidade de atualização dos dados cadastrais e dos contatos familiares, bem como do fortalecimento da articulação entre os serviços da rede de proteção, visando ao acompanhamento sistemático da situação familiar e à identificação de eventuais necessidades de intervenção, sempre considerando o melhor interesse das crianças.",

    "Ressalta-se que este órgão de proteção, no exercício de suas atribuições legais, especialmente aquelas previstas no artigo 136 do Estatuto da Criança e do Adolescente (ECA), realizou requisições de serviços e articulações junto aos equipamentos que compõem a rede de proteção, incluindo o Centro de Referência Especializado de Assistência Social (CREAS), a unidade escolar, a Secretaria Municipal de Saúde, a Unidade Básica de Saúde (UBS) e o Programa Criança Feliz. Foram realizadas visitas, prestadas orientações à genitora e promovidas articulações com os serviços competentes, inclusive no que se refere aos agendamentos necessários para assegurar o acompanhamento e o atendimento das demandas identificadas no núcleo familiar.",

    "Nesse contexto, evidencia-se a necessidade de intervenção sistemática do Centro de Referência Especializado de Assistência Social (CREAS), mediante avaliação técnica da situação familiar, elaboração de plano de acompanhamento e definição de estratégias de intervenção voltadas ao enfrentamento das vulnerabilidades identificadas e à prevenção de possíveis violações de direitos. Registra-se que o CREAS foi acionado por este órgão de proteção em 24 de abril de 2026, tendo sido realizada uma visita domiciliar conjunta com a equipe do Conselho Tutelar em 22 de maio de 2026. Entretanto, até o momento, conforme as informações disponíveis a este órgão, não houve continuidade dos atendimentos pelo referido equipamento, circunstância que reforça a necessidade de retomada e fortalecimento do acompanhamento socioassistencial da família.",

    "Destaca-se que a atuação continuada do CREAS poderá contribuir significativamente para o fortalecimento dos vínculos familiares e comunitários, a ampliação do acesso aos direitos socioassistenciais e a inclusão da família nos programas, projetos e serviços ofertados pelo município, conforme avaliação técnica e critérios de elegibilidade. Faz-se necessário, ainda, desenvolver estratégias que favoreçam a construção de vínculos de confiança com a genitora, o reconhecimento de suas potencialidades, o fortalecimento de sua autonomia e o desenvolvimento de sua capacidade protetiva, de modo que ela possa assumir uma participação ativa no processo de acompanhamento e na garantia dos direitos de seus filhos. Dessa forma, este órgão considera imprescindível o fortalecimento da articulação entre os serviços da rede de proteção, com definição de responsabilidades, acompanhamento sistemático e avaliação periódica das ações implementadas, visando à superação das vulnerabilidades identificadas e à efetiva garantia dos direitos das crianças, em observância ao princípio da proteção integral e ao melhor interesse da criança."
  ],

  // Encerramento & Fecho
  encerramento: "Sendo o que havia a informar no momento, colocamo-nos à disposição para os esclarecimentos que se fizerem necessários.",
  fecho: "Atenciosamente,",

  // Assinaturas
  conselheiros: [
    { id: "c1", nome: "", cargo: "Conselheiro (a) tutelar", linhaAssinatura: true },
    { id: "c2", nome: "", cargo: "Conselheiro (a) tutelar", linhaAssinatura: true },
    { id: "c3", nome: "", cargo: "Conselheiro (a) tutelar", linhaAssinatura: true },
    { id: "c4", nome: "", cargo: "Conselheiro (a) tutelar", linhaAssinatura: true },
  ],
  dataEncerramento: "Currais Novos, 19 de outubro 2026",

  // Anexos
  anexos: [
    {
      id: "anx-1",
      nome: "Informe de Atendimento - UBS Prefeito José Dantas",
      descricao: "Relatório de ausência de acompanhamento CeD e saúde odontológica",
      tipo: "relatorio",
      url: "",
      dataUpload: "2026-10-19"
    },
    {
      id: "anx-2",
      nome: "Relatório de Atendimento - CAPS II Maria Vênus Cunha",
      descricao: "Histórico de acolhimento psicossocial da genitora",
      tipo: "laudo",
      url: "",
      dataUpload: "2026-10-19"
    },
    {
      id: "anx-3",
      nome: "Relatório Pedagógico Individual - CMEI Irmã Ananília",
      descricao: "Acompanhamento escolar do aluno Joaquim Pietro",
      tipo: "documento",
      url: "",
      dataUpload: "2026-10-19"
    }
  ],

  status: "Emitido",
  casoNome: "Maria Thaís Bezerra de Araújo",
  dataCriacao: "2026-10-19T08:30:00.000Z",
  criadoPor: "Conselho Tutelar",
  orgaoEmissor: "Conselho Tutelar dos Direitos da Criança e do Adolescente"
};

export interface OficioTemplate {
  id: string;
  titulo: string;
  descricao: string;
  dados: Partial<Oficio>;
}

/**
 * Templates pré-configurados para criação rápida
 */
export const TEMPLATES_OFICIO: OficioTemplate[] = [
  {
    id: "tpl-mp-procedimento",
    titulo: "Resposta a Procedimento do Ministério Público",
    descricao: "Prestação de informações sobre acompanhamento familiar, relatórios de saúde, educação e intervenções intersetoriais.",
    dados: MODELO_OFICIAL_ANEXO
  },
  {
    id: "tpl-requisicao-vaga",
    titulo: "Requisição de Vaga/Matrícula Escolar (Art. 136, III, 'a', ECA)",
    descricao: "Requisição formal de vaga prioritária em creche ou escola municipal para criança em situação de vulnerabilidade.",
    dados: {
      numero: "111",
      ano: "2026",
      numeroFormatado: "Ofício CT Nº 111/2026",
      dataEmissao: new Date().toISOString().split("T")[0],
      cidade: "Currais Novos",
      uf: "RN",
      tratamentoDestinatario: "Ao Ilustríssimo Sr.",
      nomeDestinatario: "Secretário Municipal de Educação e Cultura",
      cargoDestinatario: "Secretaria Municipal de Educação de Currais Novos/RN",
      enderecoDestinatario: "Centro Administrativo Municipal - Currais Novos/RN",
      assunto: "Requisição de vaga e matrícula escolar prioritária",
      numeroProcedimento: "",
      saudacao: "Ilustríssimo Senhor Secretário",
      paragrafos: [
        "Cumprimentando-o cordialmente, o Conselho Tutelar de Currais Novos/RN, no uso das atribuições legais que lhe são conferidas pela Lei Federal nº 8.069/1990 (Estatuto da Criança e do Adolescente), especialmente no art. 136, inciso III, alínea 'a', vem, por meio deste, requisitar a imediata disponibilização de vaga e efetivação de matrícula escolar.",
        "A medida se faz indispensável em virtude de atendimento realizado neste colegiado, no qual se constatou que a criança encontra-se fora da rede de ensino, configurando violação ao direito fundamental à educação pública, gratuita e de qualidade assegurado pelos artigos 53 e 54 do ECA, bem como pelo art. 208 da Constituição Federal.",
        "Diante do exposto e considerando a prioridade absoluta conferida à infância pelo ordenamento jurídico pátrio, requisita-se a expedição de guia de matrícula no prazo de 5 (cinco) dias úteis, comunicando a este órgão a unidade escolar designada."
      ],
      encerramento: "Certos de vossa costumeira atenção e pronto atendimento, renovamos os protestos de estima e consideração.",
      fecho: "Atenciosamente,",
      conselheiros: DEFAULT_CONSELHEIROS,
      dataEncerramento: `Currais Novos, ${new Date().toLocaleDateString("pt-BR")}`,
      status: "Rascunho",
      criadoPor: "Conselho Tutelar",
      orgaoEmissor: "Conselho Tutelar dos Direitos da Criança e do Adolescente"
    }
  },
  {
    id: "tpl-creas-acompanhamento",
    titulo: "Encaminhamento e Requisição ao CREAS/CRAS",
    descricao: "Encaminhamento de núcleo familiar para inclusão no PAEFI ou PAIF com plano de acompanhamento sistemático.",
    dados: {
      numero: "112",
      ano: "2026",
      numeroFormatado: "Ofício CT Nº 112/2026",
      dataEmissao: new Date().toISOString().split("T")[0],
      cidade: "Currais Novos",
      uf: "RN",
      tratamentoDestinatario: "À Ilustríssima Sra.",
      nomeDestinatario: "Coordenadora do CREAS",
      cargoDestinatario: "Centro de Referência Especializado de Assistência Social",
      enderecoDestinatario: "Rua das Flores, nº 200 - Currais Novos/RN",
      assunto: "Encaminhamento para inclusão no PAEFI e elaboração de plano de acompanhamento",
      numeroProcedimento: "",
      saudacao: "Ilustríssima Coordenadora",
      paragrafos: [
        "Cumprimentando-a cordialmente, servimo-nos do presente para encaminhar a este equipamento socioassistencial a família para acolhimento técnico, inclusão no Serviço de Proteção e Atendimento Especializado a Famílias e Indivíduos (PAEFI) e elaboração de plano de acompanhamento singular.",
        "Em fiscalização e atendimento realizados por este Conselho Tutelar, foram identificadas fragilidades no exercício das funções protetivas e situação de vulnerabilidade sociofamiliar que demandam acompanhamento técnico contínuo e articulação com a rede intersetorial.",
        "Solicita-se a este equipamento a realização de visita domiciliar diagnóstica e o envio a este Conselho do relatório técnico circunstanciado no prazo de 20 (vinte) dias."
      ],
      encerramento: "Colocamo-nos à disposição para ações conjuntas e alinhamento das intervenções necessárias.",
      fecho: "Atenciosamente,",
      conselheiros: DEFAULT_CONSELHEIROS,
      dataEncerramento: `Currais Novos, ${new Date().toLocaleDateString("pt-BR")}`,
      status: "Rascunho",
      criadoPor: "Conselho Tutelar",
      orgaoEmissor: "Conselho Tutelar dos Direitos da Criança e do Adolescente"
    }
  },
  {
    id: "tpl-branco",
    titulo: "Ofício em Branco (Estrutura Oficial)",
    descricao: "Estrutura oficial completa com cabeçalho, numeração, destinatário, parágrafos vazios e assinaturas.",
    dados: {
      numero: "",
      ano: "2026",
      numeroFormatado: "Ofício CT Nº ___/2026",
      dataEmissao: new Date().toISOString().split("T")[0],
      cidade: "Currais Novos",
      uf: "RN",
      tratamentoDestinatario: "A(o) Excelentíssima(o) Sra.(Sr.)",
      nomeDestinatario: "",
      cargoDestinatario: "",
      enderecoDestinatario: "",
      assunto: "",
      numeroProcedimento: "",
      saudacao: "Prezado(a) Senhor(a)",
      paragrafos: [
        "Cumprimentando-o(a) cordialmente, sirvo-me do presente para ..."
      ],
      encerramento: "Sendo o que havia a informar no momento, colocamo-nos à disposição para os esclarecimentos que se fizerem necessários.",
      fecho: "Atenciosamente,",
      conselheiros: DEFAULT_CONSELHEIROS,
      dataEncerramento: `Currais Novos, ${new Date().toLocaleDateString("pt-BR")}`,
      status: "Rascunho",
      criadoPor: "Conselho Tutelar",
      orgaoEmissor: "Conselho Tutelar dos Direitos da Criança e do Adolescente"
    }
  }
];
