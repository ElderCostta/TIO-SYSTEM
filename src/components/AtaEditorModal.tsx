import React from "react";
import ReactMarkdown from "react-markdown";
import { 
  FileText, 
  Copy, 
  Check, 
  X, 
  Printer, 
  Edit3, 
  Eye, 
  Save, 
  Download, 
  Camera, 
  Upload, 
  Trash2, 
  ZoomIn, 
  ImageIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { MeetingPhoto } from "../types";

interface AtaEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMarkdown: string;
  onSave: (newMarkdown: string, listaPresencaUrl?: string, listaPresencaNome?: string, fotosReuniao?: MeetingPhoto[]) => void;
  readOnly: boolean;
  title?: string;
  listaPresencaUrl?: string;
  listaPresencaNome?: string;
  fotosReuniao?: MeetingPhoto[];
}

export default function AtaEditorModal({
  isOpen,
  onClose,
  initialMarkdown,
  onSave,
  readOnly,
  title = "Ata de Reunião Intersetorial",
  listaPresencaUrl,
  listaPresencaNome,
  fotosReuniao
}: AtaEditorModalProps) {
  const [markdown, setMarkdown] = React.useState(initialMarkdown);
  const [activeTab, setActiveTab] = React.useState<"preview" | "edit">("preview");
  const [copied, setCopied] = React.useState(false);
  const [currentListaUrl, setCurrentListaUrl] = React.useState<string | undefined>(listaPresencaUrl);
  const [currentListaNome, setCurrentListaNome] = React.useState<string | undefined>(listaPresencaNome);
  const [currentFotosReuniao, setCurrentFotosReuniao] = React.useState<MeetingPhoto[]>(fotosReuniao || []);
  const [isUploadingPhotos, setIsUploadingPhotos] = React.useState(false);
  const [zoomModalOpen, setZoomModalOpen] = React.useState(false);
  const [galleryModal, setGalleryModal] = React.useState<{ photos: MeetingPhoto[]; currentIndex: number; title: string } | null>(null);

  // Sync markdown with initialMarkdown when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setMarkdown(initialMarkdown);
      setActiveTab(readOnly ? "preview" : "edit");
      setCurrentListaUrl(listaPresencaUrl);
      setCurrentListaNome(listaPresencaNome);
      setCurrentFotosReuniao(fotosReuniao || []);
    }
  }, [isOpen, initialMarkdown, readOnly, listaPresencaUrl, listaPresencaNome, fotosReuniao]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAttendancePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.70);
          setCurrentListaUrl(compressed);
          setCurrentListaNome(file.name);
        } else {
          setCurrentListaUrl(base64);
          setCurrentListaNome(file.name);
        }
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  };

  const handleMeetingPhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhotos(true);
    const fileList = Array.from(files);
    let processedCount = 0;
    const newPhotos: MeetingPhoto[] = [];

    fileList.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 850;
          const MAX_HEIGHT = 850;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/jpeg", 0.65);
            newPhotos.push({
              id: `foto-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              url: compressed,
              nome: file.name,
              legenda: ""
            });
          } else {
            newPhotos.push({
              id: `foto-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              url: base64,
              nome: file.name,
              legenda: ""
            });
          }

          processedCount++;
          if (processedCount === fileList.length) {
            setCurrentFotosReuniao(prev => [...prev, ...newPhotos]);
            setIsUploadingPhotos(false);
          }
        };
        img.onerror = () => {
          processedCount++;
          if (processedCount === fileList.length) {
            if (newPhotos.length > 0) {
              setCurrentFotosReuniao(prev => [...prev, ...newPhotos]);
            }
            setIsUploadingPhotos(false);
          }
        };
        img.src = base64;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveMeetingPhoto = (photoId: string) => {
    setCurrentFotosReuniao(prev => prev.filter(p => p.id !== photoId));
  };

  const handleUpdateMeetingPhotoLegenda = (photoId: string, legenda: string) => {
    setCurrentFotosReuniao(prev => prev.map(p => p.id === photoId ? { ...p, legenda } : p));
  };

  // Helper markdown compiler for printing
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

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
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

              /* Content block styling with Times New Roman */
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

              /* Attendance list attachment - Dedicated Page */
              .anexo-presenca-page {
                page-break-before: always;
                break-before: page;
                page-break-inside: avoid;
                break-inside: avoid;
                margin-top: 36px;
                border-top: 2px solid #0c4a80;
                padding-top: 20px;
              }
              .anexo-presenca-header {
                text-align: center;
                margin-bottom: 14px;
                padding-bottom: 8px;
                border-bottom: 1px solid #cbd5e1;
              }
              .anexo-tag {
                display: inline-block;
                background-color: #0c4a80;
                color: #ffffff;
                font-size: 9px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 1.2px;
                padding: 3px 10px;
                border-radius: 4px;
                margin-bottom: 6px;
                font-family: 'Inter', sans-serif;
              }
              .anexo-title {
                font-size: 13.5px;
                font-weight: 800;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-family: 'Inter', sans-serif;
                margin: 0 0 4px 0;
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
                margin-top: 8px;
                font-size: 10px;
                color: #475569;
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
                .fotos-grid {
                  display: grid !important;
                  grid-template-columns: repeat(2, 1fr) !important;
                  gap: 14px !important;
                  margin-top: 14px !important;
                }
                .foto-grid-card {
                  border: 1px solid #cbd5e1 !important;
                  border-radius: 6px !important;
                  overflow: hidden !important;
                  background: #ffffff !important;
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                  display: flex !important;
                  flex-direction: column !important;
                }
                .foto-grid-img {
                  width: 100% !important;
                  height: 230px !important;
                  object-fit: cover !important;
                  display: block !important;
                }
                .foto-grid-caption {
                  padding: 8px 10px !important;
                  font-size: 10px !important;
                  color: #334155 !important;
                  background: #f8fafc !important;
                  border-top: 1px solid #e2e8f0 !important;
                  text-align: center !important;
                }
                .foto-counter-badge {
                  display: inline-block !important;
                  font-size: 8px !important;
                  font-weight: 700 !important;
                  background: #7e22ce !important;
                  color: #ffffff !important;
                  padding: 2px 6px !important;
                  border-radius: 4px !important;
                  margin-bottom: 4px !important;
                  text-transform: uppercase !important;
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

            <div class="document-content">
              ${compileMarkdownToPrintHtml(markdown)}
            </div>

            <!-- Attendance List Attachment Section - Dedicated Page -->
            <div class="anexo-presenca-page">
              <div class="anexo-presenca-header">
                <div class="anexo-tag">ANEXO OFICIAL</div>
                <div class="anexo-title">COMPROVAÇÃO DE PRESENÇAS — LISTA DE PRESENÇA DA REUNIÃO</div>
                <div class="anexo-subtitle">A validação das presenças dos órgãos e membros presentes dá-se pela lista física assinada, cujo comprovante digitalizado encontra-se aberto na íntegra abaixo:</div>
              </div>

              ${currentListaUrl ? `
                <div class="anexo-image-wrapper">
                  <img src="${currentListaUrl}" alt="Lista de Presença Digitalizada" class="anexo-image" loading="eager" decoding="sync" />
                  <div class="anexo-image-caption">
                    Documento comprobatório digitalizado aberto: ${currentListaNome || 'Lista_de_Presenca.jpg'}
                  </div>
                </div>
              ` : `
                <div class="anexo-placeholder-box">
                  <div class="anexo-placeholder-icon">📋</div>
                  <div class="anexo-placeholder-text">
                    <strong>Lista de Presença Física Assinada:</strong> O documento original rubricado pelos membros e participantes presentes na reunião encontra-se devidamente arquivado junto à coordenação da rede intersetorial.
                  </div>
                </div>
              `}
            </div>

            ${currentFotosReuniao && currentFotosReuniao.length > 0 ? `
              <!-- Meeting Photos Section - Anexo II -->
              <div class="anexo-presenca-page" style="page-break-before: always; break-before: page;">
                <div class="anexo-presenca-header">
                  <div class="anexo-tag" style="background: #7e22ce;">ANEXO II: REGISTRO FOTOGRÁFICO</div>
                  <div class="anexo-title">FOTOS DA REUNIÃO — REGISTRO FOTOGRÁFICO INTERSETORIAL</div>
                  <div class="anexo-subtitle">Registros visuais e fotográficos capturados durante a sessão deliberativa intersetorial:</div>
                </div>

                <div class="fotos-grid">
                  ${currentFotosReuniao.map((f, idx) => `
                    <div class="foto-grid-card">
                      <img src="${f.url}" alt="${f.legenda || f.nome || `Foto ${idx + 1}`}" class="foto-grid-img" loading="eager" decoding="sync" />
                      <div class="foto-grid-caption">
                        <span class="foto-counter-badge">Foto ${idx + 1} de ${currentFotosReuniao.length}</span>
                        ${f.legenda ? `<div><strong>${f.legenda}</strong></div>` : ''}
                        ${f.nome ? `<div style="font-size: 8.5px; color: #64748b; font-family: monospace; margin-top: 2px;">${f.nome}</div>` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <div class="document-footer">
              Este documento é um registro oficial gerado pelo TIO System. A frequência dos participantes é comprovada pela Lista de Presença anexa.
            </div>

            <script>
              function triggerPrint() {
                var images = document.querySelectorAll('.anexo-image, .foto-grid-img');
                var total = images.length;
                if (total === 0) {
                  setTimeout(function() { window.print(); }, 300);
                  return;
                }
                var loaded = 0;
                var printed = false;
                function checkComplete() {
                  loaded++;
                  if (loaded >= total && !printed) {
                    printed = true;
                    setTimeout(function() { window.print(); }, 350);
                  }
                }
                images.forEach(function(img) {
                  if (img.complete && img.naturalHeight !== 0) {
                    checkComplete();
                  } else {
                    img.onload = checkComplete;
                    img.onerror = checkComplete;
                  }
                });
                setTimeout(function() {
                  if (!printed) {
                    printed = true;
                    window.print();
                  }
                }, 2000);
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
    }
  };

  const handleSave = () => {
    onSave(markdown, currentListaUrl, currentListaNome, currentFotosReuniao);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" id="ata-editor-modal-container">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-lg text-gray-900">
                {title}
              </h3>
              <p className="text-xs text-gray-500 font-sans">
                {readOnly ? "Visualização oficial do documento de ata" : "Edite o modelo de ata, preencha as lacunas e salve as discussões"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
            id="btn-close-ata-editor-modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        {!readOnly && (
          <div className="flex border-b border-gray-100 bg-white px-6 py-2 gap-2">
            <button
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "edit"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
              id="tab-edit-ata"
            >
              <Edit3 size={14} />
              Editar Conteúdo (Modelo)
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "preview"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
              id="tab-preview-ata"
            >
              <Eye size={14} />
              Visualizar Impressão
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 font-sans bg-slate-50/30 space-y-4">
          {activeTab === "edit" && !readOnly ? (
            <div className="flex flex-col space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Editor de Texto em Markdown (Edite livremente as lacunas):
                </label>
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="w-full min-h-[36vh] p-4 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-mono focus:outline-none transition-all resize-none leading-relaxed"
                  placeholder="Insira o texto da ata..."
                  id="ata-markdown-editor-textarea"
                />
              </div>

              {/* Attendance List Photo Attachment Section */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Camera size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Foto da Lista de Presença da Reunião</h4>
                      <p className="text-[11px] text-slate-500">
                        Substitui as assinaturas manuais por anexo digital da folha física assinada
                      </p>
                    </div>
                  </div>
                  {currentListaUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentListaUrl(undefined);
                        setCurrentListaNome(undefined);
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Trash2 size={13} /> Remover
                    </button>
                  )}
                </div>

                {currentListaUrl ? (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <img
                      src={currentListaUrl}
                      alt="Lista de Presença Anexa"
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {currentListaNome || "Lista_de_Presenca.jpg"}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                        <Check size={12} /> Comprovante vinculado para o PDF oficial
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setZoomModalOpen(true)}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                    >
                      <ZoomIn size={13} /> Ampliar
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center">
                    <Upload size={20} className="text-slate-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">
                        Clique para anexar ou tirar foto da lista de presenças
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Formatos aceitos: JPG, PNG, WEBP (Comprimido com segurança)
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAttendancePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Meeting Photos Attachment Section */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <ImageIcon size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <span>Fotos das Reuniões (Registro Fotográfico)</span>
                        {currentFotosReuniao.length > 0 && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                            {currentFotosReuniao.length} {currentFotosReuniao.length === 1 ? "foto" : "fotos"}
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Anexe fotos dos participantes e momentos da reunião para compor o Anexo II do documento oficial
                      </p>
                    </div>
                  </div>

                  {currentFotosReuniao.length > 0 && (
                    <label className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all">
                      <Upload size={13} />
                      <span>Adicionar Mais</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMeetingPhotosUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {isUploadingPhotos && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-700 flex items-center gap-2 animate-pulse">
                    <span>Processando e comprimindo fotos da reunião...</span>
                  </div>
                )}

                {currentFotosReuniao.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {currentFotosReuniao.map((photo, idx) => (
                      <div key={photo.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2 relative group">
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-200 border border-slate-200 shadow-inner">
                          <img
                            src={photo.url}
                            alt={photo.legenda || `Foto ${idx + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:scale-102 transition-transform"
                            onClick={() => setGalleryModal({ photos: currentFotosReuniao, currentIndex: idx, title: "Fotos da Reunião" })}
                          />
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold rounded">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMeetingPhoto(photo.id)}
                            className="absolute top-1.5 right-1.5 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-md shadow transition-all cursor-pointer"
                            title="Remover foto"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={photo.legenda || ""}
                          onChange={(e) => handleUpdateMeetingPhotoLegenda(photo.id, e.target.value)}
                          placeholder="Legenda da foto (opcional)..."
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 hover:border-purple-400 hover:bg-purple-50/20 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center">
                    <Upload size={20} className="text-purple-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">
                        Clique para selecionar fotos da reunião (múltiplas permitidas)
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        As imagens serão otimizadas e incluídas no Anexo II do PDF oficial
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMeetingPhotosUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="prose prose-indigo max-w-none text-slate-800">
                <div className="markdown-body select-text text-sm leading-relaxed space-y-4">
                  <ReactMarkdown>{markdown}</ReactMarkdown>
                </div>
              </div>

              {/* Attendance List Preview Block - Opened View */}
              <div className="pt-6 border-t border-slate-200/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-bold">
                      Anexo Oficial
                    </span>
                    <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                      <Camera size={14} className="text-indigo-600" />
                      Comprovação de Presenças — Lista Oficial Aberta
                    </span>
                  </div>
                  {currentListaUrl && (
                    <button
                      type="button"
                      onClick={() => setZoomModalOpen(true)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer text-xs hover:underline"
                    >
                      <ZoomIn size={13} /> Ampliar em Tela Cheia
                    </button>
                  )}
                </div>

                {currentListaUrl ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-center">
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm inline-block max-w-full">
                      <img
                        src={currentListaUrl}
                        alt="Lista de Presença Anexa Aberta"
                        onClick={() => setZoomModalOpen(true)}
                        className="max-h-[520px] w-auto max-w-full object-contain rounded-lg mx-auto cursor-pointer hover:opacity-95 transition-opacity"
                        title="Clique para ampliar"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
                      <span className="truncate">{currentListaNome || "Lista_de_Presenca.jpg"}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold">Exibição aberta da folha física assinada</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                    Validação de presenças mediante a lista física arquivada junto à coordenação da rede.
                  </div>
                )}
              </div>

              {/* Meeting Photos Preview Block - Anexo II */}
              <div className="pt-6 border-t border-slate-200/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded font-bold">
                      Anexo II
                    </span>
                    <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-purple-600" />
                      Fotos das Reuniões — Registro Fotográfico
                    </span>
                  </div>
                  {currentFotosReuniao.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {currentFotosReuniao.length} {currentFotosReuniao.length === 1 ? "foto" : "fotos"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGalleryModal({ photos: currentFotosReuniao, currentIndex: 0, title: "Registro Fotográfico da Reunião" })}
                        className="text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1 cursor-pointer text-xs hover:underline"
                      >
                        <ZoomIn size={13} /> Ver Galeria
                      </button>
                    </div>
                  ) : null}
                </div>

                {currentFotosReuniao.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    {currentFotosReuniao.map((photo, idx) => (
                      <div
                        key={photo.id}
                        onClick={() => setGalleryModal({ photos: currentFotosReuniao, currentIndex: idx, title: "Registro Fotográfico da Reunião" })}
                        className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-purple-300 transition-all group"
                      >
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-100">
                          <img
                            src={photo.url}
                            alt={photo.legenda || photo.nome || `Foto ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <ZoomIn size={16} />
                          </div>
                        </div>
                        {photo.legenda && (
                          <p className="text-[10px] text-slate-600 font-medium truncate mt-1.5 text-center">
                            {photo.legenda}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                    Nenhum registro fotográfico foi anexado para esta reunião.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="text-xs text-gray-400 font-mono">
            {activeTab === "edit" ? "Modo de edição ativo" : "Pronto para cópia ou download em PDF"}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-xl text-sm transition-all shadow-sm cursor-pointer"
              id="btn-print-editor-ata"
            >
              <Printer size={16} />
              <span>Imprimir / PDF</span>
            </button>
            
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2.5 font-medium rounded-xl text-sm transition-all shadow-sm cursor-pointer ${
                copied
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
              id="btn-copy-editor-ata"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? "Copiado!" : "Copiar Texto"}</span>
            </button>

            {!readOnly && (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-all cursor-pointer"
                  id="btn-save-editor-ata"
                >
                  <Save size={16} />
                  <span>Apenas Salvar</span>
                </button>
                <button
                  onClick={() => {
                    handleSave();
                    setTimeout(() => handlePrint(), 150);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer"
                  id="btn-save-download-editor-ata"
                >
                  <Download size={16} />
                  <span>Salvar e Baixar PDF</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {zoomModalOpen && currentListaUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-slate-950 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-white/10">
              <span className="text-xs font-bold">{currentListaNome || "Lista de Presença"}</span>
              <button
                type="button"
                onClick={() => setZoomModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-slate-300 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 p-4 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={currentListaUrl}
                alt="Lista de Presença Ampliada"
                className="max-h-full max-w-full object-contain rounded shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN MEETING PHOTOS GALLERY MODAL */}
      {galleryModal && galleryModal.photos.length > 0 && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-5xl w-full max-h-[94vh] bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 text-white border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/30 text-purple-400 rounded-xl border border-purple-500/30">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{galleryModal.title}</h4>
                  <p className="text-[11px] text-slate-400">
                    Foto {galleryModal.currentIndex + 1} de {galleryModal.photos.length}
                    {galleryModal.photos[galleryModal.currentIndex]?.nome && ` • ${galleryModal.photos[galleryModal.currentIndex].nome}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGalleryModal(null)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Fechar galeria"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Stage with Nav Arrows */}
            <div className="relative flex-1 p-4 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[50vh] max-h-[68vh]">
              {galleryModal.photos.length > 1 && (
                <button
                  type="button"
                  onClick={() => setGalleryModal(prev => prev ? {
                    ...prev,
                    currentIndex: (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length
                  } : null)}
                  className="absolute left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur transition-all border border-white/10 cursor-pointer shadow-lg"
                  title="Foto anterior"
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              <img
                src={galleryModal.photos[galleryModal.currentIndex]?.url}
                alt={galleryModal.photos[galleryModal.currentIndex]?.legenda || `Foto ${galleryModal.currentIndex + 1}`}
                className="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-all duration-200"
              />

              {galleryModal.photos.length > 1 && (
                <button
                  type="button"
                  onClick={() => setGalleryModal(prev => prev ? {
                    ...prev,
                    currentIndex: (prev.currentIndex + 1) % prev.photos.length
                  } : null)}
                  className="absolute right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur transition-all border border-white/10 cursor-pointer shadow-lg"
                  title="Próxima foto"
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>

            {/* Photo Caption & Info */}
            {galleryModal.photos[galleryModal.currentIndex]?.legenda && (
              <div className="px-6 py-2.5 bg-slate-950/60 border-t border-white/5 text-center">
                <p className="text-xs text-slate-300 font-medium italic">
                  "{galleryModal.photos[galleryModal.currentIndex]?.legenda}"
                </p>
              </div>
            )}

            {/* Thumbnails row & footer */}
            <div className="px-6 py-3 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
              {/* Thumbnails */}
              <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
                {galleryModal.photos.map((ph, idx) => (
                  <button
                    key={ph.id}
                    type="button"
                    onClick={() => setGalleryModal(prev => prev ? { ...prev, currentIndex: idx } : null)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      idx === galleryModal.currentIndex 
                        ? "border-purple-500 scale-105 shadow-md shadow-purple-500/20" 
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={ph.url} alt={ph.legenda || `Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={galleryModal.photos[galleryModal.currentIndex]?.url}
                  download={galleryModal.photos[galleryModal.currentIndex]?.nome || `foto_reuniao_${galleryModal.currentIndex + 1}.jpg`}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                  title="Baixar imagem original"
                >
                  <Download size={13} />
                  <span>Baixar</span>
                </a>
                <button
                  type="button"
                  onClick={() => setGalleryModal(null)}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
