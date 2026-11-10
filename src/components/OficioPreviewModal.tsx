import React, { useState } from "react";
import { 
  Printer, 
  X, 
  Download, 
  Copy, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  FileText,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Oficio } from "../types";
import { 
  getOficioHeaderHtml, 
  getOficioPrintCss, 
  formatDataPorExtenso, 
  CONSELHO_TUTELAR_OFICIAL_LOGO_DATA_URL 
} from "../utils/oficioUtils";
import { getPrintWatermarkCss, getPrintWatermarkHtml } from "../utils/councilSeal";

interface OficioPreviewModalProps {
  oficio: Oficio;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export default function OficioPreviewModal({
  oficio,
  isOpen,
  onClose,
  onEdit
}: OficioPreviewModalProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"documento" | "anexos">("documento");

  if (!isOpen) return null;

  const dataFormatada = formatDataPorExtenso(oficio.dataEmissao) || oficio.dataEmissao;
  const dataFinalTexto = oficio.dataEncerramento || `${oficio.cidade}, ${dataFormatada}`;

  // Helper para impressão direta via janela isolada formatada em A4 com repetição de cabeçalho
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor, permita pop-ups para imprimir o ofício oficial.");
      return;
    }

    const anexosHtml = (oficio.anexos && oficio.anexos.length > 0) 
      ? oficio.anexos.map((anexo, idx) => `
        <div class="a4-page page-break" style="page-break-before: always; padding-top: 5mm;">
          ${getOficioHeaderHtml()}
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background: #f1f5f9; padding: 4px 12px; border-radius: 4px; font-size: 10pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #cbd5e1;">
              ANEXO ${idx + 1} DE ${oficio.anexos!.length}
            </div>
            <h3 style="font-size: 13pt; font-weight: bold; margin: 8px 0 4px 0;">${anexo.nome}</h3>
            ${anexo.descricao ? `<p style="font-size: 10pt; color: #475569; margin: 0;">${anexo.descricao}</p>` : ""}
          </div>
          <div style="text-align: center; margin-top: 15px;">
            ${anexo.url ? `<img src="${anexo.url}" alt="${anexo.nome}" style="max-width: 95%; max-height: 200mm; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" />` : `<div style="border: 2px dashed #94a3b8; padding: 60px 20px; border-radius: 8px; color: #64748b;">[Documento Anexo / Comprovante Físico Arquivado junto ao Ofício]</div>`}
          </div>
        </div>
      `).join("")
      : "";

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>${oficio.numeroFormatado || 'Ofício'} - Conselho Tutelar</title>
        <style>
          ${getOficioPrintCss()}
          ${getPrintWatermarkCss()}
        </style>
      </head>
      <body>
        ${getPrintWatermarkHtml()}

        <div class="a4-page oficio-doc-root">
          ${getOficioHeaderHtml()}

          <!-- Numeração e Data -->
          <div class="oficio-meta-row">
            <div style="font-weight: bold;">
              ${oficio.numeroFormatado || `Ofício CT Nº ${oficio.numero}/${oficio.ano}`}
            </div>
            <div>
              ${oficio.cidade}/${oficio.uf}, ${dataFormatada}.
            </div>
          </div>

          <!-- Destinatário -->
          <div class="oficio-destinatario-block">
            <div>${oficio.tratamentoDestinatario}</div>
            <div style="font-weight: bold;">${oficio.nomeDestinatario}</div>
            <div>${oficio.cargoDestinatario}</div>
            <div>${oficio.enderecoDestinatario}</div>
          </div>

          <!-- Assunto -->
          <div class="oficio-assunto-block">
            <strong>Assunto:</strong> ${oficio.assunto}
            ${oficio.numeroProcedimento ? ` de nº <strong>${oficio.numeroProcedimento}</strong>` : ""}
          </div>

          <!-- Saudação Formal -->
          <div class="oficio-saudacao">
            ${oficio.saudacao}
          </div>

