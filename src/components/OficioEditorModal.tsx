import React, { useState } from "react";
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  Check, 
  FileText, 
  Calendar, 
  Building2, 
  User, 
  MapPin, 
  Printer, 
  Eye, 
  Paperclip, 
  ShieldCheck, 
  Copy, 
  AlertCircle,
  Wand2
} from "lucide-react";
import { Oficio, OficioCounselor, OficioAnexo, Case } from "../types";
import { 
  getOficioHeaderHtml, 
  formatDataPorExtenso, 
  CONSELHO_TUTELAR_OFICIAL_LOGO_DATA_URL 
} from "../utils/oficioUtils";
import { correctPortugueseText } from "../utils/textCorrector";
import { DEFAULT_CONSELHEIROS } from "../data/oficioTemplates";

interface OficioEditorModalProps {
  initialOficio?: Oficio | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (oficio: Oficio) => void;
  cases?: Case[];
}

export default function OficioEditorModal({
  initialOficio,
  isOpen,
  onClose,
  onSave,
  cases = []
}: OficioEditorModalProps) {
  // Estado local do ofício
  const [formData, setFormData] = useState<Oficio>(() => {
    if (initialOficio) return { ...initialOficio };
    return {
      id: `oficio-${Date.now()}`,
      numero: "110",
      ano: new Date().getFullYear().toString(),
      numeroFormatado: `Ofício CT Nº 110/${new Date().getFullYear()}`,
      dataEmissao: new Date().toISOString().split("T")[0],
      cidade: "Currais Novos",
      uf: "RN",
      tratamentoDestinatario: "A Excelentíssima Sra.",
      nomeDestinatario: "",
      cargoDestinatario: "",
      enderecoDestinatario: "",
      assunto: "Informações referente ao procedimento",
      numeroProcedimento: "",
      saudacao: "Excelentíssima Senhora",
      paragrafos: [
        "Cumprimentando-a cordialmente, sirvo-me do presente para prestar informações atualizadas acerca do acompanhamento..."
      ],
      encerramento: "Sendo o que havia a informar no momento, colocamo-nos à disposição para os esclarecimentos que se fizerem necessários.",
      fecho: "Atenciosamente,",
      conselheiros: DEFAULT_CONSELHEIROS,
      dataEncerramento: `Currais Novos, ${formatDataPorExtenso(new Date().toISOString().split("T")[0])}`,
      anexos: [],
      status: "Rascunho",
      dataCriacao: new Date().toISOString(),
      criadoPor: "Conselho Tutelar",
      orgaoEmissor: "Conselho Tutelar dos Direitos da Criança e do Adolescente"
    };
  });

  const [activeTab, setActiveTab] = useState<"destinatario" | "paragrafos" | "assinaturas" | "anexos">("destinatario");
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(formData.casoVinculadoId || "");
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Atualizador genérico
  const updateField = (field: keyof Oficio, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === "numero" || field === "ano") {
        updated.numeroFormatado = `Ofício CT Nº ${updated.numero}/${updated.ano}`;
      }
      if (field === "dataEmissao" || field === "cidade") {
        updated.dataEncerramento = `${updated.cidade}, ${formatDataPorExtenso(updated.dataEmissao)}`;
      }
      return updated;
    });
  };

  // Gerenciamento de Parágrafos
  const handleAddParagraph = () => {
    setFormData(prev => ({
      ...prev,
      paragrafos: [...prev.paragrafos, ""]
    }));
  };

  const handleUpdateParagraph = (index: number, text: string) => {
    setFormData(prev => {
      const next = [...prev.paragrafos];
      next[index] = text;
      return { ...prev, paragrafos: next };
    });
  };

  const handleDeleteParagraph = (index: number) => {
    if (formData.paragrafos.length <= 1) {
      alert("O ofício deve conter pelo menos um parágrafo.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      paragrafos: prev.paragrafos.filter((_, i) => i !== index)
    }));
  };

  const handleMoveParagraph = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.paragrafos.length) return;
    setFormData(prev => {
      const next = [...prev.paragrafos];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return { ...prev, paragrafos: next };
    });
  };

  // Inserir modelo de parágrafo legal fundamentado no ECA
  const handleInsertEcaBasis = (artigo: "art136" | "educacao" | "saude" | "creas") => {
    let texto = "";
    if (artigo === "art136") {
      texto = "Ressalta-se que este órgão de proteção, no exercício de suas atribuições legais, especialmente aquelas previstas no artigo 136 do Estatuto da Criança e do Adolescente (Lei Federal nº 8.069/1990), realizou requisições de serviços e articulações junto aos equipamentos que compõem a rede intersetorial de proteção integral.";
    } else if (artigo === "educacao") {
      texto = "No que se refere ao acompanhamento educacional, conforme relatório encaminhado pela unidade de ensino na qual a criança está matriculada, constatou-se a necessidade de suporte pedagógico continuado e fortalecimento da frequência escolar, com vistas a assegurar o pleno desenvolvimento integral.";
    } else if (artigo === "saude") {
      texto = "Em relação à saúde da criança, conforme dados repassados pela Unidade Básica de Saúde (UBS) de referência, reitera-se a imprescindibilidade da atualização da caderneta de vacinação, do acompanhamento do crescimento e desenvolvimento (CeD) e dos cuidados odontológicos periódicos.";
    } else if (artigo === "creas") {
      texto = "Evidencia-se a necessidade de intervenção sistemática do Centro de Referência Especializado de Assistência Social (CREAS), mediante avaliação técnica da situação familiar, elaboração de plano de acompanhamento socioassistencial e definição de estratégias voltadas à superação das vulnerabilidades identificadas.";
    }

    setFormData(prev => ({
      ...prev,
      paragrafos: [...prev.paragrafos, texto]
    }));
    showNotice("Parágrafo com fundamentação jurídica inserido com sucesso!");
  };

  // Correção ortográfica de todos os parágrafos
  const handleCorrectAllText = () => {
    let fixesCount = 0;
    const novosParagrafos = formData.paragrafos.map(p => {
      const res = correctPortugueseText(p);
      fixesCount += res.totalFixes;
      return res.correctedText;
    });

    const resEnc = correctPortugueseText(formData.encerramento);
    fixesCount += resEnc.totalFixes;

    setFormData(prev => ({
      ...prev,
      paragrafos: novosParagrafos,
      encerramento: resEnc.correctedText
    }));

    showNotice(`Texto revisado! ${fixesCount} correções ortográficas e administrativas aplicadas.`);
  };

  // Assinaturas dos Conselheiros
  const handleToggleConselheiro = (index: number) => {
    setFormData(prev => {
      const next = [...prev.conselheiros];
      next[index] = { ...next[index], linhaAssinatura: !next[index].linhaAssinatura };
      return { ...prev, conselheiros: next };
    });
  };

  const handleUpdateConselheiroNome = (index: number, nome: string) => {
    setFormData(prev => {
      const next = [...prev.conselheiros];
      next[index] = { ...next[index], nome };
      return { ...prev, conselheiros: next };
    });
  };

  const handleAddConselheiroSlot = () => {
    setFormData(prev => ({
      ...prev,
      conselheiros: [
        ...prev.conselheiros,
        {
          id: `c_${Date.now()}`,
          nome: "",
          cargo: "Conselheiro (a) tutelar",
          matricula: "",
          linhaAssinatura: true
        }
      ]
    }));
  };

  // Anexos
  const handleAddAnexo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const novoAnexo: OficioAnexo = {
        id: `anx-${Date.now()}`,
        nome: file.name.replace(/\.[^/.]+$/, ""),
        descricao: "Documento anexo comprobatório digitalizado",
        url: reader.result as string,
        tipo: file.type.includes("image") ? "foto" : "documento",
        dataUpload: new Date().toISOString().split("T")[0]
      };

      setFormData(prev => ({
        ...prev,
        anexos: [...(prev.anexos || []), novoAnexo]
      }));
      showNotice(`Anexo "${file.name}" adicionado com sucesso!`);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAnexo = (id: string) => {
    setFormData(prev => ({
      ...prev,
      anexos: (prev.anexos || []).filter(a => a.id !== id)
    }));
  };

  // Vincular a caso existente no TIOSYSTEM
  const handleLinkCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    if (!caseId) {
      updateField("casoVinculadoId", undefined);
      updateField("casoNome", undefined);
      return;
    }
    const c = cases.find(item => item.id === caseId);
    if (c) {
      setFormData(prev => ({
        ...prev,
        casoVinculadoId: c.id,
        casoNome: c.name,
        assunto: prev.assunto || `Acompanhamento da criança/adolescente ${c.name}`
      }));
      showNotice(`Ofício vinculado ao caso de ${c.name}!`);
    }
  };

  const showNotice = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.numero) {
      alert("Por favor, informe o número do ofício.");
      return;
    }
    if (!formData.nomeDestinatario) {
      alert("Por favor, preencha o nome do destinatário.");
      return;
    }

    onSave({
      ...formData,
      atualizadoEm: new Date().toISOString()
    });
  };

  const dataFormatada = formatDataPorExtenso(formData.dataEmissao);
  const dataFinalTexto = formData.dataEncerramento || `${formData.cidade}, ${dataFormatada}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      
      <div className="bg-white w-full max-w-7xl h-[95vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Editor de Ofício Oficial
                </h2>
                <span className="text-xs bg-slate-800 text-emerald-400 font-bold px-2.5 py-0.5 rounded-lg border border-slate-700">
                  {formData.numeroFormatado}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Padrão Institucional do Conselho Tutelar (Lei Federal nº 8.069/90)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowLivePreview(!showLivePreview)}
              className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                showLivePreview ? "bg-slate-800 text-emerald-400 border border-emerald-500/40" : "bg-slate-800 text-slate-300"
              }`}
            >
              <Eye size={15} />
              <span>{showLivePreview ? "Ocultar Prévia A4" : "Ver Prévia A4"}</span>
            </button>

            <button
              type="button"
              onClick={handleCorrectAllText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-bold rounded-xl border border-indigo-500/40 transition"
              title="Corrigir pontuação e termos jurídicos"
            >
              <Wand2 size={14} />
              <span className="hidden sm:inline">Revisar Texto</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-md transition"
            >
              <Save size={16} />
              <span>Salvar Ofício</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition ml-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Floating Notification */}
        {notificationMsg && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top">
            <Check size={14} />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* Main Workspace (Split Form + Live A4 Preview) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Pane: Interactive Form */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50/60 p-4 sm:p-6 border-r border-slate-200">
            
            {/* Step Navigation Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 mb-6 shrink-0 shadow-sm">
              {[
                { id: "destinatario", label: "1. Destinatário & Numeração", icon: Building2 },
                { id: "paragrafos", label: "2. Texto & Parágrafos", icon: FileText },
                { id: "assinaturas", label: "3. Assinaturas", icon: User },
                { id: "anexos", label: `4. Anexos (${formData.anexos?.length || 0})`, icon: Paperclip },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all ${
                      isActive 
                        ? "bg-emerald-600 text-white shadow-sm" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={15} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: Destinatário & Numeração */}
            {activeTab === "destinatario" && (
              <div className="space-y-6">
                
                {/* Numeração e Emissão */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Identificação & Data Oficial
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Número do Ofício *
                      </label>
                      <input
                        type="text"
                        value={formData.numero}
                        onChange={e => updateField("numero", e.target.value)}
                        placeholder="Ex: 110"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:bg-white focus:outline-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ano
                      </label>
                      <input
                        type="text"
                        value={formData.ano}
                        onChange={e => updateField("ano", e.target.value)}
                        placeholder="Ex: 2026"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:bg-white focus:outline-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Data de Emissão *
                      </label>
                      <input
                        type="date"
                        value={formData.dataEmissao}
                        onChange={e => updateField("dataEmissao", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:bg-white focus:outline-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Município de Origem
                      </label>
                      <input
                        type="text"
                        value={formData.cidade}
                        onChange={e => updateField("cidade", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        UF
                      </label>
                      <input
                        type="text"
                        value={formData.uf}
                        onChange={e => updateField("uf", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between">
                    <span>Resultado no Cabeçalho:</span>
                    <span className="font-bold">{formData.numeroFormatado} • {formData.cidade}/{formData.uf}, {dataFormatada}</span>
                  </div>
                </div>

                {/* Destinatário */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Identificação do Destinatário
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pronome de Tratamento
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.tratamentoDestinatario}
                        onChange={e => updateField("tratamentoDestinatario", e.target.value)}
                        className="w-full sm:w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-emerald-500 font-medium"
                      >
                        <option value="A Excelentíssima Sra.">A Excelentíssima Sra.</option>
                        <option value="Ao Excelentíssimo Sr.">Ao Excelentíssimo Sr.</option>
                        <option value="À Ilustríssima Sra.">À Ilustríssima Sra.</option>
                        <option value="Ao Ilustríssimo Sr.">Ao Ilustríssimo Sr.</option>
                        <option value="À Sua Excelência">À Sua Excelência</option>
                        <option value="Ao Digníssimo Sr.">Ao Digníssimo Sr.</option>
                      </select>
                      <input
                        type="text"
                        value={formData.tratamentoDestinatario}
                        onChange={e => updateField("tratamentoDestinatario", e.target.value)}
                        placeholder="Ou digite tratamento personalizado"
                        className="hidden sm:block flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nome da Autoridade / Destinatário *
                    </label>
                    <input
                      type="text"
                      value={formData.nomeDestinatario}
                      onChange={e => updateField("nomeDestinatario", e.target.value)}
                      placeholder="Ex: Bela Fladja Raiane Soares de Souza."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:bg-white focus:outline-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cargo / Órgão do Destinatário *
                    </label>
                    <input
                      type="text"
                      value={formData.cargoDestinatario}
                      onChange={e => updateField("cargoDestinatario", e.target.value)}
                      placeholder="Ex: 2º Promotora de Justiça da Comarca de Currais Novos"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Endereço Completo do Destinatário
                    </label>
                    <input
                      type="text"
                      value={formData.enderecoDestinatario}
                      onChange={e => updateField("enderecoDestinatario", e.target.value)}
                      placeholder="Ex: Rua: Zuza Othon nº 1150, Valfredo Galvão- Currais Novos/RN"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-emerald-500"
                    />
                  </div>
                </div>

                {/* Assunto & Procedimento */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Assunto & Número de Procedimento
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Descrição do Assunto
                    </label>
                    <input
                      type="text"
                      value={formData.assunto}
                      onChange={e => updateField("assunto", e.target.value)}
                      placeholder="Ex: Informações referente ao procedimento"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:bg-white focus:outline-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Número do Procedimento / Processo (quando houver)
                    </label>
                    <input
                      type="text"
                      value={formData.numeroProcedimento || ""}
                      onChange={e => updateField("numeroProcedimento", e.target.value)}
                      placeholder="Ex: 33.23.2001.0000093/2026-23"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-800 focus:bg-white focus:outline-emerald-500"
                    />
                  </div>

                  {cases.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Vincular a Caso Cadastrado no TIOSYSTEM (Opcional):
                      </label>
                      <select
                        value={selectedCaseId}
                        onChange={e => handleLinkCase(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium"
                      >
                        <option value="">Nenhum caso vinculado</option>
                        {cases.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.id}) - {c.situation?.slice(0, 40)}...
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: Parágrafos & Conteúdo */}
            {activeTab === "paragrafos" && (
              <div className="space-y-6">
                
                {/* Saudação */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Saudação Formal (Vocativo)
                    </span>
                    <span className="text-[10px] text-slate-400">Exibido centralizado no documento</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.saudacao}
                      onChange={e => updateField("saudacao", e.target.value)}
                      placeholder="Ex: Excelentíssima Senhora"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:bg-white focus:outline-emerald-500"
                    />
                    <select
                      onChange={e => updateField("saudacao", e.target.value)}
                      className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600"
                    >
                      <option value="">Opções rápidas</option>
                      <option value="Excelentíssima Senhora">Excelentíssima Senhora</option>
                      <option value="Excelentíssimo Senhor">Excelentíssimo Senhor</option>
                      <option value="Senhora Promotora">Senhora Promotora</option>
                      <option value="Senhor Promotor">Senhor Promotor</option>
                      <option value="Ilustríssimo(a) Senhor(a)">Ilustríssimo(a) Senhor(a)</option>
                      <option value="Prezado(a) Senhor(a)">Prezado(a) Senhor(a)</option>
                    </select>
                  </div>
                </div>

                {/* Fundamentação e Ações Rápidas */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-emerald-700" />
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                      Inserir Fundamentação Rápida do ECA:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleInsertEcaBasis("art136")}
                      className="text-[11px] font-bold bg-white text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-600 hover:text-white transition shadow-sm"
                    >
                      + Art. 136 (Atribuições)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertEcaBasis("educacao")}
                      className="text-[11px] font-bold bg-white text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-600 hover:text-white transition shadow-sm"
                    >
                      + CMEI/Educação
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertEcaBasis("saude")}
                      className="text-[11px] font-bold bg-white text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-600 hover:text-white transition shadow-sm"
                    >
                      + UBS/Saúde Bucal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertEcaBasis("creas")}
                      className="text-[11px] font-bold bg-white text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-600 hover:text-white transition shadow-sm"
                    >
                      + CREAS/Vulnerabilidade
                    </button>
                  </div>
                </div>

                {/* Lista de Parágrafos */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Parágrafos do Ofício ({formData.paragrafos.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddParagraph}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition"
                    >
                      <Plus size={15} />
                      <span>Adicionar Parágrafo</span>
                    </button>
                  </div>

                  {formData.paragrafos.map((paragrafo, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-500">
                          § Parágrafo {idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveParagraph(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                            title="Mover para cima"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveParagraph(idx, "down")}
                            disabled={idx === formData.paragrafos.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                            title="Mover para baixo"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteParagraph(idx)}
                            className="p-1 text-rose-500 hover:text-rose-700 rounded ml-2"
                            title="Remover parágrafo"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={4}
                        value={paragrafo}
                        onChange={e => handleUpdateParagraph(idx, e.target.value)}
                        placeholder={`Digite o texto do parágrafo ${idx + 1}...`}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 leading-relaxed focus:bg-white focus:outline-emerald-500"
                      />
                    </div>
                  ))}

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleAddParagraph}
                      className="w-full py-3 border-2 border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Plus size={16} />
                      <span>Inserir Novo Parágrafo</span>
                    </button>
                  </div>
                </div>

                {/* Encerramento e Fecho */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Encerramento & Fecho Formal
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Parágrafo de Encerramento
                    </label>
                    <textarea
                      rows={2}
                      value={formData.encerramento}
                      onChange={e => updateField("encerramento", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:bg-white focus:outline-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Fecho Formal de Cortesia
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.fecho}
                        onChange={e => updateField("fecho", e.target.value)}
                        className="w-full sm:w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:bg-white"
                      >
                        <option value="Atenciosamente,">Atenciosamente,</option>
                        <option value="Respeitosamente,">Respeitosamente,</option>
                        <option value="Cordialmente,">Cordialmente,</option>
                      </select>
                      <input
                        type="text"
                        value={formData.fecho}
                        onChange={e => updateField("fecho", e.target.value)}
                        className="hidden sm:block flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: Assinaturas */}
            {activeTab === "assinaturas" && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                        Assinaturas dos Conselheiros Tutelares
                      </span>
                      <span className="text-xs text-slate-400">
                        Selecione as linhas de assinatura ativas na grade formal do ofício
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddConselheiroSlot}
                      className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition"
                    >
                      + Novo Conselheiro
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formData.conselheiros.map((conselheiro, idx) => (
                      <div 
                        key={conselheiro.id} 
                        className={`p-4 rounded-2xl border transition ${
                          conselheiro.linhaAssinatura 
                            ? "bg-emerald-50/40 border-emerald-300 shadow-sm" 
                            : "bg-slate-50 border-slate-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={conselheiro.linhaAssinatura}
                              onChange={() => handleToggleConselheiro(idx)}
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                            />
                            <span className="text-xs font-extrabold text-slate-800">
                              Assinatura #{idx + 1}
                            </span>
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {conselheiro.cargo}
                          </span>
                        </div>

                        <div className="space-y-2 mt-3">
                          <div>
                            <input
                              type="text"
                              value={conselheiro.nome}
                              onChange={e => handleUpdateConselheiroNome(idx, e.target.value)}
                              placeholder="Nome do(a) Conselheiro(a) (opcional)"
                              disabled={!conselheiro.linhaAssinatura}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-emerald-500"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={conselheiro.cargo}
                              onChange={e => {
                                const next = [...formData.conselheiros];
                                next[idx] = { ...next[idx], cargo: e.target.value };
                                updateField("conselheiros", next);
                              }}
                              placeholder="Cargo"
                              disabled={!conselheiro.linhaAssinatura}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 focus:outline-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Data e Município de Encerramento (Rodapé da Assinatura)
                    </label>
                    <input
                      type="text"
                      value={formData.dataEncerramento || ""}
                      onChange={e => updateField("dataEncerramento", e.target.value)}
                      placeholder="Ex: Currais Novos, 19 de outubro 2026"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white font-medium"
                    />
                  </div>
                </div>

                {/* Status do Ofício */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    Status do Documento
                  </span>
                  <div className="flex gap-2">
                    {(["Rascunho", "Emitido", "Protocolado", "Arquivado"] as const).map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateField("status", st)}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition ${
                          formData.status === st 
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: Anexos */}
            {activeTab === "anexos" && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                        Anexos Comprobatórios Digitalizados
                      </span>
                      <span className="text-xs text-slate-400">
                        Documentos, relatórios da UBS, laudos do CAPS e fichas do CMEI com cabeçalho institucional repetido
                      </span>
                    </div>

                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition">
                      <Plus size={15} />
                      <span>Anexar Arquivo</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleAddAnexo}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {formData.anexos && formData.anexos.length > 0 ? (
                    <div className="space-y-3">
                      {formData.anexos.map((anexo, idx) => (
                        <div key={anexo.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="text-xs font-extrabold text-slate-800">{anexo.nome}</div>
                              <div className="text-[11px] text-slate-500">{anexo.descricao || "Sem descrição"}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {anexo.url && (
                              <img src={anexo.url} alt="thumb" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteAnexo(anexo.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                      <Paperclip size={36} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-600">Nenhum anexo digitalizado inserido.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Você pode anexar relatórios de escolas, unidades de saúde ou comprovantes físicos.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Pane: Live A4 Sheet Preview */}
          {showLivePreview && (
            <div className="hidden lg:flex flex-1 flex-col overflow-y-auto bg-slate-800 p-6 items-center border-l border-slate-700 select-text">
              <div className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Eye size={14} className="text-emerald-400" />
                <span>Prévia A4 em Tempo Real</span>
              </div>

              {/* Exact A4 Sheet Preview */}
              <div className="w-[185mm] min-h-[260mm] bg-white text-black p-[15mm] shadow-2xl rounded-sm border border-slate-400 relative font-serif text-[11pt] leading-[1.45] select-text">
                
                {/* Header */}
                <div className="text-center mb-5">
                  <div className="flex justify-center mb-1.5">
                    <img 
                      src={CONSELHO_TUTELAR_OFICIAL_LOGO_DATA_URL} 
                      alt="Conselho Tutelar" 
                      className="h-14 max-w-[130px] object-contain"
                    />
                  </div>
                  <h1 className="font-serif font-bold text-[12pt] text-black uppercase leading-tight">
                    CONSELHO TUTELAR DOS DIREITOS
                  </h1>
                  <h2 className="font-serif font-bold text-[10pt] text-black uppercase leading-tight mt-0.5">
                    DA CRIANÇA E DO ADOLESCENTE LEI FEDERAL Nº 8.069/90 – LEI FEDERAL 8.069/90
                  </h2>
                  <div className="w-full border-b-[1.5px] border-black mt-2 mb-4" />
                </div>

                {/* Number & Date */}
                <div className="flex justify-between items-baseline mb-4 text-[10.5pt]">
                  <div className="font-bold">
                    {formData.numeroFormatado}
                  </div>
                  <div>
                    {formData.cidade}/{formData.uf}, {dataFormatada}.
                  </div>
                </div>

                {/* Recipient */}
                <div className="mb-4 text-[10.5pt] leading-snug">
                  <div>{formData.tratamentoDestinatario}</div>
                  <div className="font-bold">{formData.nomeDestinatario || "Nome do Destinatário"}</div>
                  <div>{formData.cargoDestinatario || "Cargo / Órgão"}</div>
                  <div>{formData.enderecoDestinatario || "Endereço"}</div>
                </div>

                {/* Subject */}
                <div className="mb-4 text-[10.5pt]">
                  <span>Assunto: {formData.assunto}</span>
                  {formData.numeroProcedimento && (
                    <span> de nº <strong>{formData.numeroProcedimento}</strong></span>
                  )}
                </div>

                {/* Greeting */}
                <div className="text-center my-4 text-[11pt]">
                  {formData.saudacao}
                </div>

                {/* Paragraphs */}
                <div className="space-y-2.5 text-justify text-[11pt] leading-[1.45]">
                  {formData.paragrafos.map((p, i) => (
                    <p key={i} className="indent-[2cm] m-0 text-justify">
                      {p || "..."}
                    </p>
                  ))}
                </div>

                {/* Encerramento */}
                <div className="indent-[2cm] text-justify mt-4 text-[11pt] leading-[1.45]">
                  {formData.encerramento}
                </div>

                {/* Fecho */}
                <div className="text-center my-5 text-[11pt]">
                  {formData.fecho}
                </div>

                {/* Signature Grid */}
                <div className="mt-6 mb-4">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-6 text-center">
                    {formData.conselheiros.filter(c => c.linhaAssinatura).map(c => (
                      <div key={c.id} className="flex flex-col items-center">
                        <div className="w-4/5 border-b border-black mb-1" />
                        <div className="text-[10pt] text-black">{c.cargo || "Conselheiro (a) tutelar"}</div>
                        {c.nome && <div className="text-[10pt] font-bold text-black">{c.nome}</div>}
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-8 text-[10.5pt]">
                    {dataFinalTexto}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
