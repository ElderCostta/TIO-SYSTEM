import React from "react";
import ReactMarkdown from "react-markdown";
import { FileText, Copy, Check, X, Printer, Edit3, Eye, Save } from "lucide-react";

interface AtaEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMarkdown: string;
  onSave: (newMarkdown: string) => void;
  readOnly: boolean;
  title?: string;
}

export default function AtaEditorModal({
  isOpen,
  onClose,
  initialMarkdown,
  onSave,
  readOnly,
  title = "Ata de Reunião Intersetorial"
}: AtaEditorModalProps) {
  const [markdown, setMarkdown] = React.useState(initialMarkdown);
  const [activeTab, setActiveTab] = React.useState<"preview" | "edit">("preview");
  const [copied, setCopied] = React.useState(false);

  // Sync markdown with initialMarkdown when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setMarkdown(initialMarkdown);
      setActiveTab(readOnly ? "preview" : "edit");
    }
  }, [isOpen, initialMarkdown, readOnly]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      // Style the printed page to look clean and professional
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              body {
                font-family: 'Inter', sans-serif;
                line-height: 1.6;
                color: #1e293b;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              h1 {
                font-size: 24px;
                font-weight: 700;
                text-align: center;
                text-transform: uppercase;
                margin-bottom: 30px;
                border-bottom: 2px solid #0f172a;
                padding-bottom: 12px;
              }
              h2 {
                font-size: 18px;
                font-weight: 700;
                margin-top: 24px;
                margin-bottom: 12px;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 6px;
                color: #0f172a;
              }
              h3 {
                font-size: 14px;
                font-weight: 700;
                margin-top: 16px;
                margin-bottom: 8px;
                color: #334155;
              }
              p, li {
                font-size: 13px;
                color: #334155;
              }
              ul {
                padding-left: 20px;
                margin-bottom: 16px;
              }
              li {
                margin-bottom: 6px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              th, td {
                border: 1px solid #cbd5e1;
                padding: 8px 12px;
                text-align: left;
                font-size: 12px;
              }
              th {
                background-color: #f8fafc;
                font-weight: 600;
                color: #0f172a;
              }
              hr {
                border: 0;
                border-top: 1px dashed #cbd5e1;
                margin: 24px 0;
              }
              .signatures {
                margin-top: 40px;
              }
              .signature-block {
                margin-bottom: 24px;
                page-break-inside: avoid;
              }
            </style>
          </head>
          <body>
            <div>${markdown.replace(/\n/g, "<br>")}</div>
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleSave = () => {
    onSave(markdown);
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
        <div className="flex-1 overflow-y-auto p-6 font-sans bg-slate-50/30">
          {activeTab === "edit" && !readOnly ? (
            <div className="h-full flex flex-col space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Editor de Texto em Markdown (Edite livremente as lacunas):
              </label>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="w-full flex-1 min-h-[45vh] p-4 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-mono focus:outline-none transition-all resize-none leading-relaxed"
                placeholder="Insira o texto da ata..."
                id="ata-markdown-editor-textarea"
              />
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm prose prose-indigo max-w-none text-slate-800">
              <div className="markdown-body select-text text-sm leading-relaxed space-y-4">
                <ReactMarkdown>{markdown}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="text-xs text-gray-400 font-mono">
            {activeTab === "edit" ? "Modo de edição ativo" : "Pronto para cópia ou assinatura"}
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
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer"
                id="btn-save-editor-ata"
              >
                <Save size={16} />
                <span>Salvar Documento</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
