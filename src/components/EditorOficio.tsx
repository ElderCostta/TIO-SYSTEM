import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Plus, 
  Search, 
  Printer, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Calendar, 
  Building2, 
  User, 
  Filter, 
  Eye, 
  Paperclip, 
  Database, 
  Shield, 
  RefreshCw,
  Sparkles,
  Send,
  ExternalLink,
  X
} from "lucide-react";
import { Oficio, UserSession, Case } from "../types";
import { MODELO_OFICIAL_ANEXO, TEMPLATES_OFICIO } from "../data/oficioTemplates";
import { formatDataPorExtenso } from "../utils/oficioUtils";
import OficioEditorModal from "./OficioEditorModal";
import OficioPreviewModal from "./OficioPreviewModal";

import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "../firebase";

interface EditorOficioProps {
  activeSession: UserSession;
  cases?: Case[];
}

export default function EditorOficio({
  activeSession,
  cases = []
}: EditorOficioProps) {
  // Lista de ofícios salvos (inicia vazio sem rascunho de exemplo)
  const [oficios, setOficios] = useState<Oficio[]>(() => {
    try {
      const saved = localStorage.getItem("tiosystem_oficios");
      if (saved) {
        const parsed: Oficio[] = JSON.parse(saved);
        // Remove qualquer rascunho de exemplo antigo que possa ter ficado no cache
        return parsed.filter(o => o.id !== "oficio-ct-110-2026");
      }
    } catch (e) {
      console.warn("Erro ao carregar ofícios locais:", e);
    }
    return [];
  });

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [anoFilter, setAnoFilter] = useState<string>("todos");

  // Modais
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingOficio, setEditingOficio] = useState<Oficio | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewOficio, setPreviewOficio] = useState<Oficio | null>(null);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [firestoreSyncStatus, setFirestoreSyncStatus] = useState<"conectado" | "offline" | "sincronizando">("sincronizando");
  const [notification, setNotification] = useState<string | null>(null);

  // 1. Sincronização em tempo real com o Firestore
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    try {
      const oficiosCol = collection(db, "oficios");
      unsubscribe = onSnapshot(
        oficiosCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteDocs: Oficio[] = [];
            snapshot.forEach((d) => {
              if (d.id === "oficio-ct-110-2026") {
                // Remove rascunho de exemplo caso ainda persista
                deleteFromFirestore("oficio-ct-110-2026");
              } else {
                remoteDocs.push(d.data() as Oficio);
              }
            });
            // Ordenar por data ou número
            remoteDocs.sort((a, b) => (b.dataEmissao || "").localeCompare(a.dataEmissao || ""));
            setOficios(remoteDocs);
            localStorage.setItem("tiosystem_oficios", JSON.stringify(remoteDocs));
            setFirestoreSyncStatus("conectado");
          } else {
            setOficios([]);
            localStorage.setItem("tiosystem_oficios", JSON.stringify([]));
            setFirestoreSyncStatus("conectado");
          }
        },
        (error) => {
          console.warn("Firestore oficios snapshot listener offline/fallback:", error);
          setFirestoreSyncStatus("offline");
        }
      );
    } catch (err) {
      console.warn("Erro ao conectar Firestore:", err);
      setFirestoreSyncStatus("offline");
    }

    return () => unsubscribe();
  }, []);

  // Salvar no Firestore e localStorage
  const saveToFirestore = async (oficio: Oficio) => {
    try {
      const docRef = doc(db, "oficios", oficio.id);
      await setDoc(docRef, oficio, { merge: true });
    } catch (err) {
      console.warn("Aviso ao salvar no Firestore (mantido localmente):", err);
    }
  };

  const deleteFromFirestore = async (id: string) => {
    try {
      const docRef = doc(db, "oficios", id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn("Aviso ao remover do Firestore:", err);
    }
  };

  // Handlers
  const handleSaveOficio = (oficio: Oficio) => {
    const exists = oficios.some(o => o.id === oficio.id);
    let nextOficios: Oficio[];

    if (exists) {
      nextOficios = oficios.map(o => o.id === oficio.id ? oficio : o);
    } else {
      nextOficios = [oficio, ...oficios];
    }

    setOficios(nextOficios);
    localStorage.setItem("tiosystem_oficios", JSON.stringify(nextOficios));
    saveToFirestore(oficio);

    setIsEditorOpen(false);
    setEditingOficio(null);
    showNotice(`Ofício ${oficio.numeroFormatado} salvo com sucesso!`);
  };

  const handleDeleteOficio = (id: string, numFormatado: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o ${numFormatado}?`)) return;
    const next = oficios.filter(o => o.id !== id);
    setOficios(next);
    localStorage.setItem("tiosystem_oficios", JSON.stringify(next));
    deleteFromFirestore(id);
    showNotice(`Ofício removido com sucesso.`);
  };

  const handleDuplicateOficio = (orig: Oficio) => {
    const nextNum = (parseInt(orig.numero, 10) || oficios.length) + 1;
    const duplicated: Oficio = {
      ...orig,
      id: `oficio-${Date.now()}`,
      numero: String(nextNum),
      numeroFormatado: `Ofício CT Nº ${nextNum}/${orig.ano}`,
      dataEmissao: new Date().toISOString().split("T")[0],
      status: "Rascunho",
      dataCriacao: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };

    const next = [duplicated, ...oficios];
    setOficios(next);
    localStorage.setItem("tiosystem_oficios", JSON.stringify(next));
    saveToFirestore(duplicated);
    showNotice(`Cópia criada: ${duplicated.numeroFormatado}`);
  };

  const handleSelectTemplate = (templateDados: Partial<Oficio>) => {
    const proximoNumero = oficios.length > 0
      ? (Math.max(...oficios.map(o => parseInt(o.numero, 10) || 0)) + 1).toString()
      : "110";

    const novoOficio: Oficio = {
      ...MODELO_OFICIAL_ANEXO,
      ...templateDados,
      id: `oficio-${Date.now()}`,
      numero: proximoNumero,
      ano: new Date().getFullYear().toString(),
      numeroFormatado: `Ofício CT Nº ${proximoNumero}/${new Date().getFullYear()}`,
      dataEmissao: new Date().toISOString().split("T")[0],
      dataCriacao: new Date().toISOString(),
      status: "Rascunho"
    } as Oficio;

    setIsTemplateModalOpen(false);
    setEditingOficio(novoOficio);
    setIsEditorOpen(true);
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filtragem
  const filteredOficios = oficios.filter(o => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
      (o.numeroFormatado && o.numeroFormatado.toLowerCase().includes(searchLower)) ||
      (o.nomeDestinatario && o.nomeDestinatario.toLowerCase().includes(searchLower)) ||
      (o.cargoDestinatario && o.cargoDestinatario.toLowerCase().includes(searchLower)) ||
      (o.assunto && o.assunto.toLowerCase().includes(searchLower)) ||
      (o.numeroProcedimento && o.numeroProcedimento.toLowerCase().includes(searchLower)) ||
      (o.casoNome && o.casoNome.toLowerCase().includes(searchLower));

    const matchStatus = statusFilter === "todos" || o.status === statusFilter;
    const matchAno = anoFilter === "todos" || o.ano === anoFilter;

    return matchSearch && matchStatus && matchAno;
  });

  // Métricas
  const totalOficios = oficios.length;
  const emitidosCount = oficios.filter(o => o.status === "Emitido").length;
  const rascunhosCount = oficios.filter(o => o.status === "Rascunho").length;
  const protocoladosCount = oficios.filter(o => o.status === "Protocolado").length;

  return (
    <div className="space-y-8 select-text">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-teal-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-teal-500/20 text-teal-300 rounded-2xl border border-teal-400/30">
                <FileText size={22} />
              </span>
              <span className="text-xs font-black tracking-widest text-teal-300 uppercase">
                Conselho Tutelar • Lei Federal nº 8.069/90
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Editor de Ofício Oficial
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-medium">
              Redação, emissão e controle formal de ofícios institucionais. Padrão A4 oficial, cabeçalho repetido em todas as páginas, fundamentação jurídica no ECA e controle de múltiplas assinaturas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus size={18} />
              <span>Novo Ofício</span>
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base">{totalOficios}</span>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Total de Ofícios</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-emerald-400 text-base">{emitidosCount}</span>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Emitidos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sky-400 text-base">{protocoladosCount}</span>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Protocolados</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-amber-400 text-base">{rascunhosCount}</span>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Rascunhos</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span className={`w-2 h-2 rounded-full ${firestoreSyncStatus === "conectado" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
            <span>Firestore: {firestoreSyncStatus === "conectado" ? "Sincronizado" : "Armazenamento Local"}</span>
          </div>
        </div>
      </div>

      {/* Floating Alert */}
      {notification && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 animate-in slide-in-from-top">
          <Check size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nº, destinatário, assunto ou processo..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            {(["todos", "Emitido", "Protocolado", "Rascunho"] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl transition ${
                  statusFilter === st 
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {st === "todos" ? "Todos os Status" : st}
              </button>
            ))}
          </div>

          <select
            value={anoFilter}
            onChange={e => setAnoFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer focus:bg-white"
          >
            <option value="todos">Todos os Anos</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* 3. Document Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOficios.map(oficio => {
          const dataExtenso = formatDataPorExtenso(oficio.dataEmissao);
          const totalAssinaturas = oficio.conselheiros?.filter(c => c.linhaAssinatura).length || 0;
          const totalAnexos = oficio.anexos?.length || 0;

          return (
            <div 
              key={oficio.id} 
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-black text-xs">
                      {oficio.numeroFormatado}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                      oficio.status === "Emitido" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : oficio.status === "Protocolado"
                        ? "bg-sky-50 text-sky-700 border-sky-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {oficio.status}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-slate-400">
                    {dataExtenso || oficio.dataEmissao}
                  </span>
                </div>

                {/* Destinatário */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Destinatário
                  </span>
                  <h3 className="text-sm font-black text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition">
                    {oficio.nomeDestinatario || "Destinatário não informado"}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {oficio.cargoDestinatario || "Cargo/Órgão"}
                  </p>
                </div>

                {/* Assunto & Procedimento */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <div className="text-xs text-slate-700 font-semibold line-clamp-2">
                    <strong className="text-slate-900">Assunto:</strong> {oficio.assunto}
                  </div>
                  {oficio.numeroProcedimento && (
                    <div className="text-[11px] font-mono text-emerald-800 font-bold truncate">
                      Proc. nº {oficio.numeroProcedimento}
                    </div>
                  )}
                </div>

                {/* Badges de assinaturas e anexos */}
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <User size={13} className="text-slate-400" />
                    <span>{totalAssinaturas} {totalAssinaturas === 1 ? "conselheiro" : "conselheiros"}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <FileText size={13} className="text-slate-400" />
                    <span>{oficio.paragrafos.length} parágrafos</span>
                  </span>
                  {totalAnexos > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-700 font-bold">
                        <Paperclip size={13} />
                        <span>{totalAnexos} anexos</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setPreviewOficio(oficio);
                    setIsPreviewOpen(true);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition"
                >
                  <Eye size={14} className="text-emerald-600" />
                  <span>Visualizar A4</span>
                </button>

                <button
                  onClick={() => {
                    setEditingOficio(oficio);
                    setIsEditorOpen(true);
                  }}
                  className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition"
                  title="Editar Ofício"
                >
                  <Edit3 size={16} />
                </button>

                <button
                  onClick={() => handleDuplicateOficio(oficio)}
                  className="p-2 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-xl transition"
                  title="Duplicar Ofício"
                >
                  <Copy size={16} />
                </button>

                <button
                  onClick={() => handleDeleteOficio(oficio.id, oficio.numeroFormatado)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredOficios.length === 0 && (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3">
          <FileText size={48} className="stroke-1 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Nenhum ofício encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Não há documentos correspondentes aos filtros selecionados. Crie um novo ofício a partir dos modelos institucionais.
          </p>
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
          >
            <Plus size={15} />
            <span>Criar Novo Ofício</span>
          </button>
        </div>
      )}

      {/* 4. Modal de Seleção de Template Oficial */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Sparkles size={20} />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Escolha um Modelo de Ofício
                  </h3>
                  <p className="text-xs text-slate-500">
                    Selecione um formato pré-configurado ou comece em branco
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {TEMPLATES_OFICIO.map(template => (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.dados)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 group-hover:text-emerald-800 transition">
                        {template.titulo}
                      </span>
                      {template.id === "tpl-mp-procedimento" && (
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                          Modelo Real do Anexo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {template.descricao}
                    </p>
                  </div>
                  <button className="px-3 py-1.5 bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 text-xs font-bold rounded-xl transition shrink-0">
                    Usar Modelo
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal do Editor */}
      {isEditorOpen && (
        <OficioEditorModal
          initialOficio={editingOficio}
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingOficio(null);
          }}
          onSave={handleSaveOficio}
          cases={cases}
        />
      )}

      {/* 6. Modal do Visualizador A4 / Impressão */}
      {isPreviewOpen && previewOficio && (
        <OficioPreviewModal
          oficio={previewOficio}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewOficio(null);
          }}
          onEdit={() => {
            setIsPreviewOpen(false);
            setEditingOficio(previewOficio);
            setIsEditorOpen(true);
          }}
        />
      )}

    </div>
  );
}
