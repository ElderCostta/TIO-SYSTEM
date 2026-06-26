import { Case, Organ } from "./types";

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
    ]
  },
  {
    id: "case-2",
    name: "A. L. O.",
    age: 7,
    address: "Av. Central, nº 890, AP 202, Centro",
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
    ]
  },
  {
    id: "case-3",
    name: "Família Santos (J. S. G.)",
    age: 11,
    address: "Área de Ocupação Vila Real, Travessa B, Barraco 45",
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
    ]
  }
];