          <!-- Parágrafos do Texto -->
          <div class="oficio-corpo">
            ${oficio.paragrafos.map(p => `<p class="oficio-paragrafo">${p}</p>`).join("")}
          </div>

          <!-- Encerramento -->
          <div class="oficio-encerramento">
            ${oficio.encerramento}
          </div>

          <!-- Fecho -->
          <div class="oficio-fecho">
            ${oficio.fecho}
          </div>

          <!-- Assinaturas em Grade -->
          <div class="signature-block">
            <div class="oficio-assinaturas-grid">
              ${oficio.conselheiros.filter(c => c.linhaAssinatura).map(c => `
                <div class="oficio-assinatura-item">
                  <div class="oficio-assinatura-linha"></div>
                  <div class="oficio-assinatura-cargo">${c.cargo || "Conselheiro (a) tutelar"}</div>
                  ${c.nome ? `<div class="oficio-assinatura-nome">${c.nome}</div>` : ""}
                  ${c.matricula ? `<div style="font-size: 9pt; color: #475569;">${c.matricula}</div>` : ""}
                </div>
              `).join("")}
            </div>

            <div class="oficio-data-final">
              ${dataFinalTexto}
            </div>
          </div>
        </div>

        ${anexosHtml}

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(fullHtml);
    printWindow.document.close();
  };

  const handleCopyText = () => {
    const textLines = [
      "CONSELHO TUTELAR DOS DIREITOS DA CRIANÇA E DO ADOLESCENTE LEI FEDERAL Nº 8.069/90",
      "----------------------------------------------------------------------",
      `${oficio.numeroFormatado} \t ${oficio.cidade}/${oficio.uf}, ${dataFormatada}`,
      "",
      oficio.tratamentoDestinatario,
      oficio.nomeDestinatario,
      oficio.cargoDestinatario,
      oficio.enderecoDestinatario,
      "",
      `Assunto: ${oficio.assunto}${oficio.numeroProcedimento ? ` de nº ${oficio.numeroProcedimento}` : ""}`,
      "",
      oficio.saudacao,
      "",
      ...oficio.paragrafos.map(p => `   ${p}\n`),
      `   ${oficio.encerramento}`,
      "",
      `   ${oficio.fecho}`,
      "",
      ...oficio.conselheiros.filter(c => c.linhaAssinatura).map(c => `__________________________\n${c.cargo}${c.nome ? `\n${c.nome}` : ""}\n`),
      dataFinalTexto
    ].join("\n");

    navigator.clipboard.writeText(textLines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      
      {/* Top action toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <FileText size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                {oficio.numeroFormatado || `Ofício CT Nº ${oficio.numero}/${oficio.ano}`}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                oficio.status === "Emitido" 
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : oficio.status === "Protocolado"
                  ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
              }`}>
                {oficio.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
              {oficio.nomeDestinatario || "Destinatário"} • {oficio.assunto}
            </p>
          </div>
        </div>

        {/* Center zoom controls */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700">
          <button 
            onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
            title="Diminuir Zoom"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-mono font-bold text-slate-300 px-2 select-none">
            {zoomLevel}%
          </span>
          <button 
            onClick={() => setZoomLevel(prev => Math.min(140, prev + 10))}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
            title="Aumentar Zoom"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            onClick={() => setZoomLevel(100)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition ml-1"
            title="Tamanho Real (100%)"
          >
            <Maximize2 size={14} />
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {oficio.anexos && oficio.anexos.length > 0 && (
            <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 mr-2 text-xs">
              <button
                onClick={() => setActiveTab("documento")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === "documento" ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white"}`}
              >
                Ofício
              </button>
              <button
                onClick={() => setActiveTab("anexos")}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${activeTab === "anexos" ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white"}`}
              >
                Anexos ({oficio.anexos.length})
              </button>
            </div>
          )}

          {onEdit && (
            <button
              onClick={onEdit}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              Editar
            </button>
          )}

          <button
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
            title="Copiar texto formal"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span className="hidden sm:inline">{copied ? "Copiado!" : "Copiar"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <Printer size={15} />
            <span>Imprimir / PDF</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition ml-1"
            title="Fechar Visualizador"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main A4 Canvas Area */}
      <div className="flex-1 overflow-auto bg-slate-850 p-4 sm:p-8 flex justify-center items-start">
        <div 
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
          className="transition-transform duration-150 ease-out"
        >
          {activeTab === "documento" ? (
            /* A4 Sheet Simulator */
            <div className="w-[210mm] min-h-[297mm] bg-white text-black p-[20mm] shadow-2xl rounded-sm border border-slate-300 relative select-text font-serif leading-relaxed text-[12pt]">
              
              {/* Institutional Header with Logo & Legislation */}
              <div className="text-center mb-6">
                <div className="flex justify-center mb-2">
                  <img 
                    src={CONSELHO_TUTELAR_OFICIAL_LOGO_DATA_URL} 
                    alt="Conselho Tutelar" 
                    className="h-16 max-w-[150px] object-contain"
                  />
                </div>
                <h1 className="font-serif font-bold text-[14pt] text-black uppercase leading-tight tracking-tight">
                  CONSELHO TUTELAR DOS DIREITOS
                </h1>
                <h2 className="font-serif font-bold text-[11.5pt] text-black uppercase leading-tight tracking-tight mt-0.5">
                  DA CRIANÇA E DO ADOLESCENTE LEI FEDERAL Nº 8.069/90 – LEI FEDERAL 8.069/90
                </h2>
                <div className="w-full border-b-[1.5px] border-black mt-2.5 mb-5" />
              </div>

              {/* Number and Date Row */}
              <div className="flex justify-between items-baseline mb-5 text-[11.5pt]">
                <div className="font-bold">
                  {oficio.numeroFormatado || `Ofício CT Nº ${oficio.numero}/${oficio.ano}`}
                </div>
                <div>
                  {oficio.cidade}/{oficio.uf}, {dataFormatada}.
                </div>
              </div>

              {/* Recipient Details */}
              <div className="mb-5 text-[11.5pt] leading-snug">
                <div>{oficio.tratamentoDestinatario}</div>
                <div className="font-bold">{oficio.nomeDestinatario}</div>
                <div>{oficio.cargoDestinatario}</div>
                <div>{oficio.enderecoDestinatario}</div>
              </div>

              {/* Subject & Procedure */}
              <div className="mb-5 text-[11.5pt]">
                <span className="font-normal">Assunto: </span>
                <span>{oficio.assunto}</span>
                {oficio.numeroProcedimento && (
                  <span> de nº <strong className="font-bold">{oficio.numeroProcedimento}</strong></span>
                )}
              </div>

              {/* Formal Greeting */}
              <div className="text-center my-6 text-[12pt]">
                {oficio.saudacao}
              </div>

              {/* Body Paragraphs with standard 2.5cm indent & justified alignment */}
              <div className="space-y-3.5 text-justify text-[12pt] leading-[1.45]">
                {oficio.paragrafos.map((paragrafo, idx) => (
                  <p 
                    key={idx} 
                    className="indent-[2.5cm] m-0 text-justify"
                    style={{ textJustify: "inter-word" }}
                  >
                    {paragrafo}
                  </p>
                ))}
              </div>

              {/* Closing paragraph */}
              <div className="indent-[2.5cm] text-justify mt-5 text-[12pt] leading-[1.45]">
                {oficio.encerramento}
              </div>

              {/* Salutation Close */}
              <div className="text-center my-7 text-[12pt]">
                {oficio.fecho}
              </div>

              {/* Counselor Signature Grid (2 columns) */}
              <div className="mt-8 mb-6">
                <div className="grid grid-cols-2 gap-x-10 gap-y-8 text-center">
                  {oficio.conselheiros.filter(c => c.linhaAssinatura).map((c) => (
                    <div key={c.id} className="flex flex-col items-center">
                      <div className="w-4/5 border-b border-black mb-1.5" />
                      <div className="text-[11pt] text-black">
                        {c.cargo || "Conselheiro (a) tutelar"}
                      </div>
                      {c.nome && (
                        <div className="text-[11pt] font-bold text-black mt-0.5">
                          {c.nome}
                        </div>
                      )}
                      {c.matricula && (
                        <div className="text-[9pt] text-slate-600">
                          {c.matricula}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Final emission city & date */}
                <div className="text-center mt-10 text-[11.5pt]">
                  {dataFinalTexto}
                </div>
              </div>

              {/* Footer info badge */}
              <div className="absolute bottom-4 left-6 right-6 text-center text-[9px] text-slate-400 font-sans border-t border-slate-100 pt-2">
                Documento gerado pelo TIOSYSTEM • Rede Integrada de Proteção Social • Currais Novos/RN
              </div>
            </div>
          ) : (
            /* Annexes Page Viewer */
            <div className="space-y-6">
              {oficio.anexos?.map((anexo, idx) => (
                <div key={anexo.id} className="w-[210mm] min-h-[297mm] bg-white text-black p-[20mm] shadow-2xl rounded-sm border border-slate-300 relative select-text font-serif leading-relaxed">
                  
                  {/* Repeated Header on Every Annex Page */}
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-2">
                      <img 
                        src={CONSELHO_TUTELAR_OFICIAL_LOGO_DATA_URL} 
                        alt="Conselho Tutelar" 
                        className="h-14 max-w-[140px] object-contain"
                      />
                    </div>
                    <h1 className="font-serif font-bold text-[13pt] text-black uppercase leading-tight">
                      CONSELHO TUTELAR DOS DIREITOS
                    </h1>
                    <h2 className="font-serif font-bold text-[10.5pt] text-black uppercase leading-tight mt-0.5">
                      DA CRIANÇA E DO ADOLESCENTE LEI FEDERAL Nº 8.069/90 – LEI FEDERAL 8.069/90
                    </h2>
                    <div className="w-full border-b-[1.5px] border-black mt-2.5 mb-5" />
                  </div>

                  <div className="text-center mb-6">
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded uppercase tracking-wider border border-slate-200">
                      Anexo Oficial #{idx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">
                      {anexo.nome}
                    </h3>
                    {anexo.descricao && (
                      <p className="text-sm text-slate-600 mt-1 max-w-lg mx-auto">
                        {anexo.descricao}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-center items-center my-6">
                    {anexo.url ? (
                      <img 
                        src={anexo.url} 
                        alt={anexo.nome} 
                        className="max-w-[95%] max-h-[190mm] object-contain border border-slate-200 rounded shadow-sm"
                      />
                    ) : (
                      <div className="w-full py-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400">
                        <FileText size={48} className="stroke-1 text-slate-300 mb-2" />
                        <span className="font-sans font-bold text-sm text-slate-600">Documento Comprobatório Digitalizado</span>
                        <span className="font-sans text-xs text-slate-400 mt-1">Conforme arquivado no processo físico</span>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-6 right-6 text-center text-[9px] text-slate-400 font-sans border-t border-slate-100 pt-2">
                    Anexo ao {oficio.numeroFormatado} • Conselho Tutelar de Currais Novos/RN
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom informational bar */}
      <div className="bg-slate-900 border-t border-slate-800 text-slate-400 px-6 py-2.5 text-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Padrão A4 Oficial com Repetição de Cabeçalho • Lei Federal nº 8.069/90 (ECA)</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{oficio.paragrafos.length} parágrafos</span>
          <span>•</span>
          <span>{oficio.conselheiros.filter(c => c.linhaAssinatura).length} assinaturas</span>
        </div>
      </div>

    </div>
  );
}
