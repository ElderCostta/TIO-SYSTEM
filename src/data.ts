import { Case, Organ, GeneralAta } from "./types";

export const ALL_ORGANS: Organ[] = [
  "Conselho Tutelar",
  "Assistência Social (CRAS/CREAS)",
  "Saúde",
  "Educação",
  "Ministério Público",
  "Polícia",
  "Rede Geral",
];

export const INITIAL_CASES: Case[] = [
  {
    id: "case-1",
    name: "M. J. S.",
    age: 14,
    address: "Rua das Flores, nº 123, Bairro Esperança",
    bairro: "Esperança",
    tipoViolacao: "Trabalho Infantil / Evasão Escolar",
    sigilo: "Sigiloso",
    situation: "Evasão escolar recorrente e indícios de trabalho infantil doméstico.",
    situationDetails: "O adolescente M. J. S., de 14 anos, não frequenta a escola regular há mais de 45 dias. A escola de origem acionou a coordenação e fez visitas pedagógicas, sem sucesso. Relatos de vizinhos apontam que o jovem está realizando trabalho doméstico informal e cuidando de três irmãos menores em período integral, enquanto a mãe trabalha em regime diurno duplo para sustento do lar. Há suspeita de negligência devido à sobrecarga de tarefas e falta de supervisão de adultos.",
    urgentDemands: "Retorno imediato aos estudos regulares, inclusão da família no programa Bolsa Família e assistência de contraturno escolar para os irmãos menores.",
    status: "Ativo",
    dataCriacao: "2026-05-10T10:00:00Z",
    resumoAI: "Adolescente de 14 anos afastado das atividades escolares para exercer papel de cuidador de irmãos menores e tarefas domésticas, sugerindo vulnerabilidade econômica severa.",
    nivelRiscoAI: "Alto",
    vulnerabilidadesAI: ["Abandono Escolar", "Trabalho Infantil Suspeito", "Vulnerabilidade Econômica Extrema"],
    reunioes: [
      {
        id: "meet-101",
        date: "2026-05-15",
        time: "14:00",
        location: "Sala de Reuniões do CRAS Central",
        presentOrgans: ["Conselho Tutelar", "Assistência Social (CRAS/CREAS)", "Educação"],
        responsiblePerson: "Dra. Helena Souza",
        responsibleOrgan: "Assistência Social (CRAS/CREAS)",
        discussao: "Reunião de alinhamento com a presença da escola e do conselheiro tutelar de plantão. Ficou evidente que a mãe do menor trabalha em dois empregos informais e não tem com quem deixar as crianças menores de 4 e 6 anos, sobrecarregando o adolescente de 14 anos. A mãe demonstrou abertura para receber auxílio da rede de proteção, mas teme perder o emprego."
      }
    ],
    encaminhamentos: [
      {
        id: "ref-101",
        acao: "Matrícula das crianças menores (4 e 6 anos) em creche/escola em tempo integral",
        orgaoResponsavel: "Educação",
        prazo: "2026-07-05",
        status: "Em andamento",
        prioridade: "Alta",
        justificativa: "Garantir a liberação do adolescente de suas funções de cuidador para que ele possa retomar os estudos.",
        dataCriacao: "2026-05-15T14:30:00Z",
        historico: []
      },
      {
        id: "ref-102",
        acao: "Visita domiciliar da assistente social para inclusão da família no Cadastro Único (CadÚnico)",
        orgaoResponsavel: "Assistência Social (CRAS/CREAS)",
        prazo: "2026-06-01",
        status: "Concluído",
        prioridade: "Alta",
        justificativa: "Prover suporte financeiro emergencial e acompanhamento familiar continuado.",
        dataCriacao: "2026-05-15T14:30:00Z",
        atualizadoEm: "2026-05-25T16:00:00Z",
        historico: [
          {
            date: "2026-05-25T16:00:00Z",
            user: "Maria Clara",
            organ: "Assistência Social (CRAS/CREAS)",
            fromStatus: "Pendente",
            toStatus: "Concluído",
            comment: "Visita realizada em 22/05. Família cadastrada no CadÚnico e encaminhada para o PAIF."
          }
        ]
      },
      {
        id: "ref-103",
        acao: "Notificação formal da mãe sobre a obrigatoriedade da frequência escolar do adolescente",
        orgaoResponsavel: "Conselho Tutelar",
        prazo: "2026-05-20",
        status: "Concluído",
        prioridade: "Média",
        justificativa: "Formalização dos deveres legais de guarda e proteção educativa.",
        dataCriacao: "2026-05-15T14:30:00Z",
        atualizadoEm: "2026-05-19T09:00:00Z",
        historico: [
          {
            date: "2026-05-19T09:00:00Z",
            user: "Conselheiro Roberto",
            organ: "Conselho Tutelar",
            fromStatus: "Pendente",
            toStatus: "Concluído",
            comment: "Mãe compareceu ao Conselho, assinou termo de compromisso e foi orientada sobre a rede de apoio."
          }
        ]
      }
    ],
    timeline: [
      {
        id: "ev-1",
        date: "2026-05-10T10:00:00Z",
        organ: "Educação",
        user: "Prof. Marcos Lima",
        title: "Registro Inicial do Caso",
        description: "Alerta emitido pelo colégio estadual devido a infrequência escolar grave de M. J. S.",
        type: "criacao"
      },
      {
        id: "ev-2",
        date: "2026-05-15T14:00:00Z",
        organ: "Assistência Social (CRAS/CREAS)",
        user: "Dra. Helena Souza",
        title: "Primeira Reunião de Rede",
        description: "Reunião intersetorial realizada para debater ações emergenciais para resgate escolar.",
        type: "reuniao"
      },
      {
        id: "ev-3",
        date: "2026-05-19T09:00:00Z",
        organ: "Conselho Tutelar",
        user: "Conselheiro Roberto",
        title: "Notificação Concluída",
        description: "A mãe assinou o termo de advertência e compromisso em manter a frequência escolar regular do menor.",
        type: "atualizacao_status"
      },
      {
        id: "ev-4",
        date: "2026-05-25T16:00:00Z",
        organ: "Assistência Social (CRAS/CREAS)",
        user: "Maria Clara",
        title: "Cadastro CadÚnico Realizado",
        description: "Família inserida com sucesso nos cadastros de programas sociais federais e estaduais.",
        type: "atualizacao_status"
      }
    ],
    anexos: [
      {
        id: "anx-101",
        name: "Ficha_Frequencia_Escolar_MJS.pdf",
        type: "application/pdf",
        size: "245 KB",
        date: "2026-05-10T10:15:00Z",
        organ: "Educação",
        uploadedBy: "Prof. Marcos Lima"
      }
    ],
    planoAcao: [
      {
        id: "act-101",
        acao: "Garantir a matrícula e frequência em período integral para os irmãos menores de 4 e 6 anos",
        status: "Pendente",
        responsavel: "Educação",
        dataCriacao: "2026-05-15T14:30:00Z"
      },
      {
        id: "act-102",
        acao: "Inserção familiar nos programas de transferência de renda e segurança alimentar",
        status: "Concluído",
        responsavel: "Assistência Social (CRAS/CREAS)",
        dataCriacao: "2026-05-15T14:30:00Z"
      },
      {
        id: "act-103",
        acao: "Acompanhamento da frequência escolar de M. J. S. e oferta de curso técnico/Jovem Aprendiz",
        status: "Pendente",
        responsavel: "Educação",
        dataCriacao: "2026-05-15T14:30:00Z"
      }
    ]
  },
  {
    id: "case-2",
    name: "A. L. O.",
    age: 7,
    address: "Av. Central, nº 890, AP 202, Centro",
    bairro: "Centro",
    tipoViolacao: "Negligência de Saúde",
    sigilo: "Público",
    situation: "Ausência crônica de consultas médicas e negligência no tratamento de asma severa.",
    situationDetails: "A menor A. L. O., de 7 anos de idade, possui diagnóstico de asma persistente grave, porém a família tem faltado sistematicamente às consultas de pneumologia agendadas na UBS. A equipe da Estratégia Saúde da Família (ESF) realizou buscas ativas e constatou que a avó materna (cuidadora principal) possui demência senil em estágio inicial e a mãe apresenta quadro grave de depressão clínica, o que inviabiliza a organização adequada dos medicamentos da criança, colocando sua vida em perigo em caso de crises respiratórias graves.",
    urgentDemands: "Visitas de enfermagem domiciliar regulares, fornecimento supervisionado de medicação inalatória (bombinha) e agendamento de consulta psiquiátrica para a mãe.",
    status: "Em Acompanhamento",
    dataCriacao: "2026-06-01T09:30:00Z",
    resumoAI: "Criança de 7 anos com asma severa sem tratamento regular devido à incapacitação de saúde mental das cuidadoras diretas (mãe com depressão e avó com demência).",
    nivelRiscoAI: "Crítico",
    vulnerabilidadesAI: ["Risco à Saúde", "Incapacitação de Cuidador", "Isolamento Familiar"],
    reunioes: [
      {
        id: "meet-201",
        date: "2026-06-05",
        time: "09:00",
        location: "Posto de Saúde da Família Central",
        presentOrgans: ["Saúde", "Conselho Tutelar", "Assistência Social (CRAS/CREAS)"],
        responsiblePerson: "Dr. André Santos",
        responsibleOrgan: "Saúde",
        discussao: "Equipe de saúde apontou que a menor foi internada duas vezes no último mês por crises asmáticas. A mãe não consegue administrar o tratamento profilático devido ao estado depressivo. Decidiu-se que a Saúde assumirá o controle diário temporariamente e o CRAS fará apoio com assistente social para buscar outros parentes que possam apoiar o núcleo familiar."
      }
    ],
    encaminhamentos: [
      {
        id: "ref-201",
        acao: "Visitas domiciliares diárias/semanais de Agente Comunitário para supervisão de medicação da menor",
        orgaoResponsavel: "Saúde",
        prazo: "2026-06-08",
        status: "Em andamento",
        prioridade: "Alta",
        justificativa: "Impedir novos episódios de internação hospitalar por falta de medicação preventiva.",
        dataCriacao: "2026-06-05T10:00:00Z",
        historico: []
      },
      {
        id: "ref-202",
        acao: "Consulta psiquiátrica de urgência para a genitora e encaminhamento ao CAPS II",
        orgaoResponsavel: "Saúde",
        prazo: "2026-06-15",
        status: "Pendente",
        prioridade: "Alta",
        justificativa: "Estabilizar a saúde mental da mãe para que ela retome os cuidados da filha.",
        dataCriacao: "2026-06-05T10:00:00Z",
        historico: []
      },
      {
        id: "ref-203",
        acao: "Mapeamento de rede de apoio familiar estendida (tios, primos) para suporte nos cuidados",
        orgaoResponsavel: "Assistência Social (CRAS/CREAS)",
        prazo: "2026-06-20",
        status: "Pendente",
        prioridade: "Média",
        justificativa: "Localizar outros membros da família que possam auxiliar no cuidado das crianças e da avó.",
        dataCriacao: "2026-06-05T10:00:00Z",
        historico: []
      }
    ],
    timeline: [
      {
        id: "ev-10",
        date: "2026-06-01T09:30:00Z",
        organ: "Saúde",
        user: "Enf. Luciana Neves",
        title: "Abertura do Caso Clínico",
        description: "Notificação de negligência em saúde para criança diagnosticada com asma refratária crônica.",
        type: "criacao"
      },
      {
        id: "ev-11",
        date: "2026-06-05T09:00:00Z",
        organ: "Saúde",
        user: "Dr. André Santos",
        title: "Reunião Emergencial Intersetorial",
        description: "Debate focado na assistência de saúde mental à mãe e controle da asma da menor.",
        type: "reuniao"
      }
    ],
    anexos: [
      {
        id: "anx-201",
        name: "Relatorio_Alta_Clinica_Aline.pdf",
        type: "application/pdf",
        size: "189 KB",
        date: "2026-06-02T11:00:00Z",
        organ: "Saúde",
        uploadedBy: "Enf. Luciana Neves"
      }
    ],
    planoAcao: [
      {
        id: "act-201",
        acao: "Realizar busca ativa domiciliar diária para entrega supervisionada de bombinha profilática",
        status: "Pendente",
        responsavel: "Saúde",
        dataCriacao: "2026-06-05T10:00:00Z"
      },
      {
        id: "act-202",
        acao: "Garantir consulta de psiquiatria urgente para a genitora no CAPS II",
        status: "Pendente",
        responsavel: "Saúde",
        dataCriacao: "2026-06-05T10:00:00Z"
      },
      {
        id: "act-203",
        acao: "Entrevistar parentes estendidos para auxílio na organização de medicamentos e proteção das crianças",
        status: "Concluído",
        responsavel: "Assistência Social (CRAS/CREAS)",
        dataCriacao: "2026-06-05T10:00:00Z"
      }
    ]
  },
  {
    id: "case-3",
    name: "Família Santos (J. S. G.)",
    age: 11,
    address: "Área de Ocupação Vila Real, Travessa B, Barraco 45",
    bairro: "Vila Real",
    tipoViolacao: "Violência Física Doméstica",
    sigilo: "Restrito",
    situation: "Violência doméstica física sistemática e vulnerabilidade habitacional extrema.",
    situationDetails: "O menor J. S. G., de 11 anos, foi atendido em unidade hospitalar com escoriações compatíveis com agressão física grave (marcas de cinto e queimadura leve). O padrasto é o principal suspeito das agressões. A família reside em condições insalubres e degradantes na Ocupação Vila Real. A mãe omite-se quanto às agressões por dependência financeira e coação psicológica exercida pelo companheiro, que possui antecedentes criminais por crimes de trânsito e ameaça.",
    urgentDemands: "Medida protetiva de urgência (afastamento do agressor), acolhimento temporário se necessário, e inserção da mãe em programas de autonomia econômica e capacitação profissional.",
    status: "Ativo",
    dataCriacao: "2026-06-12T14:00:00Z",
    resumoAI: "Criança de 11 anos vítima de violência física grave do padrasto, em cenário de extrema vulnerabilidade habitacional e coação materna por dependência.",
    nivelRiscoAI: "Crítico",
    vulnerabilidadesAI: ["Violência Física Direta", "Risco de Agressão Recorrente", "Dependência Econômica e Psicológica"],
    reunioes: [
      {
        id: "meet-301",
        date: "2026-06-18",
        time: "10:30",
        location: "Promotoria da Infância e Juventude",
        presentOrgans: ["Ministério Público", "Polícia", "Conselho Tutelar", "Assistência Social (CRAS/CREAS)"],
        responsiblePerson: "Dr. Flávio Mendes",
        responsibleOrgan: "Ministério Público",
        discussao: "Reunião de urgência para articulação jurídica e policial. A Delegacia da Mulher (DEAM/DP) instaurou inquérito de lesão corporal. O Ministério Público pleiteará o afastamento compulsório do padrasto do lar sob pena de prisão preventiva, protegendo a integridade da mãe e da criança."
      }
    ],
    encaminhamentos: [
      {
        id: "ref-301",
        acao: "Pedido Judicial de Medida Protetiva de Afastamento do Lar contra o padrasto",
        orgaoResponsavel: "Ministério Público",
        prazo: "2026-06-20",
        status: "Concluído",
        prioridade: "Alta",
        justificativa: "Afastar o agressor do menor imediatamente para cessar o perigo de morte ou lesões adicionais.",
        dataCriacao: "2026-06-18T11:00:00Z",
        atualizadoEm: "2026-06-20T17:00:00Z",
        historico: [
          {
            date: "2026-06-20T17:00:00Z",
            user: "Dr. Flávio Mendes",
            organ: "Ministério Público",
            fromStatus: "Pendente",
            toStatus: "Concluído",
            comment: "Juiz concedeu liminar de afastamento. Mandado cumprido com sucesso em 20/06."
          }
        ]
      },
      {
        id: "ref-302",
        acao: "Cumprimento de mandado de afastamento e rondas periódicas preventivas na residência",
        orgaoResponsavel: "Polícia",
        prazo: "2026-06-22",
        status: "Concluído",
        prioridade: "Alta",
        justificativa: "Garantir que o agressor permaneça afastado e que a integridade física da família seja mantida.",
        dataCriacao: "2026-06-18T11:00:00Z",
        atualizadoEm: "2026-06-22T20:00:00Z",
        historico: [
          {
            date: "2026-06-22T20:00:00Z",
            user: "Sgt. Oliveira",
            organ: "Polícia",
            fromStatus: "Pendente",
            toStatus: "Concluído",
            comment: "Afastamento efetivado pela equipe. Patrulha Maria da Penha cadastrou a residência para rondas."
          }
        ]
      },
      {
        id: "ref-303",
        acao: "Inserção da genitora no Aluguel Social emergencial ou abrigo de acolhimento para mulheres se necessário",
        orgaoResponsavel: "Assistência Social (CRAS/CREAS)",
        prazo: "2026-07-02",
        status: "Em andamento",
        prioridade: "Alta",
        justificativa: "Prover habitação segura alternativa caso haja ameaças residuais na ocupação.",
        dataCriacao: "2026-06-18T11:00:00Z",
        historico: []
      }
    ],
    timeline: [
      {
        id: "ev-20",
        date: "2026-06-12T14:00:00Z",
        organ: "Conselho Tutelar",
        user: "Conselheira Ana Paula",
        title: "Denúncia de Violência Física",
        description: "Abertura do caso após notificação hospitalar (ficha de violência interpessoal).",
        type: "criacao"
      },
      {
        id: "ev-21",
        date: "2026-06-18T10:30:00Z",
        organ: "Ministério Público",
        user: "Dr. Flávio Mendes",
        title: "Audiência de Alinhamento na Promotoria",
        description: "Reunião intersetorial de urgência com a polícia militar para planejamento de intervenção e segurança.",
        type: "reuniao"
      },
      {
        id: "ev-22",
        date: "2026-06-20T17:00:00Z",
        organ: "Ministério Público",
        user: "Dr. Flávio Mendes",
        title: "Medida Protetiva Deferida",
        description: "Liminar concedida pelo Juízo da Infância determinando afastamento do lar do padrasto sob pena de prisão.",
        type: "atualizacao_status"
      },
      {
        id: "ev-23",
        date: "2026-06-22T20:00:00Z",
        organ: "Polícia",
        user: "Sgt. Oliveira",
        title: "Cumprimento de Medida pela PM",
        description: "Cumprimento do mandado de afastamento efetuado pela guarnição policial e cadastro no sistema de rondas.",
        type: "atualizacao_status"
      }
    ],
    anexos: [
      {
        id: "anx-301",
        name: "Boletim_Ocorrencia_Lesao_Jovem.pdf",
        type: "application/pdf",
        size: "142 KB",
        date: "2026-06-13T08:30:00Z",
        organ: "Polícia",
        uploadedBy: "Delegada Patrícia"
      }
    ],
    planoAcao: [
      {
        id: "act-301",
        acao: "Ajuizar pedido liminar de afastamento do lar do padrasto agressor",
        status: "Concluído",
        responsavel: "Ministério Público",
        dataCriacao: "2026-06-18T11:00:00Z"
      },
      {
        id: "act-302",
        acao: "Efetuar rondas policiais preventivas sob comando da Patrulha Maria da Penha na área",
        status: "Concluído",
        responsavel: "Polícia",
        dataCriacao: "2026-06-18T11:00:00Z"
      },
      {
        id: "act-303",
        acao: "Conceder Aluguel Social emergencial para proteção e autonomia de moradia da mãe e do menor",
        status: "Pendente",
        responsavel: "Assistência Social (CRAS/CREAS)",
        dataCriacao: "2026-06-18T11:00:00Z"
      }
    ]
  }
];

