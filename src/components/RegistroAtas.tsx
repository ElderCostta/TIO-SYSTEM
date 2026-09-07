import React from "react";
import ReactMarkdown from "react-markdown";
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Printer, 
  Copy, 
  Check, 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  X, 
  Sparkles, 
  Filter, 
  Eye, 
  Save, 
  Undo2,
  FileSpreadsheet,
  Download,
  Camera,
  Image as ImageIcon,
  Paperclip,
  Upload,
  Maximize2,
  ZoomIn
} from "lucide-react";
import { GeneralAta, UserSession } from "../types";
import { DEFAULT_GENERAL_ATAS } from "../data";
import { 
  formatDateBR, 
  getPortugueseDateInWords, 
  getLocalTodayISO, 
  formatDateTimeBR 
} from "../utils/dateUtils";

import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial template generator matching the user's exact structure
const generateGlobalAtaTemplate = (data: {
  date: string;
  time: string;
  location: string;
  coordinator: string;
  objective: string;
  participants: {
    conselhoTutelar: string;
    educacao: string;
    assistenciaSocial: string;
    saude: string;
    policia: string;
    outros: string;
  };
  pauta: string;
  discussao: string;
  encaminhamentos: string;
  consideracoes: string;
  encerradoAs: string;
  secretario: string;
}) => {
  const { day, month, year } = getPortugueseDateInWords(data.date);
  const timeFormatted = data.time || "______";
  const locationFormatted = data.location || "____________________________________________";
  const coordinatorFormatted = data.coordinator || "______________________________________";
  
  const ctPart = data.participants.conselhoTutelar || "__________________________________________";
  const educPart = data.participants.educacao || "__________________________________________";
  const asPart = data.participants.assistenciaSocial || "__________________________________________";
  const saudePart = data.participants.saude || "__________________________________________";
  const polPart = data.participants.policia || "__________________________________________";
  const outrosPart = data.participants.outros || "______________________________________________________";

  return `# ATA DE REUNIÃO INTERSETORIAL

Aos **${day}** dias do mês de **${month}** do ano de **${year}**, às **${timeFormatted}** horas, realizou-se a reunião intersetorial na (local da reunião) **${locationFormatted}**, com a presença dos representantes dos seguintes órgãos: Conselho Tutelar, Educação, Assistência Social, Saúde, Polícia e demais participantes conforme lista de presença em anexo.

**1. ABERTURA:**
A reunião foi iniciada por **${coordinatorFormatted}**, que deu as boas-vindas a todos os presentes e destacou a importância da articulação intersetorial para a garantia de direitos de crianças e adolescentes.

**2. OBJETIVO DA REUNIÃO:**
${data.objective || "(Descrever o objetivo principal da reunião, ex: discutir casos, alinhar estratégias, fortalecer ações conjuntas, etc.)\n\n---\n\n---"}

**3. PARTICIPANTES:**
(Listar nome completo, órgão e função)

* ${ctPart} – Conselho Tutelar
* ${educPart} – Educação
* ${asPart} – Assistência Social
* ${saudePart} – Saúde
* ${polPart} – Polícia
* Outros: ${outrosPart}

**4. PAUTA:**
${data.pauta || "* ---\n* ---\n* ---"}

**5. DISCUSSÃO DOS CASOS / TEMAS:**
(Descrever os casos discutidos ou temas abordados, preservando sigilo quando necessário)

${data.discussao || "---\n\n---\n\n---"}

**6. ENCAMINHAMENTOS E DELIBERAÇÕES:**
(Descrever as decisões tomadas, responsabilidades e prazos)

${data.encaminhamentos || "* ---\n\n* Responsável: __________________________ Prazo: _______________\n\n* ---\n\n* Responsável: __________________________ Prazo: _______________\n\n* ---\n\n* Responsável: __________________________ Prazo: _______________"}

**7. CONSIDERAÇÕES FINAIS:**
${data.consideracoes || "\n---\n\n---"}

**8. ENCERRAMENTO E VALIDAÇÃO DE PRESENÇAS:**
Nada mais havendo a tratar, a reunião foi encerrada às **${data.encerradoAs || "______"}** horas. Eu, **${data.secretario || "________________________________________"}**, lavrei a presente ata, cuja comprovação e validação oficial de presenças dos representantes institucionais e convidados se dão mediante a **Lista de Presença** física devidamente assinada e anexada em fotografia a este registro.

**ANEXO OBRIGATÓRIO:** Lista de Presença Oficial da Reunião (Fotografia/Documento Digitalizado Anexo)`;
};

interface RegistroAtasProps {
  activeSession: UserSession;
  realTimeSync: boolean;
}

