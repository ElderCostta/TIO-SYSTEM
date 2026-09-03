import React from "react";
import ReactMarkdown from "react-markdown";
import { FileText, Copy, Check, X, Printer, Camera, ZoomIn } from "lucide-react";

interface AtaModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdown: string;
  loading: boolean;
  listaPresencaUrl?: string;
  listaPresencaNome?: string;
}

export default function AtaModal({ 
  isOpen, 
  onClose, 
  markdown, 
  loading,
  listaPresencaUrl,
  listaPresencaNome
}: AtaModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [zoomModalOpen, setZoomModalOpen] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <title>ATA DE REUNIÃO INTERSETORIAL</title>
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
                padding-top: 20px;
                border-top: 2px solid #0c4a80;
              }
              .anexo-presenca-header {
                text-align: center;
                margin-bottom: 12px;
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
                letter-spacing: 1px;
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

            <!-- Attendance List Attachment Section - Opened Display on Dedicated Page -->
            <div class="anexo-presenca-page">
              <div class="anexo-presenca-header">
                <div class="anexo-tag">ANEXO OFICIAL</div>
                <div class="anexo-title">COMPROVAÇÃO DE PRESENÇAS — LISTA DE PRESENÇA DA REUNIÃO</div>
                <div class="anexo-subtitle">A validação das presenças dos órgãos e membros presentes dá-se pela lista física assinada, cujo comprovante digitalizado encontra-se aberto na íntegra abaixo:</div>
              </div>

              ${listaPresencaUrl ? `
                <div class="anexo-image-wrapper">
                  <img src="${listaPresencaUrl}" alt="Lista de Presença Digitalizada" class="anexo-image" loading="eager" decoding="sync" />
                  <div class="anexo-image-caption">
                    Documento comprobatório digitalizado aberto: ${listaPresencaNome || 'Lista_de_Presenca.jpg'}
                  </div>
                </div>
              ` : `
                <div class="anexo-placeholder-box">
                  <div style="font-size: 20px;">📋</div>
                  <div>
                    <strong>Lista de Presença Física Assinada:</strong> O documento original rubricado pelos membros e participantes presentes na reunião encontra-se devidamente preenchido e arquivado junto à coordenação da rede intersetorial.
                  </div>
                </div>
              `}
            </div>

            <div class="document-footer">
              Este documento é um registro oficial gerado pelo TIO System. A frequência dos participantes é comprovada pela Lista de Presença anexa.
            </div>

            <script>
              window.onload = function() {
                var img = document.querySelector('.anexo-image');
                if (img && img.getAttribute('src')) {
                  if (img.complete && img.naturalHeight !== 0) {
                    setTimeout(function() { window.print(); }, 400);
                  } else {
                    img.onload = function() {
                      setTimeout(function() { window.print(); }, 400);
                    };
                    img.onerror = function() {
                      setTimeout(function() { window.print(); }, 400);
                    };
                    setTimeout(function() { window.print(); }, 1200);
                  }
                } else {
                  setTimeout(function() {
                    window.print();
                  }, 300);
                }
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText size={22} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-lg text-gray-900">
                Ata Oficial da Reunião
              </h3>
              <p className="text-xs text-gray-500 font-sans">
                Documento gerado de forma inteligente pela Inteligência Artificial do TIO System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            id="btn-close-ata-modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-sm font-medium text-gray-600">
                Redigindo ata formal...
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs text-center">
                O Gemini está analisando os relatos de caso, discussões e encaminhamentos para gerar um documento em formato oficial.
              </p>
            </div>
          ) : !markdown ? (
            <div className="text-center py-16 text-gray-500">
              Nenhuma ata gerada ou conteúdo vazio.
            </div>
          ) : (
            <div className="prose prose-indigo max-w-none text-gray-800 space-y-6">
              {/* Wraps react-markdown inside a div styled for markdown rendering */}
              <div className="markdown-body select-text text-sm leading-relaxed space-y-4">
                <ReactMarkdown>{markdown}</ReactMarkdown>
              </div>

              {/* Attendance List Display - Opened View */}
              {listaPresencaUrl && (
                <div className="pt-6 border-t border-slate-200 mt-6 not-prose">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-bold">
                        Anexo Integrante
                      </span>
                      <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                        <Camera size={14} className="text-indigo-600" />
                        Comprovação de Presenças — Lista Oficial Aberta
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setZoomModalOpen(true)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <ZoomIn size={13} />
                      <span>Ampliar em Tela Cheia</span>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-center">
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm inline-block max-w-full">
                      <img
                        src={listaPresencaUrl}
                        alt="Lista de Presença Assinada Aberta"
                        onClick={() => setZoomModalOpen(true)}
                        className="max-h-[520px] w-auto max-w-full object-contain rounded-lg mx-auto cursor-pointer hover:opacity-95 transition-opacity"
                        title="Clique para ampliar"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
                      <span>{listaPresencaNome || "Lista_de_Presenca.jpg"}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold">Exibição aberta para comprovação das assinaturas</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!loading && markdown && (
          <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <div className="text-xs text-gray-400 font-mono">
              Pronto para cópia ou assinatura física
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-xl text-sm transition-all shadow-sm cursor-pointer"
                id="btn-print-ata"
              >
                <Printer size={16} />
                <span>Imprimir / PDF</span>
              </button>
              
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-5 py-2.5 font-semibold rounded-xl text-sm transition-all shadow-sm cursor-pointer ${
                  copied
                    ? "bg-emerald-600 text-white shadow-emerald-100"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                }`}
                id="btn-copy-ata"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? "Copiado!" : "Copiar Texto da Ata"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Zoom Modal */}
      {zoomModalOpen && listaPresencaUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-5xl w-full max-h-[92vh] bg-slate-950 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-white/10">
              <span className="text-xs font-bold">{listaPresencaNome || "Lista de Presença Assinada"}</span>
              <button
                type="button"
                onClick={() => setZoomModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 p-4 flex items-center justify-center overflow-auto max-h-[80vh]">
              <img
                src={listaPresencaUrl}
                alt="Lista de Presença Ampliada"
                className="max-h-full max-w-full object-contain rounded shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
