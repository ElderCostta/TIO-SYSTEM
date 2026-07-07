import React from "react";
import { Case, Referral, TimelineEvent, Attachment, Organ, Meeting } from "../types";
import { ALL_ORGANS } from "../data";
import { motion, AnimatePresence } from "motion/react";

// Crisp page-turn feel for subtabs
const subTabFlipVariants = {
  initial: {
    rotateY: -12,
    opacity: 0,
    x: -15,
    scale: 0.99,
    transformOrigin: "left center",
  },
  animate: {
    rotateY: 0,
    opacity: 1,
    x: 0,
    scale: 1,
    transformOrigin: "left center",
    transition: {
      duration: 0.35,
      ease: [0.25, 1, 0.5, 1] as any,
    }
  },
  exit: {
    rotateY: 12,
    opacity: 0,
    x: 15,
    scale: 0.99,
    transformOrigin: "right center",
    transition: {
      duration: 0.28,
      ease: [0.25, 1, 0.5, 1] as any,
    }
  }
};
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  Sparkles, 
  Plus, 
  Paperclip, 
  Trash2, 
  Check, 
  Play, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  FileText,
  FileDown,
  ChevronRight,
  Upload,
  Calendar,
  UserCheck,
  Award
} from "lucide-react";
import AtaModal from "./AtaModal";
import AtaEditorModal from "./AtaEditorModal";
import PrivacyText from "./PrivacyText";

interface CaseDetailsProps {
  caseItem: Case;
  activeSession: { organ: Organ; role: string; username: string };
  onBack: () => void;
  onUpdateCase: (updatedCase: Case) => void;
  safeMode: boolean;
}