// Seed initial general meetings (atas) if none exist in localStorage
export const DEFAULT_GENERAL_ATAS: GeneralAta[] = [
  {
    id: "gata-1",
    date: "2026-05-18",
    time: "14:00",
    location: "Auditório da Secretaria de Assistência Social",
    coordinator: "Dra. Elaine Santos (Assistência Social)",
    content: `# ATA DE REUNIÃO INTERSETORIAL

Aos **18** dias do mês de **Maio** do ano de **2026**, às **14:00** horas, realizou-se a reunião intersetorial na (local da reunião) **Auditório da Secretaria de Assistência Social**, com a presença dos representantes dos seguintes órgãos: Conselho Tutelar, Educação, Assistência Social, Saúde, Polícia e demais participantes conforme lista de presença em anexo.

**1. ABERTURA:**
A reunião foi iniciada por **Dra. Elaine Santos (Assistência Social)**, que deu as boas-vindas a todos os presentes e destacou a importância da articulação intersetorial para a garantia de direitos de crianças e adolescentes.

**2. OBJETIVO DA REUNIÃO:**
Alinhamento técnico do fluxo de atendimento de casos de violação de direitos, criação de canais de comunicação direta de emergência e parametrização do uso do TIO System no colegiado intersetorial do município.

**3. PARTICIPANTES:**
(Listar nome completo, órgão e função)

* Dra. Amanda Cruz, Dr. Thiago Mendes – Conselho Tutelar
* Prof. Marcos Lima, Profa. Sandra Souza – Educação
* Dra. Elaine Santos, Dr. Rafael Costa – Assistência Social
* Enf. Luciana Neves, Dr. Ricardo Araújo – Saúde
* Delegada Patrícia Viana, Sgt. Oliveira – Polícia
* Outros: Dr. Marcelo Ramos (Ministério Público)

**4. PAUTA:**
* Apresentação das atualizações de conformidade do TIO System.
* Definição de prazos máximos para atendimento a encaminhamentos em regime de urgência.
* Pactuação técnica do fluxo de encaminhamentos entre CRAS, CREAS, Escolas e Unidades Básicas de Saúde (UBS).

**5. DISCUSSÃO DOS CASOS / TEMAS:**
Foi amplamente debatido o aumento de denúncias recebidas via Disque 100 de evasão escolar no último bimestre. Os representantes da Educação informaram que iniciaram busca ativa intensificada, porém dependem do suporte assistencial para famílias com extrema vulnerabilidade financeira. A Assistência Social mapeou os bairros de maior incidência e designou equipes volantes do CRAS para priorizar essas visitas. Também foi frisada a importância do sigilo absoluto das discussões de prontuário, com a ativação de proteções visuais nos computadores compartilhados.

**6. ENCAMINHAMENTOS E DELIBERAÇÕES:**
(Descrever as decisões tomadas, responsabilidades e prazos)

* Busca ativa intersetorial nos bairros de alta evasão com visitas conjuntas CRAS e Conselho Tutelar.
* Responsável: Assistência Social e Conselho Tutelar | Prazo: 30/06/2026

* Cruzamento de dados de frequência escolar e cadastros do Bolsa Família para inserção em programas de segurança alimentar.
* Responsável: Educação e Assistência Social | Prazo: 15/06/2026

* Criação de formulário padrão para encaminhamento imediato de suspeitas de maus-tratos vindas das escolas diretamente para a Polícia Civil.
* Responsável: Polícia Civil e Educação | Prazo: 22/06/2026

**7. CONSIDERAÇÕES FINAIS:**
Todos os órgãos pontuaram que a integração intersetorial em tempo real evita a revitimização dos assistidos e assegura uma rede ágil. Nova reunião técnica agendada para Julho de 2026.

**8. ENCERRAMENTO:**
Nada mais havendo a tratar, a reunião foi encerrada às **16:30** horas. Eu, **Dr. Rafael Costa (Assistência Social)**, lavrei a presente ata, que após lida e aprovada, será assinada por mi e pelos demais presentes.

---

Responsável pela Ata: Dr. Rafael Costa

---

Assinatura – Conselho Tutelar: Dra. Amanda Cruz

---

Assinatura – Educação: Prof. Marcos Lima

---

Assinatura – Assistência Social: Dra. Elaine Santos

---

Assinatura – Saúde: Enf. Luciana Neves

---

Assinatura – Polícia: Delegada Patrícia Viana

---

Outros participantes: Dr. Marcelo Ramos (Ministério Público)

**ANEXO:** Lista de Presença`,
    dataCriacao: "2026-05-18T16:45:00Z",
    organ: "Assistência Social (CRAS/CREAS)",
    user: "Dra. Elaine Santos",
    numero: 1
  },
  {
    id: "gata-2",
    date: "2026-06-12",
    time: "09:30",
    location: "Sala de Reuniões da Promotoria de Justiça",
    coordinator: "Dr. Marcelo Ramos (Ministério Público)",
    content: `# ATA DE REUNIÃO INTERSETORIAL

Aos **12** dias do mês de **Junho** do ano de **2026**, às **09:30** horas, realizou-se a reunião intersetorial na (local da reunião) **Sala de Reuniões da Promotoria de Justiça**, com a presença dos representantes dos seguintes órgãos: Conselho Tutelar, Educação, Assistência Social, Saúde, Polícia e demais participantes conforme lista de presença em anexo.

**1. ABERTURA:**
A reunião foi iniciada por **Dr. Marcelo Ramos (Ministério Público)**, que deu as boas-vindas a todos os presentes e destacou a importância da articulação intersetorial para a garantia de direitos de crianças e adolescentes.

**2. OBJETIVO DA REUNIÃO:**
Definição de fluxos rápidos para aplicação de medidas de proteção e acolhimento em casos de violência doméstica grave identificados pela rede municipal de saúde e assistência social.

**3. PARTICIPANTES:**
(Listar nome completo, órgão e função)

* Dra. Amanda Cruz – Conselho Tutelar
* Profa. Sandra Souza – Educação
* Dra. Elaine Santos – Assistência Social
* Dr. Ricardo Araújo – Saúde
* Delegada Patrícia Viana – Polícia
* Outros: Dr. Marcelo Ramos (Ministério Público)

**4. PAUTA:**
* Articulação de medidas protetivas de urgência com afastamento do agressor.
* Garantia de moradia e subsídio (Aluguel Social) para genitoras em situação de vulnerabilidade e seus filhos menores.
* Encaminhamento psicológico imediato via CAPS para vítimas de traumas domésticos.

**5. DISCUSSÃO DOS CASOS / TEMAS:**
Discutiu-se a necessidade de um canal ultra-rápido de comunicação entre a Polícia Civil (Delegacia da Mulher), o Conselho Tutelar e a Assistência Social quando as crianças são testemunhas ou vítimas colaterais de agressões físicas na residência. O Ministério Público ressaltou que as tutelas de urgência de afastamento do lar de agressores serão processadas em menos de 24 horas pelo plantão judicial. A rede de saúde expôs a sobrecarga de atendimentos infantis com fundo de estresse pós-traumático e a necessidade de abertura de novos grupos de apoio especializado.

**6. ENCAMINHAMENTOS E DELIBERAÇÕES:**
(Descrever as decisões tomadas, responsabilidades e prazos)

* Criação da Patrulha Integrada da Infância e Família para visitas de acolhimento e monitoria preventiva.
* Responsável: Polícia Militar e Conselho Tutelar | Prazo: 10/07/2026

* Encaminhamento prioritário ao programa de Aluguel Social do Município para os casos de maior risco mapeados pelo CREAS.
* Responsável: Assistência Social | Prazo: 30/06/2026

* Agendamento de consultas psicológicas infantis prioritárias nas UBSs locais com acompanhamento assistencial.
* Responsável: Saúde e Educação | Prazo: 05/07/2026

**7. CONSIDERAÇÕES FINAIS:**
O Ministério Público se comprometeu a fiscalizar rigidamente o cumprimento dos prazos estabelecidos. A cooperação mútua é essencial para preservar vidas.

**8. ENCERRAMENTO:**
Nada mais havendo a tratar, a reunião foi encerrada às **11:45** horas. Eu, **Dr. Marcelo Ramos (Ministério Público)**, lavrei a presente ata, que após lida e aprovada, será assinada por mim e pelos demais presentes.

---

Responsável pela Ata: Dr. Marcelo Ramos (MP)

---

Assinatura – Conselho Tutelar: Dra. Amanda Cruz

---

Assinatura – Educação: Profa. Sandra Souza

---

Assinatura – Assistência Social: Dra. Elaine Santos

---

Assinatura – Saúde: Dr. Ricardo Araújo

---

Assinatura – Polícia: Delegada Patrícia Viana

---

Outros participantes: Dr. Marcelo Ramos (Ministério Público)

**ANEXO:** Lista de Presença`,
    dataCriacao: "2026-06-12T12:00:00Z",
    organ: "Ministério Público",
    user: "Dr. Marcelo Ramos",
    numero: 2
  }
];
