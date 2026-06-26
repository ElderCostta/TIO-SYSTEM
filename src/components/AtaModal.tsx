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

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ata de Reunião Intersetorial</title>
            <style>
              body {
                font-family: 'Inter', sans-serif;
                line-height: 1.6;
                color: #333;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              h1, h2, h3 {
                color: #111;
                border-bottom: 1px solid #ddd;
                padding-bottom: 8px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 10px;
                text-align: left;
              }
              th {
                background-color: #f5f5f5;
              }
              .no-print {
                display: none;
              }
            </style>
          </head>
          <body>
            <div>${markdown.replace(/\n/g, "<br>")}</div>
            <script>
              window.print();
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