export default function CaseDetails({ caseItem, activeSession, onBack, onUpdateCase, safeMode }: CaseDetailsProps) {
  // Tabs within details
  const [activeSubTab, setActiveSubTab] = React.useState<"geral" | "timeline" | "encaminhamentos" | "atas" | "anexos">("geral");

  // Editing Case state variables
  const [isEditingCase, setIsEditingCase] = React.useState(false);
  const [editName, setEditName] = React.useState(caseItem.name);
  const [editAge, setEditAge] = React.useState(caseItem.age);
  const [editAddress, setEditAddress] = React.useState(caseItem.address);
  const [editBairro, setEditBairro] = React.useState(caseItem.bairro || "");
  const [editTipoViolacao, setEditTipoViolacao] = React.useState(caseItem.tipoViolacao || "");
  const [editSigilo, setEditSigilo] = React.useState(caseItem.sigilo);
  const [editSituation, setEditSituation] = React.useState(caseItem.situation);
  const [editSituationDetails, setEditSituationDetails] = React.useState(caseItem.situationDetails);
  const [editUrgentDemands, setEditUrgentDemands] = React.useState(caseItem.urgentDemands || "");

  React.useEffect(() => {
    setEditName(caseItem.name);
    setEditAge(caseItem.age);
    setEditAddress(caseItem.address);
    setEditBairro(caseItem.bairro || "");
    setEditTipoViolacao(caseItem.tipoViolacao || "");
    setEditSigilo(caseItem.sigilo);
    setEditSituation(caseItem.situation);
    setEditSituationDetails(caseItem.situationDetails);
    setEditUrgentDemands(caseItem.urgentDemands || "");
    setIsEditingCase(false); // Reset edit state when switching cases
  }, [caseItem.id]);

  // Local input states for adding details
  const [newNoteTitle, setNewNoteTitle] = React.useState("");
  const [newNoteDesc, setNewNoteDesc] = React.useState("");

  // Action Plan states
  const [newActionText, setNewActionText] = React.useState("");
  const [newActionResp, setNewActionResp] = React.useState("");
  const [aiActionsLoading, setAiActionsLoading] = React.useState(false);
  
  // Local input states for manual referrals
  const [manualAction, setManualAction] = React.useState("");
  const [manualOrgan, setManualOrgan] = React.useState<Organ>("Conselho Tutelar");
  const [manualPrazo, setManualPrazo] = React.useState("");
  const [manualPriority, setManualPriority] = React.useState<"Alta" | "Média" | "Baixa">("Média");
  const [manualJustification, setManualJustification] = React.useState("");

  // Attachment input
  const [attachName, setAttachName] = React.useState("");
  const [attachType, setAttachType] = React.useState("application/pdf");
  const [isDragOver, setIsDragOver] = React.useState(false);

  // Status Comment Modal/Toggle for Referral Status transition
  const [updatingRefId, setUpdatingRefId] = React.useState<string | null>(null);
  const [refComment, setRefComment] = React.useState("");
  const [refNextStatus, setRefNextStatus] = React.useState<"Pendente" | "Em andamento" | "Concluído">("Pendente");

  // AI Minutes generator
  const [isAtaOpen, setIsAtaOpen] = React.useState(false);
  const [ataMarkdown, setAtaMarkdown] = React.useState("");
  const [ataLoading, setAtaLoading] = React.useState(false);

  // Editable ATA Modal states
  const [isAtaEditorOpen, setIsAtaEditorOpen] = React.useState(false);
  const [ataEditorMarkdown, setAtaEditorMarkdown] = React.useState("");
  const [ataEditorMeetingId, setAtaEditorMeetingId] = React.useState<string | null>(null);
  const [ataEditorReadOnly, setAtaEditorReadOnly] = React.useState(false);

  // Secrecy Overriding State
  const [isSecrecyRevealed, setIsSecrecyRevealed] = React.useState(false);

  // New Meeting Form States
  const [showAddMeeting, setShowAddMeeting] = React.useState(false);
  const [meetDate, setMeetDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [meetTime, setMeetTime] = React.useState("10:00");
  const [meetLocation, setMeetLocation] = React.useState("Câmara Intersetorial de Proteção");
  const [meetPerson, setMeetPerson] = React.useState(activeSession.username);
  const [meetOrgan, setMeetOrgan] = React.useState<Organ>(activeSession.organ);
  const [meetDiscussion, setMeetDiscussion] = React.useState("");
  const [meetPresentOrgans, setMeetPresentOrgans] = React.useState<Organ[]>([activeSession.organ]);

  const handleToggleMeetOrgan = (organ: Organ) => {
    if (meetPresentOrgans.includes(organ)) {
      setMeetPresentOrgans(meetPresentOrgans.filter(o => o !== organ));
    } else {
      setMeetPresentOrgans([...meetPresentOrgans, organ]);
    }
  };

  const handleSaveNewMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetDiscussion.trim()) return;

    const tempMeeting: Meeting = {
      id: `meet-${Date.now()}`,
      date: meetDate,
      time: meetTime,
      location: meetLocation,
      presentOrgans: meetPresentOrgans,
      responsiblePerson: meetPerson,
      responsibleOrgan: meetOrgan,
      discussao: meetDiscussion
    };

    // Auto-generate default ATA text based on the user's requested template
    tempMeeting.documentoAta = generateDefaultAtaTemplate(tempMeeting);

    const newMeeting = tempMeeting;

    const newEvent: TimelineEvent = {
      id: `ev-meet-${Date.now()}`,
      date: new Date().toISOString(),
      organ: activeSession.organ,
      user: activeSession.username,
      title: "Nova Reunião & Lista de Presenças",
      description: `Reunião Intersetorial realizada em ${meetDate.split('-').reverse().join('/')} às ${meetTime}. Órgãos presentes: ${meetPresentOrgans.join(", ")}. Coordenador: ${meetPerson} (${meetOrgan}).`,
      type: "reuniao"
    };

    const updatedCase: Case = {
      ...caseItem,
      reunioes: [...(caseItem.reunioes || []), newMeeting],
      timeline: [...(caseItem.timeline || []), newEvent]
    };

    onUpdateCase(updatedCase);
    
    // Reset states
    setMeetDiscussion("");
    setMeetPresentOrgans([activeSession.organ]);
    setShowAddMeeting(false);
  };

  // Helper function to check if active organ can view sensitive details on sigiloso/restrito cases
  const hasAccessToSensitiveDetails = () => {
    if (activeSession.role === "Administrador") return true;
    if (caseItem.sigilo === "Público") return true;
    
    // Admins and specific network leaders have automatic access
    const privilegedOrgans: Organ[] = ["Conselho Tutelar", "Assistência Social (CRAS/CREAS)", "Ministério Público"];
    if (privilegedOrgans.includes(activeSession.organ)) {
      return true;
    }

    return isSecrecyRevealed; // if user requested temporary override
  };

  const isRestrictedBySigilo = !hasAccessToSensitiveDetails();

  // Handle Note Addition
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteDesc.trim()) return;

    const newEvent: TimelineEvent = {
      id: `ev-manual-${Date.now()}`,
      date: new Date().toISOString(),
      organ: activeSession.organ,
      user: activeSession.username,
      title: newNoteTitle,
      description: newNoteDesc,
      type: "nota"
    };

    const updatedCase: Case = {
      ...caseItem,
      timeline: [...caseItem.timeline, newEvent]
    };

    onUpdateCase(updatedCase);
    setNewNoteTitle("");
    setNewNoteDesc("");
  };

  // Handle manual Referral Addition
  const handleAddManualReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAction.trim()) return;

    const newRef: Referral = {
      id: `ref-det-${Date.now()}`,
      acao: manualAction,
      orgaoResponsavel: manualOrgan,
      prazo: manualPrazo || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Pendente",
      prioridade: manualPriority,
      justificativa: manualJustification || undefined,
      dataCriacao: new Date().toISOString(),
      historico: []
    };

    const newEvent: TimelineEvent = {
      id: `ev-det-ref-${Date.now()}`,
      date: new Date().toISOString(),
      organ: manualOrgan,
      user: activeSession.username,
      title: "Encaminhamento Pactuado em Rede",
      description: `Ação para ${manualOrgan}: "${manualAction}". Prazo: ${newRef.prazo.split('-').reverse().join('/')}.`,
      type: "encaminhamento"
    };

    const updatedCase: Case = {
      ...caseItem,
      encaminhamentos: [...caseItem.encaminhamentos, newRef],
      timeline: [...caseItem.timeline, newEvent]
    };

    onUpdateCase(updatedCase);
    setManualAction("");
    setManualJustification("");
  };

  // Start updating Referral Status
  const handleInitiateRefUpdate = (refId: string, nextStatus: any) => {
    setUpdatingRefId(refId);
    setRefNextStatus(nextStatus);
    setRefComment("");
  };

  // Save Referral Status with historical comment
  const handleSaveRefStatusUpdate = () => {
    if (!updatingRefId) return;

    const updatedReferrals = caseItem.encaminhamentos.map(ref => {
      if (ref.id === updatingRefId) {
        const historyEntry = {
          date: new Date().toISOString(),
          user: activeSession.username,
          organ: activeSession.organ,
          fromStatus: ref.status,
          toStatus: refNextStatus,
          comment: refComment || "Mudança de status da tarefa na rede."
        };
        return {
          ...ref,
          status: refNextStatus,
          atualizadoEm: new Date().toISOString(),
          historico: [...ref.historico, historyEntry]
        };
      }
      return ref;
    });

    const targetRef = caseItem.encaminhamentos.find(r => r.id === updatingRefId);

    const newEvent: TimelineEvent = {
      id: `ev-status-${Date.now()}`,
      date: new Date().toISOString(),
      organ: activeSession.organ,
      user: activeSession.username,
      title: `Tarefa ${refNextStatus}`,
      description: `O órgão ${activeSession.organ} marcou a ação de "${targetRef?.acao}" como ${refNextStatus}. Observação: ${refComment || "Sem observações"}`,
      type: "atualizacao_status"
    };

    const updatedCase: Case = {
      ...caseItem,
      encaminhamentos: updatedReferrals,
      timeline: [...caseItem.timeline, newEvent]
    };

    onUpdateCase(updatedCase);
    setUpdatingRefId(null);
    setRefComment("");
  };

  // Handle drag-and-drop upload simulator
  const handleDropSimulator = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // Simulating file metadata
    const randomNames = ["Relatorio_Social_CRAS.pdf", "Laudo_Medico_Clinica.pdf", "Oficio_Ministerio_Publico.pdf", "Ficha_Matricula_Educacao.pdf"];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    
    const newAnexo: Attachment = {
      id: `anx-${Date.now()}`,
      name: randomName,
      type: "application/pdf",
      size: `${Math.floor(Math.random() * 200) + 50} KB`,
      date: new Date().toISOString(),
      organ: activeSession.organ,
      uploadedBy: activeSession.username
    };

    const newEvent: TimelineEvent = {
      id: `ev-anx-${Date.now()}`,
      date: new Date().toISOString(),
      organ: activeSession.organ,
      user: activeSession.username,
      title: "Documento Anexado",
      description: `Arquivo "${newAnexo.name}" inserido por ${activeSession.username} (${activeSession.organ}).`,
      type: "anexo"
    };

    const updatedCase: Case = {
      ...caseItem,
      anexos: [...caseItem.anexos, newAnexo],
      timeline: [...caseItem.timeline, newEvent]
    };

    onUpdateCase(updatedCase);
  };

  const handleManualUploadSimulator = () => {
    if (!attachName.trim()) return;

    const cleanName = attachName.endsWith(".pdf") || attachName.endsWith(".png") || attachName.endsWith(".docx")
      ? attachName
      : `${attachName}.pdf`;

    const newAnexo: Attachment = {
      id: `anx-${Date.now()}`,
      name: cleanName,
      type: attachType,
      size: "150 KB",
      date: new Date().toISOString(),
      organ: activeSession.organ,
      uploadedBy: activeSession.username
    };

    const newEvent: TimelineEvent = {
      id: `ev-anx-${Date.now()}`,
      date: new Date().toISOString(),
      organ: activeSession.organ,
      user: activeSession.username,
      title: "Documento Anexado",
      description: `Arquivo "${newAnexo.name}" inserido por ${activeSession.username} (${activeSession.organ}).`,
      type: "anexo"
    };

    const updatedCase: Case = {
      ...caseItem,
      anexos: [...caseItem.anexos, newAnexo],
      timeline: [...caseItem.timeline, newEvent]
    };

    onUpdateCase(updatedCase);
    setAttachName("");
  };

  const handleRemoveAnexo = (anexoId: string) => {
    const targetAnx = caseItem.anexos.find(a => a.id === anexoId);
    
    const newEvent: TimelineEvent = {
      id: `ev-anx-del-${Date.now()}`,
      date: new Date().toISOString(),
      organ: activeSession.organ,
      user: activeSession.username,
      title: "Documento Excluído",
      description: `Arquivo "${targetAnx?.name}" removido do histórico por ${activeSession.username}.`,
      type: "atualizacao_status"
    };

    const updatedCase: Case = {
      ...caseItem,
      anexos: caseItem.anexos.filter(a => a.id !== anexoId),
      timeline: [...caseItem.timeline, newEvent]
    };

    onUpdateCase(updatedCase);
  };

  // Call Gemini to generate a professional formal Meeting Minute/Report
  const handleGenerateAtaWithAi = async () => {
    setAtaLoading(true);
    setIsAtaOpen(true);
    setAtaMarkdown("");

    try {
      const response = await fetch("/api/gemini/generate-minutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting: caseItem.reunioes?.[0] || {
            date: caseItem.dataCriacao.split("T")[0],
            time: "10:00",
            location: "Gabinete de Rede Protegida",
            responsibleOrgan: activeSession.organ,
            responsiblePerson: activeSession.username,
            presentOrgans: [activeSession.organ]
          },
          assistido: {
            name: caseItem.name,
            age: caseItem.age,
            address: caseItem.address,
            situation: caseItem.situation
          },
          discussions: caseItem.situationDetails,
          encaminhamentos: caseItem.encaminhamentos
        })
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar ata.");
      }

      const data = await response.json();
      setAtaMarkdown(data.markdown || "Falha na resposta do Gemini.");
    } catch (err) {
      console.error(err);
      setAtaMarkdown("Não foi possível gerar a ata. Verifique se o GEMINI_API_KEY está configurado corretamente nas Configurações da AI Studio.");
    } finally {
      setAtaLoading(false);
    }
  };

  const generateDefaultAtaTemplate = (meeting: Meeting) => {
    const dateFormatted = meeting.date.split('-').reverse().join('/');
    
    const presentOrgansList = meeting.presentOrgans || [];
    const ctRep = presentOrgansList.includes("Conselho Tutelar") ? `Representante de ${activeSession.organ === "Conselho Tutelar" ? activeSession.username : "Conselho Tutelar"}` : "______________________________________";
    const saudeRep = presentOrgansList.includes("Saúde") ? `Representante de ${activeSession.organ === "Saúde" ? activeSession.username : "Saúde"}` : "______________________________________";
    const asRep = presentOrgansList.includes("Assistência Social (CRAS/CREAS)") ? `Representante de ${activeSession.organ === "Assistência Social (CRAS/CREAS)" ? activeSession.username : "CRAS/CREAS"}` : "______________________________________";
    const educRep = presentOrgansList.includes("Educação") ? `Representante de ${activeSession.organ === "Educação" ? activeSession.username : "Educação"}` : "______________________________________";
    const polRep = presentOrgansList.includes("Polícia") ? `Representante de ${activeSession.organ === "Polícia" ? activeSession.username : "Polícia"}` : "______________________________________";
    const mpRep = presentOrgansList.includes("Ministério Público") ? `Representante de ${activeSession.organ === "Ministério Público" ? activeSession.username : "Ministério Público"}` : "______________________________________";

    // Format current case referrals/action plan items as table rows
    let tableRows = "";
    const activeReferrals = caseItem.encaminhamentos || [];
    const activeActions = caseItem.planoAcao || [];
    
    if (activeReferrals.length > 0) {
      tableRows = activeReferrals.map(ref => `| ${ref.acao} | ${ref.orgaoResponsavel} | ${ref.prazo.split('-').reverse().join('/')} |`).join("\n");
    } else if (activeActions.length > 0) {
      tableRows = activeActions.map(act => `| ${act.acao} | ${act.responsavel} | ${new Date(act.dataCriacao).toLocaleDateString("pt-BR")} |`).join("\n");
    } else {
      tableRows = "|                                              |             |       |\n|                                              |             |       |";
    }

    return `# ATA DE REUNIÃO INTERSETORIAL

**ATA Nº:** ${(caseItem.reunioes?.indexOf(meeting) !== -1 ? (caseItem.reunioes?.indexOf(meeting) ?? 0) + 1 : 1).toString().padStart(3, '0')}/${new Date(meeting.date).getFullYear()}
**Data:** ${dateFormatted}
**Horário:** ${meeting.time} às ________
**Local:** ${meeting.location}

## 1. Participantes

Estiveram presentes os representantes dos seguintes órgãos e instituições:

* Conselho Tutelar: ${ctRep}
* Saúde: ${saudeRep}
* Assistência Social: ${asRep}
* Educação: ${educRep}
* Polícia Militar/Polícia Civil: ${polRep}
* Ministério Público (quando houver): ${mpRep}
* Outros: _______________________________________________

## 2. Pauta da Reunião

1. Análise técnica e acompanhamento intersetorial do caso de: **${caseItem.name}**
2. Pactuação de novos encaminhamentos prioritários e do Plano de Ação Individual
3. Fortalecimento dos fluxos de proteção integral ao assistido e familiares

## 3. Desenvolvimento da Reunião

A reunião foi iniciada às ${meeting.time}, sob a coordenação de ${meeting.responsiblePerson} (${meeting.responsibleOrgan}), que deu as boas-vindas aos participantes e apresentou a pauta do caso de **${caseItem.name}**.

Durante o encontro, os seguintes pontos foram debatidos e articulados pela rede intersetorial:

* ${meeting.discussao || "Discussão do caso, identificação das principais fragilidades familiares e propostas de intervenção."}

Cada órgão apresentou suas considerações, informações e encaminhamentos relacionados aos temas discutidos, respeitando as competências legais e institucionais de cada setor.

## 4. Encaminhamentos

Ficaram definidos os seguintes encaminhamentos:

| Encaminhamento | Responsável | Prazo |
| -------------- | ----------- | ----- |
${tableRows}

## 5. Observações

- Todos os órgãos pactuantes se comprometem a acompanhar de forma prioritária as ações sob sua responsabilidade direta.
- Os andamentos e respostas oficiais deverão ser inseridos e atualizados no TIO System para garantir o monitoramento ágil em tempo real.

## 6. Encerramento

Nada mais havendo a tratar, a reunião foi encerrada, sendo lavrada a presente ata, que, após lida e aprovada, será assinada por todos os participantes.

**Local:** ${meeting.location}

**Data:** ${dateFormatted}

### Assinaturas

Nome: _________________________________________
Órgão: Conselho Tutelar
Assinatura: ____________________________________

Nome: _________________________________________
Órgão: Assistência Social (CRAS/CREAS)
Assinatura: ____________________________________

Nome: _________________________________________
Órgão: Saúde
Assinatura: ____________________________________

Nome: _________________________________________
Órgão: Educação
Assinatura: ____________________________________

Nome: _________________________________________
Órgão: Polícia Militar/Polícia Civil
Assinatura: ____________________________________
`;
  };

  const handleOpenAtaEditor = (meeting: Meeting, readOnly: boolean = false) => {
    setAtaEditorMeetingId(meeting.id);
    setAtaEditorReadOnly(readOnly);
    if (meeting.documentoAta) {
      setAtaEditorMarkdown(meeting.documentoAta);
    } else {
      setAtaEditorMarkdown(generateDefaultAtaTemplate(meeting));
    }
    setIsAtaEditorOpen(true);
  };

  const handleSaveAtaEditor = (newMarkdown: string) => {
    if (!ataEditorMeetingId) return;

    const updatedMeetings = (caseItem.reunioes || []).map(m => {
      if (m.id === ataEditorMeetingId) {
        return {
          ...m,
          documentoAta: newMarkdown
        };
      }
      return m;
    });

    const targetMeeting = caseItem.reunioes?.find(m => m.id === ataEditorMeetingId);
    const meetingDateFormatted = targetMeeting ? targetMeeting.date.split('-').reverse().join('/') : "";

    const newEvent: TimelineEvent = {
      id: `ev-ata-edit-${Date.now()}`,
      date: new Date().toISOString(),
      organ: activeSession.organ,
      user: activeSession.username,
      title: "Ata Oficial de Reunião Editada/Salva",
      description: `A ata oficial da reunião do dia ${meetingDateFormatted} foi preenchida e salva pelo órgão ${activeSession.organ}.`,
      type: "reuniao"
    };

    const updatedCase: Case = {
      ...caseItem,
      reunioes: updatedMeetings,
      timeline: [...(caseItem.timeline || []), newEvent]
    };

    onUpdateCase(updatedCase);
    setIsAtaEditorOpen(false);
    setAtaEditorMeetingId(null);
  };

  // Update overall Case status (Active, monitoring, completed, archived)
  const handleUpdateCaseStatus = (newStatus: any) => {
    const newEvent: TimelineEvent = {
      id: `ev-casestatus-${Date.now()}`,
      date: new Date().toISOString(),
      organ: activeSession.organ,
      user: activeSession.username,
      title: `Status do Caso: ${newStatus}`,
      description: `O status principal do caso foi alterado para "${newStatus}" por deliberação do órgão ${activeSession.organ}.`,
      type: "atualizacao_status"
    };

    const updatedCase: Case = {
      ...caseItem,
      status: newStatus,
      timeline: [...caseItem.timeline, newEvent]
    };

    onUpdateCase(updatedCase);
  };

  const handleSaveCaseEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editSituation.trim()) return;

    const newEvent: TimelineEvent = {
      id: `ev-edit-${Date.now()}`,
      date: new Date().toISOString(),
      organ: activeSession.organ,
      user: activeSession.username,
      title: "Ficha do Caso Atualizada",
      description: `A ficha de informações cadastrais gerais do caso foi atualizada por ${activeSession.username} (${activeSession.organ}).`,
      type: "atualizacao_status"
    };

    const updatedCase: Case = {
      ...caseItem,
      name: editName,
      age: Number(editAge),
      address: editAddress,
      bairro: editBairro,
      tipoViolacao: editTipoViolacao,
      sigilo: editSigilo,
      situation: editSituation,
      situationDetails: editSituationDetails,
      urgentDemands: editUrgentDemands,
      timeline: [...caseItem.timeline, newEvent]
    };

    onUpdateCase(updatedCase);
    setIsEditingCase(false);
  };

  const handleAddActionPlanItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim() || !newActionResp.trim()) return;

    const newItem = {
      id: `act-${Date.now()}`,
      acao: newActionText.trim(),
      status: "Pendente" as const,
      responsavel: newActionResp.trim(),
      dataCriacao: new Date().toISOString()
    };

    const updatedCase: Case = {
      ...caseItem,
      planoAcao: [...(caseItem.planoAcao || []), newItem]
    };

    onUpdateCase(updatedCase);
    setNewActionText("");
    setNewActionResp("");
  };

  const handleToggleActionStatus = (actionId: string) => {
    const updatedPlan = (caseItem.planoAcao || []).map(item => {
      if (item.id === actionId) {
        return {
          ...item,
          status: item.status === "Concluído" ? ("Pendente" as const) : ("Concluído" as const)
        };
      }
      return item;
    });

    const updatedCase: Case = {
      ...caseItem,
      planoAcao: updatedPlan
    };

    onUpdateCase(updatedCase);
  };

  const handleDeleteActionItem = (actionId: string) => {
    const updatedPlan = (caseItem.planoAcao || []).filter(item => item.id !== actionId);
    
    const updatedCase: Case = {
      ...caseItem,
      planoAcao: updatedPlan
    };

    onUpdateCase(updatedCase);
  };

  const handleSuggestAiActions = async () => {
    setAiActionsLoading(true);
    try {
      const response = await fetch("/api/gemini/suggest-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: caseItem.name,
          age: caseItem.age,
          situation: caseItem.situation,
          situationDetails: caseItem.situationDetails,
          urgentDemands: caseItem.urgentDemands
        })
      });

      if (!response.ok) throw new Error("Erro de conexão");
      const data = await response.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        const newItems = data.suggestions.map((s: any, idx: number) => ({
          id: `ai-act-${Date.now()}-${idx}`,
          acao: s.acao,
          status: "Pendente" as const,
          responsavel: s.orgaoResponsavel || "Não especificado",
          dataCriacao: new Date().toISOString()
        }));

        const updatedCase: Case = {
          ...caseItem,
          planoAcao: [...(caseItem.planoAcao || []), ...newItems]
        };
        onUpdateCase(updatedCase);
      }
    } catch (err) {
      console.error(err);
      alert("Não foi possível gerar sugestões via IA neste momento.");
    } finally {
      setAiActionsLoading(false);
    }
  };

  return (
    <div className="space-y-8" id="case-workspace">
      
      {/* Back button and status header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          id="btn-back-to-list"
        >
          <ArrowLeft size={16} />
          Voltar para a Lista de Casos
        </button>

        {/* Case state indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span>
            Sigilo: <strong className="text-slate-800 ml-1">{caseItem.sigilo}</strong>
          </div>

          <select
            value={caseItem.status}
            onChange={e => handleUpdateCaseStatus(e.target.value as any)}
            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-all focus:outline-none cursor-pointer"
            id="select-case-overall-status"
          >
            <option value="Ativo">Ativo (Na Rede)</option>
            <option value="Em Acompanhamento">Em Acompanhamento</option>
            <option value="Concluído">Pactuação Concluída</option>
            <option value="Arquivado">Arquivado</option>
          </select>
        </div>
      </div>

      {/* Case Quick Overview and Secrecy Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
        <div className="absolute right-0 top-0 w-32 h-32 bg-slate-50 rounded-bl-full pointer-events-none"></div>
        <div className="p-8">
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Visual Initials or Blur */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-lg flex items-center justify-center shadow-md">
                  {caseItem.name.substring(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-sans text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      {isRestrictedBySigilo ? (
                        <span>M. [OCULTO POR SIGILO]</span>
                      ) : (
                        <PrivacyText text={caseItem.name} type="name" safeMode={safeMode} className="font-sans text-2xl font-bold text-slate-900" />
                      )}
                    </h1>
                    {isRestrictedBySigilo ? (
                      <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-rose-100">
                        <Lock size={10} /> Oculto
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-emerald-100">
                        <Unlock size={10} /> Revelado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">ID: {caseItem.id} · Cadastrado em {new Date(caseItem.dataCriacao).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Bio Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm pt-2 text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  <span>Idade: <strong className="text-slate-800">{caseItem.age} anos</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  <span className="truncate flex items-center gap-1.5">
                    Endereço: {" "}
                    {isRestrictedBySigilo ? (
                      <span className="blur-[4px] select-none bg-slate-100 rounded px-1.5 py-0.5 text-xs text-slate-300">Rua das Flores Ocultada</span>
                    ) : (
                      <PrivacyText text={caseItem.address} type="address" safeMode={safeMode} className="text-sm font-semibold text-slate-800" />
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Summary and Risk Banner */}
            <div className="space-y-2 shrink-0 md:max-w-xs">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risco Identificado</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    caseItem.nivelRiscoAI === "Crítico" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                    caseItem.nivelRiscoAI === "Alto" ? "bg-orange-50 text-orange-600 border border-orange-100" :
                    caseItem.nivelRiscoAI === "Médio" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                    "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  }`}>
                    {caseItem.nivelRiscoAI || "Análise Pendente"}
                  </span>
                </div>
                {caseItem.resumoAI ? (
                  <p className="text-xs text-slate-500 leading-normal font-sans italic">
                    "{caseItem.resumoAI}"
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">Solicite a análise de IA editando este caso.</p>
                )}
              </div>
            </div>
          </div>

          {/* Secrecy bypass explanation for other network organs */}
          {isRestrictedBySigilo && (
            <div className="mt-6 p-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-start gap-2">
                <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Por razões de sigilo legal (estatuto de menor), dados nominativos e endereços estão ofuscados para o órgão <strong className="text-slate-900">{activeSession.organ}</strong>. Caso necessário para providências de urgência, solicite a revelação temporária.
                </p>
              </div>
              <button
                onClick={() => setIsSecrecyRevealed(!isSecrecyRevealed)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded-xl transition-all border border-amber-200"
                id="btn-reveal-sensitive-info"
              >
                <Eye size={13} />
                Revelar Dados
              </button>
            </div>
          )}

          {/* Active secrecy removal warning */}
          {!isRestrictedBySigilo && caseItem.sigilo !== "Público" && (
            <div className="mt-6 p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <Unlock size={14} className="text-emerald-600 shrink-0" />
                <span>Você tem acesso total aos dados nominativos deste caso (Autorizado para {activeSession.organ}).</span>
              </div>
              {isSecrecyRevealed && (
                <button
                  onClick={() => setIsSecrecyRevealed(false)}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                  id="btn-hide-sensitive-info"
                >
                  Ocultar novamente
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-100 gap-1 overflow-x-auto">
        {[
          { id: "geral", label: "Ficha do Caso", icon: FileText },
          { id: "timeline", label: "Linha do Tempo / Discussões", icon: Clock },
          { id: "encaminhamentos", label: "Encaminhamentos de Rede", icon: ShieldAlert },
          { id: "atas", label: "Atas de Reunião", icon: MessageSquare },
          { id: "anexos", label: "Anexos / Relatórios", icon: Paperclip }
        ].map(t => {
          const IsActive = activeSubTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id as any)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all shrink-0 cursor-pointer ${
                IsActive
                  ? "border-indigo-600 text-indigo-600 bg-indigo-50/10"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200"
              }`}
              id={`btn-tab-${t.id}`}
            >
              <Icon size={15} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB CONTENTS */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm font-sans min-h-[400px]" style={{ perspective: "1000px" }}>
        
        <AnimatePresence mode="wait">
          {activeSubTab === "geral" ? (
            <motion.div
              key="geral"
              variants={subTabFlipVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ backfaceVisibility: "hidden" }}
              className="space-y-8"
              id="subtab-geral"
            >
            {isEditingCase ? (
              <form onSubmit={handleSaveCaseEdits} className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-sans text-lg font-bold text-slate-900">Editar Ficha Cadastral</h3>
                    <p className="text-xs text-slate-500">Atualize as informações gerais e salve para registrar as alterações na linha do tempo.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingCase(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome ou Iniciais</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Idade</label>
                    <input
                      type="number"
                      value={editAge}
                      onChange={e => setEditAge(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Endereço</label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={e => setEditAddress(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nível de Sigilo</label>
                    <select
                      value={editSigilo}
                      onChange={e => setEditSigilo(e.target.value as any)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm font-semibold focus:outline-none transition-all"
                    >
                      <option value="Público">Público</option>
                      <option value="Sigiloso">Sigiloso</option>
                      <option value="Restrito">Restrito</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bairro / Localidade</label>
                    <input
                      type="text"
                      value={editBairro}
                      onChange={e => setEditBairro(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Violação</label>
                    <input
                      type="text"
                      value={editTipoViolacao}
                      onChange={e => setEditTipoViolacao(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resumo da Situação</label>
                  <input
                    type="text"
                    value={editSituation}
                    onChange={e => setEditSituation(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Relato e Histórico Detalhado</label>
                    <textarea
                      rows={5}
                      value={editSituationDetails}
                      onChange={e => setEditSituationDetails(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all resize-none font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Demandas Urgentes Pactuadas</label>
                    <textarea
                      rows={5}
                      value={editUrgentDemands}
                      onChange={e => setEditUrgentDemands(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all resize-none font-sans"
                    />
                  </div>
                </div>
              </form>
            ) : (
              <>
                {/* Read-only layout */}
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div className="space-y-1">
                    <h3 className="font-sans text-lg font-bold text-slate-900">Resumo da Situação</h3>
                    <p className="text-xs text-slate-500">Natureza principal: <span className="font-semibold text-slate-800">{caseItem.tipoViolacao || "Geral"}</span> | Bairro: <span className="font-semibold text-slate-800">{caseItem.bairro || "Não cadastrado"}</span></p>
                  </div>
                  {activeSession.role !== "Visualizar" && (
                    <button
                      onClick={() => setIsEditingCase(true)}
                      className="px-4 py-2 text-xs font-bold text-indigo-600 hover:text-white border border-indigo-200 hover:bg-indigo-600 rounded-xl transition-all cursor-pointer shadow-sm"
                      id="btn-edit-case-details"
                    >
                      Editar Ficha
                    </button>
                  )}
                </div>

                <p className="text-slate-700 text-sm leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {caseItem.situation}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                  <div className="space-y-3">
                    <h3 className="font-sans text-md font-bold text-slate-800 flex items-center gap-2">
                      <FileText size={16} className="text-slate-400" />
                      Relato e Histórico Detalhado
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-white border border-slate-100 p-5 rounded-2xl shadow-inner min-h-[150px]">
                      {caseItem.situationDetails || "Sem detalhes adicionais informados."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-sans text-md font-bold text-slate-800 flex items-center gap-2">
                      <ShieldAlert size={16} className="text-rose-400" />
                      Demandas Urgentes Pactuadas
                    </h3>
                    <p className="text-rose-950 text-sm leading-relaxed whitespace-pre-line bg-rose-50/20 border border-rose-100/40 p-5 rounded-2xl min-h-[150px]">
                      {caseItem.urgentDemands || "Nenhuma demanda urgente listada."}
                    </p>
                  </div>
                </div>

                {/* AI vulnerabilities section */}
                {caseItem.vulnerabilidadesAI && caseItem.vulnerabilidadesAI.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h3 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={13} className="text-indigo-600 animate-spin" />
                      Fatores de Risco e Vulnerabilidades Mapeados por IA
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {caseItem.vulnerabilidadesAI.map((vul, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl text-xs font-semibold text-slate-700 transition-colors">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          {vul}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* PLANO DE AÇÃO DO CASO (Priority Advanced Differential) */}
                <div className="pt-6 mt-6 border-t border-slate-100 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-sans text-md font-bold text-slate-800 flex items-center gap-2">
                        <UserCheck size={18} className="text-indigo-600" />
                        Plano de Ação Intersetorial do Caso
                      </h3>
                      <p className="text-xs text-slate-500">
                        Metas pactuadas, responsáveis diretos e andamento das providências.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeSession.role !== "Visualizar" && (
                        <button
                          type="button"
                          onClick={handleSuggestAiActions}
                          disabled={aiActionsLoading}
                          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all disabled:opacity-60 cursor-pointer"
                        >
                          {aiActionsLoading ? (
                            <span className="inline-block w-3 h-3 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <Sparkles size={13} />
                          )}
                          IA Gerar Recomendações de Ação
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {caseItem.planoAcao && caseItem.planoAcao.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                          <span>Metas Concluídas</span>
                          <span className="font-bold text-slate-800">
                            {caseItem.planoAcao.filter(item => item.status === "Concluído").length} de {caseItem.planoAcao.length}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-500" 
                            style={{ 
                              width: `${Math.round((caseItem.planoAcao.filter(item => item.status === "Concluído").length / caseItem.planoAcao.length) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* List of actions */}
                  <div className="space-y-2.5">
                    {caseItem.planoAcao && caseItem.planoAcao.length > 0 ? (
                      caseItem.planoAcao.map(item => (
                        <div 
                          key={item.id} 
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            item.status === "Concluído" 
                              ? "bg-emerald-50/10 border-emerald-100 text-slate-500" 
                              : "bg-white border-slate-100 shadow-sm"
                          }`}
                        >
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => activeSession.role !== "Visualizar" && handleToggleActionStatus(item.id)}
                              disabled={activeSession.role === "Visualizar"}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                                item.status === "Concluído"
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "border-slate-300 hover:border-indigo-500"
                              } ${activeSession.role !== "Visualizar" ? "cursor-pointer" : ""}`}
                            >
                              {item.status === "Concluído" && <Check size={12} strokeWidth={3} />}
                            </button>
                            <div className="min-w-0">
                              <p className={`text-sm font-semibold text-slate-800 ${item.status === "Concluído" ? "line-through text-slate-400 font-medium" : ""}`}>
                                {item.acao}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Responsável:</span>
                                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                                  item.status === "Concluído" ? "bg-slate-100 text-slate-400" : "bg-indigo-50 text-indigo-700"
                                }`}>
                                  {item.responsavel}
                                </span>
                                <span className="text-[10px] text-slate-400">· Criado em {new Date(item.dataCriacao).toLocaleDateString("pt-BR")}</span>
                              </div>
                            </div>
                          </div>

                          {activeSession.role !== "Visualizar" && (
                            <button
                              type="button"
                              onClick={() => handleDeleteActionItem(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer shrink-0 ml-4"
                              title="Excluir do plano"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 border-2 border-dashed border-slate-150 rounded-2xl bg-slate-50/50">
                        <UserCheck size={28} className="text-slate-300 mx-auto mb-1.5 stroke-1" />
                        <p className="text-xs text-slate-500 font-medium">Nenhum item cadastrado no Plano de Ação.</p>
                      </div>
                    )}
                  </div>

                  {/* Add action form */}
                  {activeSession.role !== "Visualizar" && (
                    <form onSubmit={handleAddActionPlanItem} className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl gap-4 flex flex-col md:flex-row items-end">
                      <div className="flex-1 space-y-1.5 w-full">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nova Ação do Plano</label>
                        <input
                          type="text"
                          placeholder="Ex: Realizar acolhimento institucional, requerer prontuário..."
                          value={newActionText}
                          onChange={e => setNewActionText(e.target.value)}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all"
                          required
                        />
                      </div>
                      <div className="md:w-64 space-y-1.5 w-full">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Responsável</label>
                        <input
                          type="text"
                          placeholder="Ex: CRAS Centro, Conselho Tutelar, etc."
                          value={newActionResp}
                          onChange={e => setNewActionResp(e.target.value)}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-md"
                      >
                        Pactuar Ação
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
          </motion.div>
        ) : activeSubTab === "timeline" ? (
          <motion.div
            key="timeline"
            variants={subTabFlipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ backfaceVisibility: "hidden" }}
            className="space-y-8"
            id="subtab-timeline"
          >
            
            {/* Note creation form */}
            {activeSession.role !== "Visualizar" && (
              <form onSubmit={handleAddNote} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 space-y-4">
                <div className="flex items-center gap-2">
                  <Plus size={16} className="text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Inserir Nota no Diário do Caso</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Título da Nota</label>
                    <input
                      type="text"
                      placeholder="Ex: Visita domiciliar agendada, retorno da mãe..."
                      value={newNoteTitle}
                      onChange={e => setNewNoteTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all"
                      id="inp-note-title"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                      id="btn-add-note"
                    >
                      Registrar Evento
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Relato ou Observação</label>
                  <textarea
                    rows={2}
                    placeholder="O que ocorreu? Detalhe o contato ou progresso..."
                    value={newNoteDesc}
                    onChange={e => setNewNoteDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all resize-none"
                    id="inp-note-desc"
                  />
                </div>
              </form>
            )}

            {/* Vertical timeline visualizer */}
            <div className="space-y-6 pt-2">
              <h3 className="font-sans text-md font-bold text-slate-800">Linha do Tempo de Acompanhamento</h3>
              
              <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-8">
                {caseItem.timeline && caseItem.timeline.length > 0 ? (
                  caseItem.timeline.slice().reverse().map((event, idx) => {
                    
                    // Icon and color depending on event type
                    const eventIconMap = {
                      criacao: "bg-emerald-500 text-white",
                      reunioes: "bg-indigo-500 text-white",
                      reuniao: "bg-indigo-500 text-white",
                      encaminhamento: "bg-amber-500 text-white",
                      atualizacao_status: "bg-blue-500 text-white",
                      anexo: "bg-teal-500 text-white",
                      nota: "bg-slate-600 text-white"
                    };

                    const bgClass = eventIconMap[event.type] || "bg-slate-500 text-white";

                    return (
                      <div key={event.id || idx} className="relative group">
                        
                        {/* Timeline node badge */}
                        <div className={`absolute -left-10 top-0.5 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-md ${bgClass}`}>
                          {event.type === "criacao" && <Plus size={13} />}
                          {event.type === "reuniao" && <Calendar size={13} />}
                          {event.type === "encaminhamento" && <ShieldAlert size={13} />}
                          {event.type === "atualizacao_status" && <Check size={13} />}
                          {event.type === "anexo" && <Paperclip size={13} />}
                          {event.type === "nota" && <MessageSquare size={13} />}
                        </div>

                        {/* Node Card */}
                        <div className="bg-slate-50/50 hover:bg-slate-50 p-5 rounded-2xl border border-slate-100 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
                            <span className="text-xs font-mono font-semibold text-slate-400">
                              {new Date(event.date).toLocaleDateString()} às {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/40">
                              {event.organ} · {event.user}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm">{event.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed mt-1">{event.description}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500">Sem eventos registrados.</p>
                )}
              </div>
            </div>
          </motion.div>
        ) : activeSubTab === "encaminhamentos" ? (
          <motion.div
            key="encaminhamentos"
            variants={subTabFlipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ backfaceVisibility: "hidden" }}
            className="space-y-8"
            id="subtab-encaminhamentos"
          >
            
            {/* Manual referral creator inside active workspace */}
            {activeSession.role !== "Visualizar" && (
              <form onSubmit={handleAddManualReferral} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 space-y-4">
                <div className="flex items-center gap-2">
                  <Plus size={16} className="text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Adicionar Novo Encaminhamento na Rede</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Ação Pactuada</label>
                    <input
                      type="text"
                      placeholder="Ex: Matrícula em creche, consulta com neuropediatra..."
                      value={manualAction}
                      onChange={e => setManualAction(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all"
                      id="inp-det-action"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Órgão Responsável pela Execução</label>
                    <select
                      value={manualOrgan}
                      onChange={e => setManualOrgan(e.target.value as Organ)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-all"
                      id="inp-det-organ"
                    >
                      {ALL_ORGANS.filter(o => o !== "Rede Geral").map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Prazo de Resolução</label>
                    <input
                      type="date"
                      value={manualPrazo}
                      onChange={e => setManualPrazo(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-all"
                      id="inp-det-deadline"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Grau de Prioridade</label>
                    <select
                      value={manualPriority}
                      onChange={e => setManualPriority(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-all"
                      id="inp-det-priority"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Média">Média</option>
                      <option value="Baixa">Baixa</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                      id="btn-det-add-referral"
                    >
                      Pactuar Ação
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Justificativa da Ação (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Justifique brevemente por que essa providência foi considerada essencial."
                    value={manualJustification}
                    onChange={e => setManualJustification(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all"
                    id="inp-det-just"
                  />
                </div>
              </form>
            )}

            {/* Referrals visual monitoring board */}
            <div className="space-y-5">
              <h3 className="font-sans text-md font-bold text-slate-800">Acompanhamento de Metas de Rede</h3>
              
              <div className="grid grid-cols-1 gap-4">
                {caseItem.encaminhamentos && caseItem.encaminhamentos.length > 0 ? (
                  caseItem.encaminhamentos.map(ref => {
                    const statusColors = {
                      Pendente: "bg-amber-50 text-amber-700 border-amber-200/60",
                      "Em andamento": "bg-blue-50 text-blue-700 border-blue-200/60",
                      Concluído: "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                    };

                    const priorityColors = {
                      Alta: "bg-rose-50 text-rose-600 border-rose-100",
                      Média: "bg-amber-50 text-amber-700 border-amber-100",
                      Baixa: "bg-slate-50 text-slate-600 border-slate-100"
                    };

                    const isMine = ref.orgaoResponsavel === activeSession.organ;
                    const canEditTask = activeSession.role !== "Visualizar" && (isMine || activeSession.role === "Administrador");

                    return (
                      <div key={ref.id} className="p-5 bg-white border border-slate-100 hover:border-slate-200/80 rounded-2xl shadow-sm transition-all flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">{ref.orgaoResponsavel}</span>
                            <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md border ${priorityColors[ref.prioridade]}`}>
                              {ref.prioridade}
                            </span>
                            <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md border ${statusColors[ref.status]}`}>
                              {ref.status}
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-slate-800 text-sm leading-tight">{ref.acao}</h4>
                          {ref.justificativa && (
                            <p className="text-xs text-slate-400 font-medium">Justificativa: {ref.justificativa}</p>
                          )}

                          {/* Historical logs for status modifications */}
                          {ref.historico && ref.historico.length > 0 && (
                            <div className="mt-3.5 pt-3 border-t border-slate-50 space-y-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Histórico de atualizações:</span>
                              {ref.historico.map((h, i) => (
                                <div key={i} className="text-[11px] text-slate-500 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/40">
                                  <strong className="text-slate-700">{h.organ} ({h.user})</strong> alterou de <span className="italic">{h.fromStatus}</span> para <span className="font-semibold text-slate-700">{h.toStatus}</span>:
                                  <p className="text-slate-600 italic mt-0.5 font-sans">"{h.comment}"</p>
                                  <span className="text-[9px] text-slate-400 font-mono block mt-1">{new Date(h.date).toLocaleDateString()} às {new Date(h.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Status update controls */}
                        <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-3">
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Prazo Pactuado</span>
                            <span className="text-xs font-mono font-bold text-slate-700">{ref.prazo.split('-').reverse().join('/')}</span>
                          </div>

                          {/* Controls if authorized */}
                          {canEditTask ? (
                            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
                              {["Pendente", "Em andamento", "Concluído"].map(st => (
                                <button
                                  key={st}
                                  onClick={() => handleInitiateRefUpdate(ref.id, st as any)}
                                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                                    ref.status === st
                                      ? "bg-slate-900 text-white shadow-sm"
                                      : "text-slate-500 hover:text-slate-800 hover:bg-white"
                                  }`}
                                  id={`btn-ref-status-${ref.id}-${st.replace(" ", "")}`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium italic flex items-center gap-1">
                              <Lock size={11} /> Apenas {ref.orgaoResponsavel}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500">Nenhum encaminhamento registrado.</p>
                )}
              </div>
            </div>

            {/* Comment transition dialog */}
            {updatingRefId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 font-sans">
                  <h3 className="font-bold text-slate-900 text-md">Justificativa da Atualização</h3>
                  <p className="text-xs text-slate-500">Insira uma breve justificativa ou andamento para registrar no histórico da ação:</p>
                  
                  <textarea
                    rows={3}
                    placeholder="Ex: Ofício enviado, visita realizada, aguardando parecer do médico..."
                    value={refComment}
                    onChange={e => setRefComment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all resize-none"
                    id="inp-transition-comment"
                  />

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      onClick={() => setUpdatingRefId(null)}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
                      id="btn-cancel-transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveRefStatusUpdate}
                      className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-100"
                      id="btn-save-transition"
                    >
                      Confirmar Mudança
                    </button>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        ) : activeSubTab === "atas" ? (
          <motion.div
            key="atas"
            variants={subTabFlipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ backfaceVisibility: "hidden" }}
            className="space-y-6"
            id="subtab-atas"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-sans text-md font-bold text-slate-800">Atas das Reuniões de Rede</h3>
                <p className="text-xs text-slate-500">Gere e visualize relatórios formais em Markdown utilizando IA.</p>
              </div>

              <button
                onClick={handleGenerateAtaWithAi}
                className="flex items-center gap-2 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-100 cursor-pointer"
                id="btn-generate-ata"
              >
                <Sparkles size={16} />
                Gerar Ata Formal com IA (Gemini)
              </button>
            </div>

            {/* Form button and expand state to record new meetings */}
            {activeSession.role !== "Visualizar" && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-600" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Registrar Reunião de Colegiado e Presenças</h4>
                      <p className="text-[11px] text-slate-500">Marque a presença dos órgãos que foram e salve as discussões.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddMeeting(!showAddMeeting)}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    id="btn-toggle-add-meeting"
                  >
                    {showAddMeeting ? "Fechar Formulário" : "Registrar Nova Reunião"}
                  </button>
                </div>

                {showAddMeeting && (
                  <form onSubmit={handleSaveNewMeeting} className="pt-4 border-t border-slate-200/60 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Data da Reunião</label>
                        <input
                          type="date"
                          value={meetDate}
                          onChange={e => setMeetDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                          id="inp-meet-date"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Horário</label>
                        <input
                          type="time"
                          value={meetTime}
                          onChange={e => setMeetTime(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all font-mono"
                          id="inp-meet-time"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Local ou Canal</label>
                        <input
                          type="text"
                          placeholder="Ex: Google Meet, CRAS Central, Ministério Público"
                          value={meetLocation}
                          onChange={e => setMeetLocation(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all"
                          id="inp-meet-location"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Mediador / Coordenador</label>
                        <input
                          type="text"
                          value={meetPerson}
                          onChange={e => setMeetPerson(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all"
                          id="inp-meet-person"
                          required
                        />
                      </div>
                    </div>

                    {/* Presenças Checklist */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">
                        Presença dos Órgãos (Marque todos os órgãos que foram à reunião)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {ALL_ORGANS.map(organ => {
                          const isPresent = meetPresentOrgans.includes(organ);
                          return (
                            <button
                              type="button"
                              key={organ}
                              onClick={() => handleToggleMeetOrgan(organ)}
                              className={`flex items-center gap-2 p-2 text-[11px] font-semibold rounded-xl border text-left transition-all ${
                                isPresent
                                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                              id={`btn-meet-organ-chk-${organ.replace(/[^a-zA-Z0-9]/g, "")}`}
                            >
                              <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-all shrink-0 ${
                                isPresent ? "bg-indigo-600 text-white" : "border border-slate-300"
                              }`}>
                                {isPresent && <Check size={10} strokeWidth={3} />}
                              </div>
                              <span className="truncate">{organ}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Deliberações e Discussão de Caso</label>
                      <textarea
                        rows={4}
                        placeholder="Quais propostas foram apresentadas? Quais justificativas foram pactuadas pelos órgãos presentes?"
                        value={meetDiscussion}
                        onChange={e => setMeetDiscussion(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all resize-none"
                        id="inp-meet-discussion"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setShowAddMeeting(false)}
                        className="px-3.5 py-2 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
                        id="btn-cancel-new-meeting"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-100"
                        id="btn-submit-new-meeting"
                      >
                        Salvar Reunião de Rede
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Past meeting card list */}
            <div className="space-y-4">
              {caseItem.reunioes && caseItem.reunioes.length > 0 ? (
                caseItem.reunioes.map((m, idx) => (
                  <div key={m.id || idx} className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-800">Reunião em {m.date.split('-').reverse().join('/')} às {m.time}</span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
                        Coordenador: {m.responsiblePerson} ({m.responsibleOrgan})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-slate-600 bg-white p-4 rounded-xl border border-slate-100">
                      <div>
                        <strong className="text-slate-400 block mb-0.5 uppercase tracking-wider text-[9px]">Local / Formato</strong>
                        <span>{m.location}</span>
                      </div>
                      <div className="md:col-span-2">
                        <strong className="text-slate-400 block mb-0.5 uppercase tracking-wider text-[9px]">Órgãos Presentes</strong>
                        <span>{m.presentOrgans?.join(", ") || "Nenhum informado"}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <strong className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discussões e Deliberações da Mesa</strong>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-slate-100/60 font-serif">
                        {m.discussao}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 mt-2 gap-3">
                      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${m.documentoAta ? "bg-emerald-500" : "bg-amber-400"}`}></span>
                        <span>{m.documentoAta ? "Ata Oficial preenchida e gravada" : "Ata Oficial pendente de preenchimento"}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenAtaEditor(m, activeSession.role === "Visualizar")}
                        className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer border ${
                          m.documentoAta
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100/80"
                            : "bg-slate-900 border-slate-900 text-white hover:bg-slate-800"
                        }`}
                        id={`btn-open-ata-editor-${m.id}`}
                      >
                        <FileText size={13} />
                        {m.documentoAta ? "Ver / Editar ATA Oficial" : "Preencher ATA pelo Modelo"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">Nenhuma ata cadastrada ainda.</p>
              )}
            </div>
          </motion.div>
        ) : activeSubTab === "anexos" ? (
          <motion.div
            key="anexos"
            variants={subTabFlipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ backfaceVisibility: "hidden" }}
            className="space-y-6"
            id="subtab-anexos"
          >
            
            <div className="flex flex-col md:flex-row gap-6">
              
              {/* Drag and Drop Simulator */}
              {activeSession.role !== "Visualizar" && (
                <div className="flex-1 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Anexar Laudo, Relatório ou Ofício</h4>
                  
                  <div
                    onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDropSimulator}
                    className={`h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all ${
                      isDragOver
                        ? "border-indigo-600 bg-indigo-50/20"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                    }`}
                  >
                    <Upload size={24} className={`mb-2 transition-transform ${isDragOver ? "scale-125 text-indigo-600" : "text-slate-400"}`} />
                    <p className="text-xs font-bold text-slate-700">Arraste e solte o arquivo aqui</p>
                    <p className="text-[10px] text-slate-400 mt-1">Simule o drag-and-drop para anexar relatórios instantaneamente</p>
                  </div>

                  <div className="text-center text-xs text-slate-400 font-medium">
                    OU preencha manualmente abaixo
                  </div>

                  {/* Manual add input */}
                  <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Nome do Documento</label>
                      <input
                        type="text"
                        placeholder="Ex: Laudo_Psicologico_CREAS"
                        value={attachName}
                        onChange={e => setAttachName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all"
                        id="inp-anx-name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Formato</label>
                        <select
                          value={attachType}
                          onChange={e => setAttachType(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none transition-all font-semibold"
                          id="inp-anx-type"
                        >
                          <option value="application/pdf">PDF (.pdf)</option>
                          <option value="image/png">Imagem (.png, .jpg)</option>
                          <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word (.docx)</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleManualUploadSimulator}
                          className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                          id="btn-add-anx"
                        >
                          Anexar Manual
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments List */}
              <div className="flex-1 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Histórico de Arquivos Anexados</h4>
                
                <div className="space-y-2.5">
                  {caseItem.anexos && caseItem.anexos.length > 0 ? (
                    caseItem.anexos.map(anx => (
                      <div key={anx.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-slate-200 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Paperclip size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{anx.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {anx.size} · Upload em {new Date(anx.date).toLocaleDateString()} por {anx.uploadedBy} ({anx.organ})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {activeSession.role !== "Visualizar" && (
                            <button
                              onClick={() => handleRemoveAnexo(anx.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              id={`btn-del-anx-${anx.id}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-slate-50/30 border border-slate-100 border-dashed rounded-2xl">
                      <p className="text-xs text-slate-400 italic">Nenhum documento anexado a esta ficha.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </motion.div>
        ) : null}
      </AnimatePresence>

      </div>

      {/* Ata modal with AI Markdown result */}
      <AtaModal
        isOpen={isAtaOpen}
        onClose={() => setIsAtaOpen(false)}
        markdown={ataMarkdown}
        loading={ataLoading}
      />

      {/* Editable ATA modal with custom Markdown template and editor */}
      <AtaEditorModal
        isOpen={isAtaEditorOpen}
        onClose={() => setIsAtaEditorOpen(false)}
        initialMarkdown={ataEditorMarkdown}
        onSave={handleSaveAtaEditor}
        readOnly={ataEditorReadOnly}
        title={`Ata de Reunião - Caso ${caseItem.name}`}
      />

    </div>
  );
}
