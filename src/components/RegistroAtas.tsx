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
  FileSpreadsheet
} from "lucide-react";
import { GeneralAta, UserSession } from "../types";

// Portuguese date words helper
const getPortugueseDateInWords = (dateStr: string) => {
  if (!dateStr) return { day: "____", month: "____________________", year: "______" };
  const parts = dateStr.split("-");
  if (parts.length !== 3) return { day: "____", month: "____________________", year: "______" };
  const day = parseInt(parts[2], 10).toString().padStart(2, "0");
  const year = parts[0];
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const monthIndex = parseInt(parts[1], 10) - 1;
  const month = monthNames[monthIndex] || "____________________";
  return { day, month, year };
};

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

**8. ENCERRAMENTO:**
Nada mais havendo a tratar, a reunião foi encerrada às **${data.encerradoAs || "______"}** horas. Eu, **${data.secretario || "________________________________________"}**, lavrei a presente ata, que após lida e aprovada, será assinada por mim e pelos demais presentes.

---

Responsável pela Ata

---

Assinatura – Conselho Tutelar

---

Assinatura – Educação

---

Assinatura – Assistência Social

---

Assinatura – Saúde

---

Assinatura – Polícia

---

Outros participantes

**ANEXO:** Lista de Presença`;
};

// Seed initial general meetings (atas) if none exist in localStorage
const DEFAULT_GENERAL_ATAS: GeneralAta[] = [
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
Nada mais havendo a tratar, a reunião foi encerrada às **16:30** horas. Eu, **Dr. Rafael Costa (Assistência Social)**, lavrei a presente ata, que após lida e aprovada, será assinada por mim e pelos demais presentes.

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

interface RegistroAtasProps {
  activeSession: UserSession;
}

export default function RegistroAtas({ activeSession }: RegistroAtasProps) {
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
  const [formDate, setFormDate] = React.useState(new Date().toISOString().split("T")[0]);
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

  // Load and Sync from LocalStorage
  React.useEffect(() => {
    const stored = localStorage.getItem("tio_system_general_atas");
    let loaded: GeneralAta[] = [];
    if (stored) {
      try {
        loaded = JSON.parse(stored);
      } catch (e) {
        loaded = DEFAULT_GENERAL_ATAS;
      }
    } else {
      loaded = DEFAULT_GENERAL_ATAS;
    }

    // Ensure all ATAs have a sequential "numero", sorted oldest to newest for assigning
    const needsNumbering = loaded.some(a => typeof a.numero !== "number");
    if (needsNumbering) {
      const sorted = [...loaded].sort((a, b) => {
        return new Date(a.dataCriacao).getTime() - new Date(b.dataCriacao).getTime();
      });
      sorted.forEach((a, idx) => {
        a.numero = idx + 1;
      });
      const mapIdToNum = new Map(sorted.map(a => [a.id, a.numero]));
      loaded = loaded.map(a => ({
        ...a,
        numero: mapIdToNum.get(a.id) || 1
      }));
      localStorage.setItem("tio_system_general_atas", JSON.stringify(loaded));
    }

    setAtas(loaded);
  }, []);

  const saveAtas = (updatedList: GeneralAta[]) => {
    setAtas(updatedList);
    localStorage.setItem("tio_system_general_atas", JSON.stringify(updatedList));
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
    // Reset Form Fields
    setFormDate(new Date().toISOString().split("T")[0]);
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
      date: new Date().toISOString().split("T")[0],
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
    setSelectedAta(null);
    setIsCreating(true);
    setIsEditing(false);
    setActiveTab("form");
  };

  // Handle Edit Existing ATA
  const handleStartEdit = (ata: GeneralAta) => {
    setSelectedAta(ata);
    setEditorMarkdown(ata.content);
    setIsCreating(false);
    setIsEditing(true);
    setActiveTab("markdown"); // For editing existing, directly load text mode
  };

  // Save ATA to system
  const handleSaveAta = () => {
    if (isCreating) {
      const maxNum = atas.reduce((max, a) => (a.numero && a.numero > max ? a.numero : max), 0);
      const nextNum = maxNum + 1;
      const formattedNum = `ATA${nextNum.toString().padStart(2, "0")}`;

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
        numero: nextNum
      };
      saveAtas([newAta, ...atas]);
      setIsCreating(false);
    } else if (isEditing && selectedAta) {
      const updatedList = atas.map(a => {
        if (a.id === selectedAta.id) {
          return {
            ...a,
            content: editorMarkdown,
            date: formDate || a.date,
            time: formTime || a.time,
            location: formLocation || a.location,
            coordinator: formCoordinator || a.coordinator
          };
        }
        return a;
      });
      saveAtas(updatedList);
      setIsEditing(false);
      setSelectedAta(null);
    }
  };

  // Delete ATA
  const handleDeleteAta = (id: string) => {
    if (confirm("Tem certeza que deseja excluir permanentemente este registro de ata intersetorial do sistema? Esta ação é irreversível.")) {
      const filtered = atas.filter(a => a.id !== id);
      saveAtas(filtered);
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
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const formattedAtaNum = ata.numero ? `ATA ${ata.numero.toString().padStart(2, "0")}` : "ATA DE REUNIÃO";
      const formattedDate = new Date(ata.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
      const formattedRegDate = new Date(ata.dataCriacao).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

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
                align-items: center;
                border-bottom: 2.5px solid #0f172a;
                padding-bottom: 14px;
                margin-bottom: 24px;
              }
              .header-logo {
                margin-right: 18px;
                display: flex;
                align-items: center;
              }
              .header-text {
                flex-grow: 1;
              }
              .gov-republic {
                font-size: 10px;
                font-weight: 700;
                color: #475569;
                letter-spacing: 1.5px;
                margin: 0 0 2px 0;
                text-transform: uppercase;
              }
              .gov-title {
                font-size: 16px;
                font-weight: 700;
                color: #0f172a;
                margin: 0 0 2px 0;
                letter-spacing: 0.25px;
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
                font-size: 13.5px;
                color: #1e293b;
                margin-bottom: 35px;
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

              /* Signatures block */
              .signatures-container {
                margin-top: 45px;
                page-break-inside: avoid;
              }
              .signatures-title {
                font-size: 10.5px;
                font-weight: 700;
                color: #475569;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 28px;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 6px;
              }
              .signature-grid {
                width: 100%;
                border-collapse: collapse;
              }
              .signature-grid td {
                border: none;
                padding: 16px 8px;
                width: 50%;
                text-align: center;
                vertical-align: bottom;
              }
              .signature-line {
                border-top: 1.2px solid #64748b;
                width: 82%;
                margin: 0 auto 6px auto;
              }
              .signature-name {
                font-size: 11.5px;
                font-weight: 600;
                color: #0f172a;
              }
              .signature-role {
                font-size: 10.5px;
                color: #64748b;
              }

              /* Participants check line */
              .participants-list {
                margin-top: 25px;
                page-break-inside: avoid;
              }
              .participant-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
                font-size: 11px;
                color: #475569;
                border-bottom: 1.2px dotted #cbd5e1;
                padding-bottom: 4px;
              }
              .participant-sign {
                width: 260px;
                text-align: right;
                color: #94a3b8;
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
                <svg class="seal-svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M12 8v8"/>
                  <path d="M8 12h8"/>
                </svg>
              </div>
              <div class="header-text">
                <div class="gov-republic">República Federativa do Brasil</div>
                <div class="gov-title">Rede Intersetorial de Garantia de Direitos</div>
                <div class="gov-subtitle">Sistema Integrado TIO • Registro Oficial de Atas</div>
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

            <div class="signatures-container">
              <div class="signatures-title">Termo de Encerramento e Assinaturas</div>
              
              <table class="signature-grid">
                <tr>
                  <td>
                    <div class="signature-line"></div>
                    <div class="signature-name">${ata.coordinator}</div>
                    <div class="signature-role">Coordenador(a) da Reunião</div>
                  </td>
                  <td>
                    <div class="signature-line"></div>
                    <div class="signature-name">${ata.user}</div>
                    <div class="signature-role">Registrador(a) / Secretário(a)</div>
                  </td>
                </tr>
              </table>

              <div class="participants-list">
                <div class="participant-item">
                  <div class="participant-name">1. Nome: __________________________________________________ Cargo/Órgão: _________________</div>
                  <div class="participant-sign">Assinatura: ___________________________</div>
                </div>
                <div class="participant-item">
                  <div class="participant-name">2. Nome: __________________________________________________ Cargo/Órgão: _________________</div>
                  <div class="participant-sign">Assinatura: ___________________________</div>
                </div>
                <div class="participant-item">
                  <div class="participant-name">3. Nome: __________________________________________________ Cargo/Órgão: _________________</div>
                  <div class="participant-sign">Assinatura: ___________________________</div>
                </div>
                <div class="participant-item">
                  <div class="participant-name">4. Nome: __________________________________________________ Cargo/Órgão: _________________</div>
                  <div class="participant-sign">Assinatura: ___________________________</div>
                </div>
              </div>
            </div>

            <div class="document-footer">
              Este documento é um registro oficial gerado pelo TIO System (Rede Intersetorial). A veracidade das informações é de responsabilidade dos signatários.
              <div class="footer-code">CÓDIGO DE AUTENTICIDADE: TIO-ATA-${ata.id.toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
            </div>

            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 250);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Filtered ATAs list
  const filteredAtas = atas.filter(a => {
    const q = searchQuery.toLowerCase();
    return (
      a.date.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q) ||
      a.coordinator.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q)
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
              {isCreating && (
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
              )}
            </div>

            {/* FORM ASSISTANCE MODE */}
            {activeTab === "form" && isCreating ? (
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
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">5. Encerramento e Assinaturas</span>
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
                      placeholder="Considarações gerais sobre a próxima reunião ou compromissos..."
                      value={formConsideracoes}
                      onChange={e => setFormConsideracoes(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all text-xs"
                    />
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-2">
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
                  className="w-full min-h-[55vh] flex-1 p-4 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl text-xs font-mono focus:outline-none transition-all resize-none leading-relaxed"
                  placeholder="Insira e modifique a ata em Markdown livre..."
                />
              </div>
            )}

            {/* SAVE ACTION BAR */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 bg-white">
              <button
                type="button"
                onClick={() => { setIsCreating(false); setIsEditing(false); setSelectedAta(null); }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveAta}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md cursor-pointer select-none"
              >
                <Save size={14} />
                <span>Registrar e Gravar no Sistema</span>
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
                  onClick={() => handlePrintAta({ id: "temp", content: editorMarkdown, date: "", time: "", location: "", coordinator: "", dataCriacao: "", organ: "", user: "" })}
                  className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-all"
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
                const dayLabel = a.date.split("-").reverse().join("/");
                return (
                  <div
                    key={a.id}
                    className="bg-white rounded-3xl border border-slate-200/70 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
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
                        {a.numero ? `ATA${a.numero.toString().padStart(2, "0")}` : "ATA"} - Reunião Intersetorial
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
                    <div className="flex items-center justify-end gap-2.5 mt-5 pt-4 border-t border-slate-100">
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

    </div>
  );
}