export default function RegistroAtas({ activeSession, realTimeSync }: RegistroAtasProps) {
  // Core Registry State
  const [atas, setAtas] = React.useState<GeneralAta[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedAta, setSelectedAta] = React.useState<GeneralAta | null>(null);
  
  // Editor and Create Modes
  const [isCreating, setIsCreating] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"form" | "markdown">("form");
  const [editorMarkdown, setEditorMarkdown] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  // Form Fields State (to help user pre-fill the template easily)
  const [formDate, setFormDate] = React.useState(getLocalTodayISO());
  const [formTime, setFormTime] = React.useState("09:00");
  const [formLocation, setFormLocation] = React.useState("");
  const [formCoordinator, setFormCoordinator] = React.useState(activeSession.username);
  const [formObjective, setFormObjective] = React.useState("");
  
  // Participant Fields
  const [ctPart, setCtPart] = React.useState("");
  const [educPart, setEducPart] = React.useState("");
  const [asPart, setAsPart] = React.useState("");
  const [saudePart, setSaudePart] = React.useState("");
  const [polPart, setPolPart] = React.useState("");
  const [outrosPart, setOutrosPart] = React.useState("");

  const [formPauta, setFormPauta] = React.useState("");
  const [formDiscussao, setFormDiscussao] = React.useState("");
  const [formEncaminhamentos, setFormEncaminhamentos] = React.useState("");
  const [formConsideracoes, setFormConsideracoes] = React.useState("");
  const [formEncerradoAs, setFormEncerradoAs] = React.useState("11:30");
  const [formSecretario, setFormSecretario] = React.useState(activeSession.username);

  // Attendance List Photo Attachment State
  const [listaPresencaUrl, setListaPresencaUrl] = React.useState<string | undefined>(undefined);
  const [listaPresencaNome, setListaPresencaNome] = React.useState<string | undefined>(undefined);
  const [isUploadingPhoto, setIsUploadingPhoto] = React.useState(false);
  const [previewImageModal, setPreviewImageModal] = React.useState<{ url: string; title: string } | null>(null);

  // Compress & read photo of attendance list
  const handleAttendancePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 1400;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.80);
            setListaPresencaUrl(dataUrl);
            setListaPresencaNome(file.name);
            if (selectedAta) {
              setSelectedAta(prev => prev ? { ...prev, listaPresencaUrl: dataUrl, listaPresencaNome: file.name } : null);
            }
          } else {
            const rawUrl = event.target?.result as string;
            setListaPresencaUrl(rawUrl);
            setListaPresencaNome(file.name);
            if (selectedAta) {
              setSelectedAta(prev => prev ? { ...prev, listaPresencaUrl: rawUrl, listaPresencaNome: file.name } : null);
            }
          }
        } catch (procErr) {
          console.error("Erro ao comprimir imagem:", procErr);
          const rawUrl = event.target?.result as string;
          setListaPresencaUrl(rawUrl);
          setListaPresencaNome(file.name);
        } finally {
          setIsUploadingPhoto(false);
        }
      };
      img.onerror = () => {
        setIsUploadingPhoto(false);
        alert("Não foi possível carregar a imagem selecionada. Tente outro formato.");
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setIsUploadingPhoto(false);
      alert("Erro ao ler o arquivo de imagem.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttendancePhoto = () => {
    setListaPresencaUrl(undefined);
    setListaPresencaNome(undefined);
    if (selectedAta) {
      setSelectedAta(prev => prev ? { ...prev, listaPresencaUrl: undefined, listaPresencaNome: undefined } : null);
    }
  };

  // Load and Sync from LocalStorage, Server API, and Firestore real-time subscription
  React.useEffect(() => {
    let isMounted = true;

    // 1. Immediate visual feedback from localStorage
    const stored = localStorage.getItem("tio_system_general_atas");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAtas(parsed);
        }
      } catch (e) {
        console.error("Erro ao ler atas locais:", e);
      }
    }

    // 2. Fallback fetch from Server API sync endpoint
    fetch("/api/sync/atas")
      .then(res => res.json())
      .then(data => {
        if (isMounted && data && Array.isArray(data.atas) && data.atas.length > 0) {
          setAtas(data.atas);
          try {
            localStorage.setItem("tio_system_general_atas", JSON.stringify(data.atas));
          } catch (lsErr) {
            console.warn("Storage warning:", lsErr);
          }
        }
      })
      .catch(err => console.error("Erro ao carregar atas do servidor API:", err));

    // 3. Real-time subscription to Firestore collection
    const q = collection(db, "atas");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          listaPresencaUrl: data.listaPresencaUrl || undefined,
          listaPresencaNome: data.listaPresencaNome || undefined
        } as GeneralAta;
      });

      // Sort client-side by numerical order ascending
      const sorted = [...lista].sort((a, b) => {
        if (a.numero && b.numero) {
          return a.numero - b.numero;
        }
        const timeA = a.dataCriacao ? new Date(a.dataCriacao).getTime() : 0;
        const timeB = b.dataCriacao ? new Date(b.dataCriacao).getTime() : 0;
        return timeA - timeB;
      });

      if (sorted.length === 0) {
        // If Firestore is empty, check if we have locally saved ATAs to push to cloud
        const localStored = localStorage.getItem("tio_system_general_atas");
        if (localStored) {
          try {
            const localAtas: GeneralAta[] = JSON.parse(localStored);
            if (Array.isArray(localAtas) && localAtas.length > 0) {
              localAtas.forEach(async (ata) => {
                try {
                  await setDoc(doc(db, "atas", ata.id), {
                    id: ata.id,
                    date: ata.date || "",
                    time: ata.time || "",
                    location: ata.location || "",
                    coordinator: ata.coordinator || "",
                    content: ata.content || "",
                    dataCriacao: ata.dataCriacao || new Date().toISOString(),
                    organ: ata.organ || "",
                    user: ata.user || "",
                    numero: ata.numero || 1,
                    listaPresencaUrl: ata.listaPresencaUrl || "",
                    listaPresencaNome: ata.listaPresencaNome || "",
                    createdAt: serverTimestamp()
                  }, { merge: true });
                } catch (err) {
                  console.error("Erro ao sincronizar ata local para o Firestore:", err);
                }
              });
            }
          } catch (e) {
            console.error("Erro ao ler atas locais no fallback:", e);
          }
        } else if (DEFAULT_GENERAL_ATAS.length > 0) {
          // Seed database with default general atas if empty
          DEFAULT_GENERAL_ATAS.forEach(async (ata) => {
            try {
              await setDoc(doc(db, "atas", ata.id), {
                id: ata.id,
                date: ata.date,
                time: ata.time,
                location: ata.location,
                coordinator: ata.coordinator,
                content: ata.content,
                dataCriacao: ata.dataCriacao,
                organ: ata.organ,
                user: ata.user,
                numero: ata.numero || 1,
                listaPresencaUrl: ata.listaPresencaUrl || "",
                listaPresencaNome: ata.listaPresencaNome || "",
                createdAt: serverTimestamp()
              }, { merge: true });
            } catch (err) {
              console.error("Erro ao semear atas default:", err);
            }
          });
        }
      } else {
        if (isMounted) {
          setAtas(sorted);
          try {
            localStorage.setItem("tio_system_general_atas", JSON.stringify(sorted));
          } catch (lsErr) {
            console.warn("Storage warning:", lsErr);
          }
        }
      }
    }, (error) => {
      console.warn("Aviso Firestore onSnapshot atas (usando fallback API/local):", error);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [activeSession.username]);

  const saveAtas = async (updatedList: GeneralAta[], action?: { type: "save" | "delete"; payload: any }) => {
    // Update local state and localStorage for optimistic UI response
    setAtas(updatedList);
    try {
      localStorage.setItem("tio_system_general_atas", JSON.stringify(updatedList));
    } catch (lsErr) {
      console.warn("Storage warning:", lsErr);
    }

    if (action) {
      if (action.type === "save") {
        const ata = action.payload;
        // Server sync API call first to ensure persistence
        fetch("/api/sync/atas/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ata })
        }).catch(err => console.error("Erro no salvamento da ata no servidor:", err));

        // Direct write to Firestore including attendance list attachments
        try {
          await setDoc(doc(db, "atas", ata.id), {
            id: ata.id,
            date: ata.date || "",
            time: ata.time || "",
            location: ata.location || "",
            coordinator: ata.coordinator || "",
            content: ata.content || "",
            dataCriacao: ata.dataCriacao || new Date().toISOString(),
            organ: ata.organ || "",
            user: ata.user || "",
            numero: ata.numero || 1,
            listaPresencaUrl: ata.listaPresencaUrl || "",
            listaPresencaNome: ata.listaPresencaNome || "",
            createdAt: serverTimestamp()
          }, { merge: true });
        } catch (err) {
          console.error("Erro no setDoc Firestore para ata:", err);
        }
      } else if (action.type === "delete") {
        const id = action.payload;
        // Server sync API call first
        fetch("/api/sync/atas/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
        }).catch(err => console.error("Erro na exclusão da ata no servidor:", err));

        // Direct delete from Firestore
        try {
          await deleteDoc(doc(db, "atas", id));
        } catch (err) {
          console.error("Erro no deleteDoc Firestore para ata:", err);
        }
      }
    }
  };

  // Live Sync form changes into Markdown text
  React.useEffect(() => {
    if (isCreating || isEditing) {
      if (activeTab === "form") {
        const generated = generateGlobalAtaTemplate({
          date: formDate,
          time: formTime,
          location: formLocation,
          coordinator: formCoordinator,
          objective: formObjective,
          participants: {
            conselhoTutelar: ctPart,
            educacao: educPart,
            assistenciaSocial: asPart,
            saude: saudePart,
            policia: polPart,
            outros: outrosPart
          },
          pauta: formPauta,
          discussao: formDiscussao,
          encaminhamentos: formEncaminhamentos,
          consideracoes: formConsideracoes,
          encerradoAs: formEncerradoAs,
          secretario: formSecretario
        });
        setEditorMarkdown(generated);
      }
    }
  }, [
    isCreating,
    isEditing,
    activeTab,
    formDate,
    formTime,
    formLocation,
    formCoordinator,
    formObjective,
    ctPart,
    educPart,
    asPart,
    saudePart,
    polPart,
    outrosPart,
    formPauta,
    formDiscussao,
    formEncaminhamentos,
    formConsideracoes,
    formEncerradoAs,
    formSecretario
  ]);

  // Handle Create New ATA
  const handleStartCreate = () => {
    const today = getLocalTodayISO();
    // Reset Form Fields
    setFormDate(today);
    setFormTime("09:00");
    setFormLocation("");
    setFormCoordinator(activeSession.username);
    setFormObjective("");
    setCtPart("");
    setEducPart("");
    setAsPart("");
    setSaudePart("");
    setPolPart("");
    setOutrosPart("");
    setFormPauta("");
    setFormDiscussao("");
    setFormEncaminhamentos("");
    setFormConsideracoes("");
    setFormEncerradoAs("11:30");
    setFormSecretario(activeSession.username);

    // Initial generated markdown
    const generatedText = generateGlobalAtaTemplate({
      date: today,
      time: "09:00",
      location: "",
      coordinator: activeSession.username,
      objective: "",
      participants: {
        conselhoTutelar: "",
        educacao: "",
        assistenciaSocial: "",
        saude: "",
        policia: "",
        outros: ""
      },
      pauta: "",
      discussao: "",
      encaminhamentos: "",
      consideracoes: "",
      encerradoAs: "11:30",
      secretario: activeSession.username
    });

    setEditorMarkdown(generatedText);
    setListaPresencaUrl(undefined);
    setListaPresencaNome(undefined);
    setSelectedAta(null);
    setIsCreating(true);
    setIsEditing(false);
    setActiveTab("form");
  };

  // Handle Edit Existing ATA
  const handleStartEdit = (ata: GeneralAta) => {
    setSelectedAta(ata);
    setEditorMarkdown(ata.content);
    const cleanDate = ata.date ? (ata.date.includes("T") ? ata.date.split("T")[0] : ata.date) : getLocalTodayISO();
    setFormDate(cleanDate);
    setFormTime(ata.time || "09:00");
    setFormLocation(ata.location || "");
    setFormCoordinator(ata.coordinator || activeSession.username);
    setListaPresencaUrl(ata.listaPresencaUrl);
    setListaPresencaNome(ata.listaPresencaNome);
    setIsCreating(false);
    setIsEditing(true);
    setActiveTab("markdown"); // For editing existing, load text mode with ability to switch
  };

  // Save ATA to system (with option to save and download PDF)
  const handleSaveAta = (downloadPdf: boolean = true) => {
    let savedAtaObj: GeneralAta | null = null;

    if (isCreating) {
      const maxNum = atas.reduce((max, a) => (a.numero && a.numero > max ? a.numero : max), 0);
      const nextNum = maxNum + 1;
      const formattedNum = `Ata${nextNum.toString().padStart(2, "0")}`;

      let finalContent = editorMarkdown;
      const matchRegex = /^#\s+ATA\s+DE\s+REUNIÃO\s+INTERSETORIAL/i;
      if (matchRegex.test(finalContent)) {
        finalContent = finalContent.replace(matchRegex, `# ${formattedNum} - ATA DE REUNIÃO INTERSETORIAL`);
      }

      const newAta: GeneralAta = {
        id: `gata-${Date.now()}`,
        date: formDate,
        time: formTime,
        location: formLocation || "Não informado",
        coordinator: formCoordinator || activeSession.username,
        content: finalContent,
        dataCriacao: new Date().toISOString(),
        organ: activeSession.organ,
        user: activeSession.username,
        numero: nextNum,
        listaPresencaUrl: listaPresencaUrl,
        listaPresencaNome: listaPresencaNome
      };
      savedAtaObj = newAta;
      saveAtas([newAta, ...atas], { type: "save", payload: newAta });
      setIsCreating(false);
    } else if (isEditing && selectedAta) {
      const updatedList = atas.map(a => {
        if (a.id === selectedAta.id) {
          savedAtaObj = {
            ...a,
            content: editorMarkdown,
            date: formDate || a.date,
            time: formTime || a.time,
            location: formLocation || a.location,
            coordinator: formCoordinator || a.coordinator,
            listaPresencaUrl: listaPresencaUrl,
            listaPresencaNome: listaPresencaNome
          };
          return savedAtaObj;
        }
        return a;
      });
      savedAtaObj = savedAtaObj || selectedAta;
      saveAtas(updatedList, { type: "save", payload: savedAtaObj });
      setIsEditing(false);
      setSelectedAta(null);
    }

    if (downloadPdf && savedAtaObj) {
      const ataToPrint: GeneralAta = {
        ...savedAtaObj,
        listaPresencaUrl: savedAtaObj.listaPresencaUrl || listaPresencaUrl,
        listaPresencaNome: savedAtaObj.listaPresencaNome || listaPresencaNome
      };
      handlePrintAta(ataToPrint);
    }
  };

  // Delete ATA
  const handleDeleteAta = (id: string) => {
    if (confirm("Tem certeza que deseja excluir permanentemente este registro de ata intersetorial do sistema? Esta ação é irreversível.")) {
      const filtered = atas.filter(a => a.id !== id);
      saveAtas(filtered, { type: "delete", payload: id });
      if (selectedAta?.id === id) {
        setSelectedAta(null);
      }
    }
  };

  // Copy Clipboard
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper helper markdown compiler for printing
  const compileMarkdownToPrintHtml = (md: string): string => {
    if (!md) return "";
    
    // Normalize line endings
    let html = md.replace(/\r\n/g, "\n");
    
    // Split into paragraphs/blocks
    const lines = html.split("\n");
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];
    const processedLines: string[] = [];
    
    const renderInline = (text: string): string => {
      return text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/__(.*?)__/g, "<strong>$1</strong>")
        .replace(/_(.*?)_/g, "<em>$1</em>")
        .replace(/`(.*?)`/g, "<code style='background:#f1f5f9;padding:2px 4px;border-radius:4px;font-family:monospace;font-size:11px;'>$1</code>");
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("|")) {
        // It's a table row
        const cells = line.split("|").map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        
        // Check if it's separator line (e.g. |---|---|)
        const isSeparator = cells.every(c => /^[-:\s|]+$/.test(c) || c === "");
        
        if (isSeparator) {
          continue;
        }
        
        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
      } else {
        if (inTable) {
          // Render accumulated table
          let tableHtml = "<table><thead><tr>";
          tableHeaders.forEach(h => {
            tableHtml += `<th>${renderInline(h)}</th>`;
          });
          tableHtml += "</tr></thead><tbody>";
          tableRows.forEach(row => {
            tableHtml += "<tr>";
            row.forEach(cell => {
              tableHtml += `<td>${renderInline(cell)}</td>`;
            });
            tableHtml += "</tr>";
          });
          tableHtml += "</tbody></table>";
          processedLines.push(tableHtml);
          
          // Reset
          inTable = false;
          tableHeaders = [];
          tableRows = [];
        }
        processedLines.push(lines[i]);
      }
    }
    
    if (inTable) {
      let tableHtml = "<table><thead><tr>";
      tableHeaders.forEach(h => {
        tableHtml += `<th>${renderInline(h)}</th>`;
      });
      tableHtml += "</tr></thead><tbody>";
      tableRows.forEach(row => {
        tableHtml += "<tr>";
        row.forEach(cell => {
          tableHtml += `<td>${renderInline(cell)}</td>`;
        });
        tableHtml += "</tr>";
      });
      tableHtml += "</tbody></table>";
      processedLines.push(tableHtml);
    }
    
    html = processedLines.join("\n");
    
    // Process block level elements
    const lines2 = html.split("\n");
    let inList = false;
    const processedLines2: string[] = [];
    
    for (let i = 0; i < lines2.length; i++) {
      const line = lines2[i];
      const trimmed = line.trim();
      
      // Check if list item
      const bulletMatch = trimmed.match(/^[\*\-\+]\s+(.*)$/);
      if (bulletMatch) {
        if (!inList) {
          processedLines2.push("<ul>");
          inList = true;
        }
        processedLines2.push(`<li>${renderInline(bulletMatch[1])}</li>`);
      } else {
        if (inList) {
          processedLines2.push("</ul>");
          inList = false;
        }
        processedLines2.push(line);
      }
    }
    if (inList) {
      processedLines2.push("</ul>");
    }
    html = processedLines2.join("\n");
    
    // Headings & Dividers
    const lines3 = html.split("\n");
    const processedLines3: string[] = [];
    for (let i = 0; i < lines3.length; i++) {
      const line = lines3[i];
      const trimmed = line.trim();
      
      if (trimmed.startsWith("# ")) {
        processedLines3.push(`<h1>${renderInline(trimmed.substring(2))}</h1>`);
      } else if (trimmed.startsWith("## ")) {
        processedLines3.push(`<h2>${renderInline(trimmed.substring(3))}</h2>`);
      } else if (trimmed.startsWith("### ")) {
        processedLines3.push(`<h3>${renderInline(trimmed.substring(4))}</h3>`);
      } else if (trimmed === "---") {
        processedLines3.push("<hr />");
      } else if (!trimmed) {
        // Empty line
        processedLines3.push("");
      } else if (
        trimmed.startsWith("<h") || 
        trimmed.startsWith("<ul") || 
        trimmed.startsWith("<li") || 
        trimmed.startsWith("</ul") || 
        trimmed.startsWith("<table") || 
        trimmed.startsWith("</table") || 
        trimmed.startsWith("<hr")
      ) {
        processedLines3.push(line);
      } else {
        // Regular paragraph
        processedLines3.push(`<p>${renderInline(trimmed)}</p>`);
      }
    }
    
    return processedLines3.filter(l => l !== "").join("\n");
  };

  // Print ATA
  const handlePrintAta = (ata: GeneralAta) => {
    // If the currently open/selected ata has an attached photo and the ata parameter lacks it, preserve it
    const effectiveAta: GeneralAta = {
      ...ata,
      listaPresencaUrl: ata.listaPresencaUrl || (selectedAta?.id === ata.id ? listaPresencaUrl : undefined) || (isCreating ? listaPresencaUrl : undefined) || ata.listaPresencaUrl,
      listaPresencaNome: ata.listaPresencaNome || (selectedAta?.id === ata.id ? listaPresencaNome : undefined) || (isCreating ? listaPresencaNome : undefined) || ata.listaPresencaNome
    };

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("A janela de impressão foi bloqueada pelo navegador. Por favor, permita pop-ups neste navegador para emitir e baixar o PDF da Ata.");
      return;
    }

    const formattedAtaNum = effectiveAta.numero ? `Ata${effectiveAta.numero.toString().padStart(2, "0")}` : "ATA DE REUNIÃO";
    const formattedDate = formatDateBR(effectiveAta.date);
    const formattedRegDate = formatDateTimeBR(effectiveAta.dataCriacao);

    printWindow.document.write(`
        <html>
          <head>
            <title>${formattedAtaNum} - ATA DE REUNIÃO INTERSETORIAL</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              
              @media print {
                @page {
                  size: A4;
                  margin: 20mm 20mm 25mm 20mm;
                }
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }

              body {
                font-family: 'Inter', sans-serif;
                line-height: 1.6;
                color: #0f172a;
                padding: 10px;
                max-width: 800px;
                margin: 0 auto;
                background-color: #ffffff;
              }

              /* Header block */
              .header-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                border-bottom: 2.5px solid #0f172a;
                padding-bottom: 16px;
                margin-bottom: 24px;
              }
              .header-logo {
                margin-right: 0;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .header-text {
                flex-grow: 1;
              }
              .gov-republic {
                font-size: 10px;
                font-weight: 700;
                color: #475569;
                letter-spacing: 1.5px;
                margin: 0 0 4px 0;
                text-transform: uppercase;
              }
              .gov-title {
                font-size: 17px;
                font-weight: 700;
                color: #0f172a;
                margin: 0 0 6px 0;
                letter-spacing: 0.25px;
                line-height: 1.4;
              }
              .gov-subtitle {
                font-size: 10px;
                font-weight: 500;
                color: #64748b;
                text-transform: uppercase;
                margin: 0;
              }

              /* Title */
              .document-title {
                font-size: 19px;
                font-weight: 700;
                text-align: center;
                text-transform: uppercase;
                margin: 20px 0 24px 0;
                color: #0f172a;
                letter-spacing: 0.5px;
              }

              /* Metadata Table */
              .metadata-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 28px;
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
              }
              .metadata-table td {
                border: 1px solid #e2e8f0;
                padding: 9px 12px;
                font-size: 12px;
                color: #334155;
                vertical-align: top;
                width: 50%;
              }
              .metadata-label {
                font-weight: 700;
                color: #0f172a;
                text-transform: uppercase;
                font-size: 9.5px;
                margin-bottom: 3px;
                letter-spacing: 0.5px;
              }
              .metadata-value {
                font-size: 12px;
                font-weight: 500;
              }

              /* Content block styling */
              .document-content {
                text-align: justify;
                font-size: 14.5px;
                color: #1e293b;
                margin-bottom: 35px;
                font-family: "Times New Roman", Times, Baskerville, Georgia, serif;
              }
              .document-content h1 {
                font-size: 16px;
                font-weight: 700;
                margin-top: 24px;
                margin-bottom: 12px;
                color: #0f172a;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 5px;
                text-transform: uppercase;
              }
              .document-content h2 {
                font-size: 14.5px;
                font-weight: 700;
                margin-top: 20px;
                margin-bottom: 10px;
                color: #0f172a;
              }
              .document-content h3 {
                font-size: 13px;
                font-weight: 600;
                margin-top: 16px;
                margin-bottom: 8px;
                color: #1e293b;
              }
              .document-content p {
                margin-top: 0;
                margin-bottom: 12px;
                line-height: 1.6;
              }
              .document-content ul {
                margin-top: 0;
                margin-bottom: 12px;
                padding-left: 20px;
              }
              .document-content li {
                margin-bottom: 6px;
                page-break-inside: avoid;
              }
              .document-content table {
                width: 100%;
                border-collapse: collapse;
                margin: 16px 0;
                page-break-inside: avoid;
              }
              .document-content th, .document-content td {
                border: 1px solid #cbd5e1;
                padding: 8px 10px;
                text-align: left;
                font-size: 11.5px;
              }
              .document-content th {
                background-color: #f1f5f9;
                font-weight: 600;
                color: #0f172a;
              }
              .document-content hr {
                border: 0;
                border-top: 1px dashed #cbd5e1;
                margin: 20px 0;
              }
              .document-content strong {
                font-weight: 600;
                color: #0f172a;
              }

              /* Attendance List Attachment - Dedicated Page */
              .anexo-presenca-page {
                page-break-before: always;
                break-before: page;
                page-break-inside: avoid;
                break-inside: avoid;
                margin-top: 36px;
                padding-top: 20px;
                border-top: 2px solid #0c4a80;
              }
              .anexo-presenca-header {
                text-align: center;
                margin-bottom: 12px;
                border-bottom: 1px solid #cbd5e1;
                padding-bottom: 8px;
              }
              .anexo-tag {
                display: inline-block;
                background-color: #0c4a80;
                color: #ffffff;
                font-size: 9px;
                font-weight: 800;
                letter-spacing: 1.2px;
                padding: 3px 10px;
                border-radius: 4px;
                text-transform: uppercase;
                margin-bottom: 6px;
                font-family: 'Inter', sans-serif;
              }
              .anexo-title {
                font-size: 13.5px;
                font-weight: 800;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin: 0 0 4px 0;
                font-family: 'Inter', sans-serif;
              }
              .anexo-subtitle {
                font-size: 11px;
                color: #475569;
                line-height: 1.4;
                max-width: 650px;
                margin: 0 auto;
              }
              .anexo-image-wrapper {
                background: #ffffff;
                border: 1.5px solid #334155;
                border-radius: 8px;
                padding: 8px;
                text-align: center;
                margin: 12px 0;
                page-break-inside: avoid;
                break-inside: avoid;
              }
              .anexo-image {
                max-width: 100%;
                width: 100%;
                max-height: 980px;
                height: auto;
                object-fit: contain;
                border-radius: 4px;
                display: block;
                margin: 0 auto;
              }
              .anexo-image-caption {
                font-size: 10px;
                color: #475569;
                margin-top: 8px;
                font-family: monospace;
                text-align: center;
              }
              .anexo-placeholder-box {
                background-color: #f8fafc;
                border: 1px dashed #94a3b8;
                border-radius: 8px;
                padding: 18px;
                margin-top: 10px;
                display: flex;
                align-items: center;
                gap: 12px;
                color: #475569;
                font-size: 11px;
                line-height: 1.5;
              }
              .anexo-placeholder-icon {
                font-size: 20px;
                flex-shrink: 0;
              }
              .anexo-placeholder-text {
                font-size: 11px;
                color: #334155;
                line-height: 1.5;
              }
              .anexo-placeholder-note {
                font-size: 9.5px;
                color: #94a3b8;
                font-style: italic;
              }

              /* Media print specific overrides */
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 12mm 15mm 15mm 15mm;
                }
                body {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .anexo-presenca-page {
                  page-break-before: always !important;
                  break-before: page !important;
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                  margin-top: 0 !important;
                  padding-top: 8px !important;
                  border-top: none !important;
                }
                .anexo-image-wrapper {
                  border: 1.5px solid #0f172a !important;
                  padding: 6px !important;
                  margin: 8px 0 !important;
                  background: #ffffff !important;
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
                .anexo-image {
                  max-width: 100% !important;
                  width: 100% !important;
                  max-height: 940px !important;
                  height: auto !important;
                  object-fit: contain !important;
                  display: block !important;
                  margin: 0 auto !important;
                }
                .document-footer {
                  page-break-inside: avoid !important;
                }
              }

              /* Footer validation */
              .document-footer {
                margin-top: 60px;
                font-size: 9.5px;
                color: #94a3b8;
                text-align: center;
                border-top: 1px solid #f1f5f9;
                padding-top: 12px;
                page-break-inside: avoid;
              }
              .footer-code {
                font-family: monospace;
                font-size: 9px;
                color: #64748b;
                margin-top: 4px;
                letter-spacing: 0.5px;
              }
            </style>
          </head>
          <body>
            <div class="header-container">
              <div class="header-logo">
                <svg width="100" height="100" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stop-color="#0056b3" />
                      <stop offset="100%" stop-color="#0088ff" />
                    </linearGradient>
                    <linearGradient id="orangeGrad" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stop-color="#e65c00" />
                      <stop offset="100%" stop-color="#ffb300" />
                    </linearGradient>
                  </defs>

                  <!-- Left Blue Hand forming left heart lobe -->
                  <path d="M100,165 C60,140 30,105 30,75 C30,45 60,35 85,60 C70,45 50,55 50,75 C50,95 80,135 100,155" fill="none" stroke="url(#blueGrad)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M50,75 C50,105 78,135 95,150" fill="none" stroke="url(#blueGrad)" stroke-width="6" stroke-linecap="round" />
                  <path d="M40,75 C40,95 65,122 82,138" fill="none" stroke="url(#blueGrad)" stroke-width="4" stroke-linecap="round" />

                  <!-- Right Orange Hand forming right heart lobe -->
                  <path d="M100,165 C140,140 170,105 170,75 C170,45 140,35 115,60 C130,45 150,55 150,75 C150,95 120,135 100,155" fill="none" stroke="url(#orangeGrad)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M150,75 C150,105 122,135 105,150" fill="none" stroke="url(#orangeGrad)" stroke-width="6" stroke-linecap="round" />
                  <path d="M160,75 C160,95 135,122 118,138" fill="none" stroke="url(#orangeGrad)" stroke-width="4" stroke-linecap="round" />

                  <!-- Child and Teen Silhouettes in Center -->
                  <!-- Teen (Right) -->
                  <circle cx="116" cy="84" r="11" fill="#0056b3" />
                  <path d="M116,97 C104,97 100,107 100,117 C100,121 106,132 116,132 C126,132 132,121 132,117 C132,107 128,97 116,97 Z" fill="#0056b3" />

                  <!-- Child (Left) -->
                  <circle cx="88" cy="94" r="8" fill="#0056b3" />
                  <path d="M88,104 C78,104 75,112 75,120 C75,123 80,132 88,132 C96,132 101,123 101,120 C101,112 98,104 88,104 Z" fill="#0056b3" />
                </svg>
              </div>
              <div class="header-text" style="margin-top: 10px;">
                <div class="gov-title" style="color: #0c4a80; font-size: 19px; font-weight: 700; text-transform: none; margin: 0 0 4px 0; font-family: 'Inter', sans-serif;">
                  Grupo de Integração Operacional de Direitos da Criança e do Adolescente
                </div>
                <div style="width: 120px; height: 3px; background: linear-gradient(to right, #0056b3, #ffb300); margin: 6px auto;"></div>
                <div class="gov-subtitle" style="font-size: 13px; font-weight: 700; color: #0056b3; letter-spacing: 0.5px; font-family: 'Inter', sans-serif; text-transform: uppercase; margin-top: 6px;">
                  Currais Novos - RN <span style="color: #cbd5e1; margin: 0 6px;">|</span> <span style="color: #e65c00;">Grupo TIO</span>
                </div>
              </div>
            </div>

            <div class="document-title">${formattedAtaNum} - ATA DE REUNIÃO INTERSETORIAL</div>

            <table class="metadata-table">
              <tr>
                <td>
                  <div class="metadata-label">Órgão de Origem</div>
                  <div class="metadata-value">${ata.organ}</div>
                </td>
                <td>
                  <div class="metadata-label">Data da Reunião</div>
                  <div class="metadata-value">${formattedDate}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="metadata-label">Local de Realização</div>
                  <div class="metadata-value">${ata.location}</div>
                </td>
                <td>
                  <div class="metadata-label">Coordenador da Reunião</div>
                  <div class="metadata-value">${ata.coordinator}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="metadata-label">Registrador Responsável</div>
                  <div class="metadata-value">${ata.user}</div>
                </td>
                <td>
                  <div class="metadata-label">Data e Hora do Registro</div>
                  <div class="metadata-value">${formattedRegDate}</div>
                </td>
              </tr>
            </table>

            <div class="document-content">
              ${compileMarkdownToPrintHtml(ata.content)}
            </div>

            <!-- Attendance List Attachment Section - Opened Display on Dedicated Page -->
            <div class="anexo-presenca-page">
              <div class="anexo-presenca-header">
                <div class="anexo-tag">ANEXO OFICIAL</div>
                <div class="anexo-title">COMPROVAÇÃO DE PRESENÇAS — LISTA DE PRESENÇA DA REUNIÃO</div>
                <div class="anexo-subtitle">Conforme termo de encerramento da presente ata, a validação das presenças dos órgãos e membros presentes dá-se pela lista física assinada, cujo comprovante digitalizado encontra-se aberto na íntegra abaixo:</div>
              </div>

              ${effectiveAta.listaPresencaUrl ? `
                <div class="anexo-image-wrapper">
                  <img src="${effectiveAta.listaPresencaUrl}" alt="Lista de Presença Digitalizada" class="anexo-image" loading="eager" decoding="sync" />
                  <div class="anexo-image-caption">
                    Documento comprobatório digitalizado aberto: ${effectiveAta.listaPresencaNome || 'Lista_de_Presenca.jpg'}
                  </div>
                </div>
              ` : `
                <div class="anexo-placeholder-box">
                  <div class="anexo-placeholder-icon">📋</div>
                  <div>
                    <div class="anexo-placeholder-text">
                      <strong>Lista de Presença Física Assinada:</strong> O documento original rubricado pelos membros e participantes presentes na reunião encontra-se devidamente preenchido e arquivado junto à coordenação da rede.
                    </div>
                    <div class="anexo-placeholder-note">
                      (Fotografia comprobatória não foi anexada no registro digital desta ata)
                    </div>
                  </div>
                </div>
              `}
            </div>

            <div class="document-footer">
              Este documento é um registro oficial gerado pelo TIO System (Rede Intersetorial). A comprovação de presença dos órgãos é validada pela Lista de Presença anexa.
              <div class="footer-code">CÓDIGO DE AUTENTICIDADE: TIO-ATA-${effectiveAta.id.toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
            </div>

            <script>
              function triggerPrint() {
                var img = document.querySelector('.anexo-image');
                if (img && img.getAttribute('src')) {
                  if (img.complete && img.naturalHeight !== 0) {
                    setTimeout(function() { window.print(); }, 350);
                  } else {
                    var printed = false;
                    img.onload = function() {
                      if (!printed) {
                        printed = true;
                        setTimeout(function() { window.print(); }, 350);
                      }
                    };
                    img.onerror = function() {
                      if (!printed) {
                        printed = true;
                        setTimeout(function() { window.print(); }, 350);
                      }
                    };
                    setTimeout(function() {
                      if (!printed) {
                        printed = true;
                        window.print();
                      }
                    }, 1500);
                  }
                } else {
                  setTimeout(function() {
                    window.print();
                  }, 300);
                }
              }

              if (document.readyState === 'complete' || document.readyState === 'interactive') {
                triggerPrint();
              } else {
                window.addEventListener('load', triggerPrint);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
  };

  // Filtered ATAs list
  const filteredAtas = atas.filter(a => {
    const q = searchQuery.toLowerCase();
    return (
      (a.date || "").toLowerCase().includes(q) ||
      (a.location || "").toLowerCase().includes(q) ||
      (a.coordinator || "").toLowerCase().includes(q) ||
      (a.content || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6" id="registro-atas-module-container">
      
      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <FileSpreadsheet size={18} />
            <span className="text-[10px] font-extrabold uppercase tracking-widest font-mono">Prontuário Geral de Documentos</span>
          </div>
          <h2 className="font-sans text-2xl font-bold text-slate-900">Registro de Atas de Reuniões Intersetoriais</h2>
          <p className="text-xs text-slate-500">
            Lavre, edite, organize e imprima as atas das reuniões periódicas do colegiado intersetorial do município.
          </p>
        </div>

        {!isCreating && !isEditing && (
          <button
            onClick={handleStartCreate}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer select-none"
            id="btn-new-general-ata"
          >
            <Plus size={16} />
            Registrar Nova Ata
          </button>
        )}
      </div>

      {/* DETAILED WORKSPACE MODES */}
      {isCreating || isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* EDITOR COLUMN (7 blocks) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setIsCreating(false); setIsEditing(false); setSelectedAta(null); }}
                  className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-all"
                  title="Voltar"
                  id="btn-back-to-list"
                >
                  <Undo2 size={16} />
                </button>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isCreating ? "Redigir Nova Ata Intersetorial" : "Editar Registro de Ata"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Preencha o formulário ou edite diretamente o código Markdown
                  </p>
                </div>
              </div>

              {/* Tab Selector between Form Support and Pure Markdown */}
              <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("form")}
                  className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${
                    activeTab === "form" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Formulário de Apoio
                </button>
                <button
                  onClick={() => setActiveTab("markdown")}
                  className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${
                    activeTab === "markdown" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Texto Livre
                </button>
              </div>
            </div>

            {/* FORM ASSISTANCE MODE */}
            {activeTab === "form" ? (
              <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
                
                {/* Basic Metadata block */}
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">1. Dados Fundamentais da Reunião</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1 block">Data da Reunião:</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={e => setFormDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1 block">Horário de Início:</label>
                      <input
                        type="time"
                        value={formTime}
                        onChange={e => setFormTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Local da Reunião:</label>
                    <input
                      type="text"
                      placeholder="Ex: Sala de Reuniões do CRAS, Auditório Municipal..."
                      value={formLocation}
                      onChange={e => setFormLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Coordenador / Facilitador:</label>
                    <input
                      type="text"
                      value={formCoordinator}
                      onChange={e => setFormCoordinator(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Objective and Pauta block */}
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">2. Objetivo e Pauta</span>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Objetivo Principal:</label>
                    <textarea
                      rows={2}
                      placeholder="Qual a finalidade deste encontro do colegiado?"
                      value={formObjective}
                      onChange={e => setFormObjective(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Pauta da Reunião (Markdown list):</label>
                    <textarea
                      rows={2}
                      placeholder="* Apresentação do caso X&#10;* Pactuação de novos fluxos&#10;* Debates gerais"
                      value={formPauta}
                      onChange={e => setFormPauta(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Participant list fields block */}
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">3. Representantes e Órgãos Pactuantes</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1 block">Conselho Tutelar:</label>
                      <input
                        type="text"
                        placeholder="Nome do conselheiro presente"
                        value={ctPart}
                        onChange={e => setCtPart(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1 block">Educação:</label>
                      <input
                        type="text"
                        placeholder="Nome do representante de escola"
                        value={educPart}
                        onChange={e => setEducPart(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1 block">Assistência Social:</label>
                      <input
                        type="text"
                        placeholder="Técnico(a) CRAS/CREAS presente"
                        value={asPart}
                        onChange={e => setAsPart(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1 block">Saúde:</label>
                      <input
                        type="text"
                        placeholder="Médico/Enfermeiro presente"
                        value={saudePart}
                        onChange={e => setSaudePart(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1 block">Polícia:</label>
                      <input
                        type="text"
                        placeholder="Policial ou Delegado presente"
                        value={polPart}
                        onChange={e => setPolPart(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1 block">Outros participantes:</label>
                      <input
                        type="text"
                        placeholder="Ex: Representante do MP, Defensoria..."
                        value={outrosPart}
                        onChange={e => setOutrosPart(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Discussions and Actions */}
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">4. Conteúdo e Deliberações</span>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Discussão dos Casos / Temas:</label>
                    <textarea
                      rows={3}
                      placeholder="Descreva as principais ocorrências e debates realizados..."
                      value={formDiscussao}
                      onChange={e => setFormDiscussao(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Encaminhamentos e Deliberações (Markdown list):</label>
                    <textarea
                      rows={3}
                      placeholder="* Oficiar o CRAS para concessão de benefício eventual.&#10;* Responsável: CRAS | Prazo: 10/07/2026"
                      value={formEncaminhamentos}
                      onChange={e => setFormEncaminhamentos(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Closing info block */}
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">5. Encerramento e Validação da Ata</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1 block">Horário de Encerramento:</label>
                      <input
                        type="time"
                        value={formEncerradoAs}
                        onChange={e => setFormEncerradoAs(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1 block">Secretário da Ata (Eu, ...):</label>
                      <input
                        type="text"
                        value={formSecretario}
                        onChange={e => setFormSecretario(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Considerações Finais:</label>
                    <textarea
                      rows={2}
                      placeholder="Considerações gerais sobre a próxima reunião ou compromissos..."
                      value={formConsideracoes}
                      onChange={e => setFormConsideracoes(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all text-xs"
                    />
                  </div>
                </div>

                {/* ATTENDANCE LIST PHOTO ATTACHMENT BLOCK */}
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider block">
                        6. Anexo Oficial: Lista de Presença (Fotografia)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Substitui assinaturas manuais na ata. Anexe uma fotografia nítida da folha de presença assinada pelos participantes.
                      </p>
                    </div>
                  </div>

                  {isUploadingPhoto ? (
                    <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-5 flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-bold text-indigo-800">Processando e otimizando fotografia da lista de presença...</span>
                    </div>
                  ) : listaPresencaUrl ? (
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div 
                          onClick={() => setPreviewImageModal({ url: listaPresencaUrl, title: listaPresencaNome || "Lista de Presença da Reunião" })}
                          className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shrink-0 group hover:opacity-90 transition-opacity"
                          title="Clique para ampliar"
                        >
                          <img 
                            src={listaPresencaUrl} 
                            alt="Lista de Presença Anexa" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ZoomIn size={16} className="text-white" />
                          </div>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {listaPresencaNome || "Lista_de_Presenca.jpg"}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                            <Check size={11} /> Fotografia anexada com sucesso
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Será incluída no documento final e impressa no PDF
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => setPreviewImageModal({ url: listaPresencaUrl, title: listaPresencaNome || "Lista de Presença da Reunião" })}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Maximize2 size={12} />
                          <span>Ampliar</span>
                        </button>
                        <label className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer">
                          <Edit3 size={12} />
                          <span>Trocar</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleAttendancePhotoUpload} 
                            className="hidden" 
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveAttendancePhoto}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Remover fotografia da lista"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white rounded-xl p-5 text-center transition-all">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Camera size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">
                            Clique ou arraste a fotografia da Lista de Presença
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Formatos suportados: JPG, PNG, WEBP ou captura direta da câmera
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm">
                            <Upload size={13} />
                            <span>Selecionar Arquivo</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleAttendancePhotoUpload} 
                              className="hidden" 
                            />
                          </label>
                          <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5">
                            <Camera size={13} />
                            <span>Tirar Foto</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              capture="environment"
                              onChange={handleAttendancePhotoUpload} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Editor Markdown (Alteração direta do Documento):
                  </label>
                  <button
                    onClick={() => {
                      if (confirm("Deseja redefinir todo o conteúdo para o modelo padrão com as lacunas? Isso apagará as edições atuais feitas neste campo de texto.")) {
                        setEditorMarkdown(generateGlobalAtaTemplate({
                          date: formDate,
                          time: formTime,
                          location: formLocation,
                          coordinator: formCoordinator,
                          objective: formObjective,
                          participants: {
                            conselhoTutelar: ctPart,
                            educacao: educPart,
                            assistenciaSocial: asPart,
                            saude: saudePart,
                            policia: polPart,
                            outros: outrosPart
                          },
                          pauta: formPauta,
                          discussao: formDiscussao,
                          encaminhamentos: formEncaminhamentos,
                          consideracoes: formConsideracoes,
                          encerradoAs: formEncerradoAs,
                          secretario: formSecretario
                        }));
                      }
                    }}
                    className="text-[9px] font-extrabold text-indigo-600 hover:underline cursor-pointer uppercase font-mono"
                  >
                    Restaurar Modelo
                  </button>
                </div>
                <textarea
                  value={editorMarkdown}
                  onChange={(e) => setEditorMarkdown(e.target.value)}
                  className="w-full min-h-[42vh] flex-1 p-4 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl text-xs font-mono focus:outline-none transition-all resize-none leading-relaxed"
                  placeholder="Insira e modifique a ata em Markdown livre..."
                />

                {/* Free text mode attachment bar */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                  {isUploadingPhoto ? (
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-bold text-indigo-800">Otimizando fotografia da lista...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                          <Camera size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {listaPresencaUrl ? "Lista de Presença Anexada" : "Anexo de Lista de Presença"}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {listaPresencaUrl ? (listaPresencaNome || "Foto vinculada à ata") : "Anexe uma foto da lista assinada para comprovação de presenças"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {listaPresencaUrl ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setPreviewImageModal({ url: listaPresencaUrl, title: listaPresencaNome || "Lista de Presença" })}
                              className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-all"
                            >
                              Ver Foto
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveAttendancePhoto}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                              title="Remover foto"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        ) : (
                          <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm">
                            <Upload size={12} />
                            <span>Anexar Foto da Lista</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleAttendancePhotoUpload} 
                              className="hidden" 
                            />
                          </label>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* SAVE ACTION BAR */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100 bg-white">
              <button
                type="button"
                onClick={() => { setIsCreating(false); setIsEditing(false); setSelectedAta(null); }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isUploadingPhoto}
                onClick={() => handleSaveAta(false)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Salvar apenas no banco de dados sem abrir janela de PDF"
              >
                <Save size={14} />
                <span>Apenas Salvar no Sistema</span>
              </button>
              <button
                type="button"
                disabled={isUploadingPhoto}
                onClick={() => handleSaveAta(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
                title="Salvar registro e gerar/baixar em PDF imediatamente"
              >
                {isUploadingPhoto ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Carregando foto...</span>
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    <span>Salvar como PDF e Baixar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* PREVIEW COLUMN (5 blocks) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-indigo-600" />
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 font-mono">Visualização Prévia</h4>
                  <p className="text-[10px] text-slate-500">Impressão exata do documento oficial</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyText(editorMarkdown)}
                  className={`p-1.5 rounded-lg border transition-all text-xs font-bold cursor-pointer ${
                    copied 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                  title="Copiar texto oficial"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintAta({ 
                    id: selectedAta?.id || "temp", 
                    content: editorMarkdown, 
                    date: formDate, 
                    time: formTime, 
                    location: formLocation || "Não informado", 
                    coordinator: formCoordinator || activeSession.username, 
                    dataCriacao: selectedAta?.dataCriacao || new Date().toISOString(), 
                    organ: selectedAta?.organ || activeSession.organ, 
                    user: selectedAta?.user || activeSession.username,
                    numero: selectedAta?.numero,
                    listaPresencaUrl: listaPresencaUrl,
                    listaPresencaNome: listaPresencaNome
                  })}
                  className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-all cursor-pointer"
                  title="Imprimir documento de teste"
                >
                  <Printer size={14} />
                </button>
              </div>
            </div>

            {/* Markdown paper box */}
            <div className="flex-1 overflow-y-auto max-h-[70vh] bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60 shadow-inner prose prose-indigo max-w-none text-slate-800 text-xs">
              <div className="markdown-body select-text space-y-3 leading-relaxed">
                <ReactMarkdown>{editorMarkdown}</ReactMarkdown>
              </div>

              {/* Attendance list preview at the end of the document - Opened View */}
              <div className="mt-8 pt-5 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Camera size={14} className="text-indigo-600" />
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      Anexo: Comprovação de Presenças — Lista Aberta
                    </span>
                  </div>
                  {listaPresencaUrl ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Exibição Aberta
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewImageModal({ url: listaPresencaUrl, title: listaPresencaNome || "Lista de Presença" })}
                        className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ZoomIn size={11} /> Tela cheia
                      </button>
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-400 italic">
                      Nenhuma foto vinculada
                    </span>
                  )}
                </div>

                {listaPresencaUrl ? (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-2">
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm inline-block max-w-full">
                      <img 
                        src={listaPresencaUrl} 
                        alt="Lista de Presença Anexa Aberta" 
                        onClick={() => setPreviewImageModal({ url: listaPresencaUrl, title: listaPresencaNome || "Lista de Presença" })}
                        className="max-h-[500px] w-auto max-w-full mx-auto object-contain rounded cursor-pointer hover:opacity-95 transition-opacity"
                        title="Clique para ver em tela cheia"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {listaPresencaNome || "Lista_de_Presenca.jpg"}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        Lista assinada aberta para exibição e impressão
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-white rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-[11px]">
                    Validação de presenças mediante a lista física arquivada junto à coordenação.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* LIST FILTER AND SEARCHING BAR */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3.5 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar atas lavradas por data, local ou responsável..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all shadow-inner"
              />
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Filter size={13} />
              <span>Total: <strong>{filteredAtas.length}</strong> atas gravadas no TIO System</span>
            </div>
          </div>

          {/* LISTING RECORDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="atas-registry-grid">
            {filteredAtas.length > 0 ? (
              filteredAtas.map(a => {
                const dayLabel = formatDateBR(a.date);
                return (
                  <div
                    key={a.id}
                    className="bg-white rounded-3xl border border-slate-200/70 p-5 shadow-sm hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top ribbon */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                          <Calendar size={13} className="text-indigo-600" />
                          <span className="text-xs font-bold text-slate-800">{dayLabel}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-indigo-50/50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase font-mono">
                          <Clock size={10} />
                          <span>{a.time}h</span>
                        </div>
                      </div>

                      {/* Info lines */}
                      <h3 className="font-sans font-bold text-sm text-slate-800 line-clamp-1 mb-3">
                        {a.numero ? `Ata${a.numero.toString().padStart(2, "0")}` : "Ata"} - Reunião Intersetorial
                      </h3>

                      <div className="space-y-2 text-xs text-slate-500 mb-4">
                        <div className="flex items-start gap-2">
                          <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{a.location}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <User size={13} className="text-slate-400 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">Início: <strong>{a.coordinator}</strong></span>
                        </div>
                      </div>

                      {/* Log history info */}
                      <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Registrado por: <strong>{a.organ}</strong></span>
                        <span className="font-mono">{new Date(a.dataCriacao).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>

                    {/* Quick actions row */}
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                      <div>
                        {a.listaPresencaUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImageModal({ url: a.listaPresencaUrl!, title: `Lista de Presença - ${a.numero ? `Ata ${a.numero}` : 'Ata'}` })}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            title="Visualizar foto da lista de presença assinada"
                          >
                            <Camera size={12} />
                            <span>Lista Anexa</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Sem anexo digital</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handlePrintAta(a)}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-slate-200 cursor-pointer"
                          title="Visualizar e Imprimir"
                        >
                          <Printer size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyText(a.content)}
                          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all border border-slate-200 cursor-pointer"
                          title="Copiar texto da Ata"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(a)}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all border border-slate-200 cursor-pointer"
                          title="Editar conteúdo"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAta(a.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100 cursor-pointer"
                          title="Deletar registro"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="md:col-span-2 bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-3">
                <FileText size={36} className="text-slate-300" />
                <h4 className="text-sm font-bold text-slate-700">Nenhum registro de ata encontrado</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Modifique a busca ou crie uma nova ata de reunião intersetorial clicando no botão acima.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* FULLSCREEN PREVIEW IMAGE MODAL */}
      {previewImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <ImageIcon size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold">{previewImageModal.title}</h4>
                  <p className="text-[10px] text-slate-400">Comprovante de presenças oficial da reunião</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImageModal(null)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 p-6 bg-slate-950 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={previewImageModal.url}
                alt={previewImageModal.title}
                className="max-h-full max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
              />
            </div>
            <div className="flex items-center justify-between px-6 py-3 bg-slate-100 text-xs text-slate-600 border-t border-slate-200">
              <span className="text-[11px] text-slate-500">
                Documento de presença oficial assinado pelos órgãos participantes da reunião intersetorial.
              </span>
              <button
                type="button"
                onClick={() => setPreviewImageModal(null)}
                className="px-4 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-all cursor-pointer shadow-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
