export type Organ =
  | "Conselho Tutelar"
  | "Assistência Social (CRAS/CREAS)"
  | "Saúde"
  | "Educação"
  | "Ministério Público"
  | "Polícia"
  | "Rede Geral";

export type Role = "Visualizar" | "Editar" | "Administrador";

export interface UserSession {
  organ: Organ;
  role: Role;
  username: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  organ: Organ;
  uploadedBy: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  organ: Organ;
  user: string;
  title: string;
  description: string;
  type: "criacao" | "encaminhamento" | "atualizacao_status" | "anexo" | "reuniao" | "nota";
}

export interface Referral {
  id: string;
  acao: string;
  orgaoResponsavel: Organ;
  prazo: string; // YYYY-MM-DD
  status: "Pendente" | "Em andamento" | "Concluído";
  prioridade: "Alta" | "Média" | "Baixa";
  justificativa?: string;
  dataCriacao: string;
  atualizadoEm?: string;
  historico: Array<{
    date: string;
    user: string;
    organ: Organ;
    fromStatus: string;
    toStatus: string;
    comment: string;
  }>;
}

export interface Meeting {
  id: string;
  date: string;
  time: string;
  location: string;
  presentOrgans: Organ[];
  responsiblePerson: string;
  responsibleOrgan: Organ;
  discussao: string;
}

export interface Case {
  id: string;
  name: string; // or initials
  age: number;
  address: string;
  sigilo: "Público" | "Sigiloso" | "Restrito";
  situation: string; // Resumo da situação
  situationDetails: string; // Detalhes do caso
  urgentDemands?: string;
  status: "Ativo" | "Em Acompanhamento" | "Concluído" | "Arquivado";
  dataCriacao: string;
  reunioes: Meeting[];
  encaminhamentos: Referral[];
  timeline: TimelineEvent[];
  anexos: Attachment[];
  
  // AI-generated attributes
  resumoAI?: string;
  nivelRiscoAI?: "Baixo" | "Médio" | "Alto" | "Crítico";
  vulnerabilidadesAI?: string[];
}
