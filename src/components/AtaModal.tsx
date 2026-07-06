import React from "react";
import ReactMarkdown from "react-markdown";
import { FileText, Copy, Check, X, Printer } from "lucide-react";

interface AtaModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdown: string;
  loading: boolean;
}

export default function AtaModal({ isOpen, onClose, markdown, loading }: AtaModalProps) {
  const [copied, setCopied] = React.useState(false);

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
                <svg width="80" height="88" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Node lines (Left-Top) -->
                  <line x1="14" y1="31" x2="28" y2="38" stroke="#4db6ac" stroke-width="1.8" stroke-linecap="round" />
                  <!-- Node lines (Left-Bottom) -->
                  <line x1="14" y1="69" x2="28" y2="62" stroke="#4db6ac" stroke-width="1.8" stroke-linecap="round" />
                  <!-- Node lines (Right-Top) -->
                  <line x1="86" y1="31" x2="72" y2="38" stroke="#4db6ac" stroke-width="1.8" stroke-linecap="round" />
                  <!-- Node lines (Right-Bottom) -->
                  <line x1="86" y1="69" x2="72" y2="62" stroke="#4db6ac" stroke-width="1.8" stroke-linecap="round" />

                  <!-- Nodes (Circles) -->
                  <circle cx="12" cy="30" r="4.5" fill="#26a69a" />
                  <circle cx="12" cy="70" r="4.5" fill="#26a69a" />
                  <circle cx="88" cy="30" r="4.5" fill="#26a69a" />
                  <circle cx="88" cy="70" r="4.5" fill="#26a69a" />

                  <!-- Shield filled with light cyan background and teal border -->
                  <path d="M 50 15 L 28 23 L 28 52 C 28 72, 38 88, 50 95 C 62 88, 72 72, 72 52 L 72 23 Z" fill="#e6f4f1" stroke="#00695c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />

                  <!-- House Icon inside Shield (continuous line drawing) -->
                  <path d="M 39 44 L 50 34 L 61 44 V 62 M 44 49 H 56 V 62 H 44 Z" stroke="#00352c" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div class="header-text">
                <div class="gov-title">Rede De Integração Operacional de Direitos da Criança e do Adolescente - TIO</div>
                <div class="gov-subtitle">Sistema Integrado TIO • Registro Oficial de Atas</div>
              </div>
            </div>

            <div class="document-content">
              ${compileMarkdownToPrintHtml(markdown)}
            </div>

            <div class="document-footer">
              Este documento é um registro oficial gerado pelo TIO System.
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
            <div className="prose prose-indigo max-w-none text-gray-800">
              {/* Wraps react-markdown inside a div styled for markdown rendering */}
              <div className="markdown-body select-text text-sm leading-relaxed space-y-4">
                <ReactMarkdown>{markdown}</ReactMarkdown>
              </div>
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
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-xl text-sm transition-all shadow-sm"
                id="btn-print-ata"
              >
                <Printer size={16} />
                <span>Imprimir / PDF</span>
              </button>
              
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-5 py-2.5 font-semibold rounded-xl text-sm transition-all shadow-sm ${
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
    </div>
  );
}
