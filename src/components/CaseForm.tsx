import React from "react";
import { Case, Organ, Referral, Meeting } from "../types";
import { ALL_ORGANS } from "../data";
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Check, 
  Calendar, 
  User, 
  ShieldAlert, 
  FileText, 
  AlertCircle,
  HelpCircle
} from "lucide-react";

interface CaseFormProps {
  onSaveCase: (newCase: Case) => void;
  activeSession: { organ: Organ; role: string; username: string };
  onCancel: () => void;
}

export default function CaseForm({ onSaveCase, activeSession, onCancel }: CaseFormProps) {
  // Wizard Step State
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);

  // Form Field State: Meeting
  const [meetingDate, setMeetingDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [meetingTime, setMeetingTime] = React.useState("10:00");
  const [meetingLocation, setMeetingLocation] = React.useState("Câmara Intersetorial de Proteção");
  const [presentOrgans, setPresentOrgans] = React.useState<Organ[]>([activeSession.organ]);
  const [responsiblePerson, setResponsiblePerson] = React.useState(activeSession.username);
  const [responsibleOrgan, setResponsibleOrgan] = React.useState<Organ>(activeSession.organ);
  const [discussaoText, setDiscussaoText] = React.useState("");

  // Form Field State: Case Info
  const [caseName, setCaseName] = React.useState("");
  const [caseAge, setCaseAge] = React.useState<number>(10);
  const [caseAddress, setCaseAddress] = React.useState("");
  const [caseSigilo, setCaseSigilo] = React.useState<"Público" | "Sigiloso" | "Restrito">("Sigiloso");
  const [caseSituation, setCaseSituation] = React.useState("");
  const [caseSituationDetails, setCaseSituationDetails] = React.useState("");
  const [caseUrgentDemands, setCaseUrgentDemands] = React.useState("");

  // AI-Generated State
  const [aiAnalysisLoading, setAiAnalysisLoading] = React.useState(false);
  const [aiSuggestionsLoading, setAiSuggestionsLoading] = React.useState(false);
  const [resumoAI, setResumoAI] = React.useState("");
  const [nivelRiscoAI, setNivelRiscoAI] = React.useState<"Baixo" | "Médio" | "Alto" | "Crítico" | undefined>(undefined);
  const [vulnerabilidadesAI, setVulnerabilidadesAI] = React.useState<string[]>([]);
  const [errorMessage, setErrorMessage] = React.useState("");

  // Referrals List State
  const [referrals, setReferrals] = React.useState<Referral[]>([]);

  // Temp Referral State
  const [tempAcao, setTempAcao] = React.useState("");
  const [tempOrgan, setTempOrgan] = React.useState<Organ>("Conselho Tutelar");
  const [tempPrazo, setTempPrazo] = React.useState("");
  const [tempPriority, setTempPriority] = React.useState<"Alta" | "Média" | "Baixa">("Média");
  const [tempJustification, setTempJustification] = React.useState("");

  // Handlers
  const handleToggleOrgan = (organ: Organ) => {
    if (presentOrgans.includes(organ)) {
      setPresentOrgans(presentOrgans.filter(o => o !== organ));
    } else {
      setPresentOrgans([...presentOrgans, organ]);
    }
  };

  const handleAddReferral = () => {
    if (!tempAcao.trim()) return;

    const newRef: Referral = {
      id: `ref-temp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      acao: tempAcao,
      orgaoResponsavel: tempOrgan,
      prazo: tempPrazo || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Pendente",
      prioridade: tempPriority,
      justificativa: tempJustification,
      dataCriacao: new Date().toISOString(),
      historico: []
    };

    setReferrals([...referrals, newRef]);
    setTempAcao("");
    setTempJustification("");
  };

  const handleRemoveReferral = (id: string) => {
    setReferrals(referrals.filter(r => r.id !== id));
  };

  // Call Gemini API to analyze case and suggest risk/vulnerabilities
  const handleAiAnalysis = async () => {
    if (!caseSituation && !caseSituationDetails) {
      setErrorMessage("Por favor, preencha o Resumo da Situação ou Detalhes do Caso para a IA analisar.");
      return;
    }
    setErrorMessage("");
    setAiAnalysisLoading(true);

    try {
      const response = await fetch("/api/gemini/summarize-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: caseName || "Iniciais",
          age: caseAge,
          situation: caseSituation,
          situationDetails: caseSituationDetails,
          urgentDemands: caseUrgentDemands
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao consultar o servidor.");
      }

      const data = await response.json();
      if (data.summary) {
        setResumoAI(data.summary.resumoInteligente);
        setNivelRiscoAI(data.summary.nivelRisco as any);
        setVulnerabilidadesAI(data.summary.vulnerabilidades || []);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Não foi possível carregar a análise da IA. Verifique as configurações de chave de API.");
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  // Call Gemini API to suggest actions/referrals
  const handleAiSuggestActions = async () => {
    if (!caseSituation && !caseSituationDetails) {
      setErrorMessage("Por favor, preencha o Resumo da Situação ou Detalhes do Caso para a IA sugerir ações.");
      return;
    }
    setErrorMessage("");
    setAiSuggestionsLoading(true);

    try {
      const response = await fetch("/api/gemini/suggest-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: caseName || "Iniciais",
          age: caseAge,
          situation: caseSituation,
          situationDetails: caseSituationDetails,
          urgentDemands: caseUrgentDemands
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao consultar o servidor.");
      }

      const data = await response.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        const suggestedRefs: Referral[] = data.suggestions.map((s: any, idx: number) => {
          // Calculate deadline date in future
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + (s.prazoDias || 15));

          return {
            id: `ref-ai-${Date.now()}-${idx}`,
            acao: s.acao,
            orgaoResponsavel: s.orgaoResponsavel as Organ,
            prazo: futureDate.toISOString().split("T")[0],
            status: "Pendente",
            prioridade: (s.prioridade as any) || "Média",
            justificativa: s.justificativa,
            dataCriacao: new Date().toISOString(),
            historico: []
          };
        });

        // Add suggested to current list
        setReferrals([...referrals, ...suggestedRefs]);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Não foi possível carregar as sugestões da IA. Verifique as configurações de chave de API.");
    } finally {
      setAiSuggestionsLoading(false);
    }
  };

  // Save full form
  const handleSubmit = () => {
    if (!caseName.trim() || !caseSituation.trim()) {
      setErrorMessage("Por favor, informe pelo menos o Nome/Iniciais do assistido e o Resumo da Situação.");
      return;
    }

    const meeting: Meeting = {
      id: `meet-${Date.now()}`,
      date: meetingDate,
      time: meetingTime,
      location: meetingLocation,
      presentOrgans: presentOrgans,
      responsiblePerson: responsiblePerson,
      responsibleOrgan: responsibleOrgan,
      discussao: discussaoText || "Abertura de caso e debate de metas emergenciais."
    };

    const newCase: Case = {
      id: `case-${Date.now()}`,
      name: caseName,
      age: Number(caseAge),
      address: caseAddress || "Não informado",
      sigilo: caseSigilo,
      situation: caseSituation,
      situationDetails: caseSituationDetails,
      urgentDemands: caseUrgentDemands,
      status: "Ativo",
      dataCriacao: new Date().toISOString(),
      reunioes: [meeting],
      encaminhamentos: referrals,
      timeline: [
        {
          id: `ev-form-1`,
          date: new Date().toISOString(),
          organ: activeSession.organ,
          user: activeSession.username,
          title: "Abertura de Caso Intersetorial",
          description: `Caso registrado por meio da reunião coordenada por ${responsiblePerson} (${responsibleOrgan}).`,
          type: "criacao"
        },
        {
          id: `ev-form-2`,
          date: new Date().toISOString(),
          organ: activeSession.organ,
          user: activeSession.username,
          title: "Reunião de Colegiado Registrada",
          description: `Reunião presencial/online realizada em ${meetingDate} com ${presentOrgans.length} órgãos presentes.`,
          type: "reuniao"
        },
        ...referrals.map((r, idx) => ({
          id: `ev-form-ref-${idx}`,
          date: new Date().toISOString(),
          organ: r.orgaoResponsavel,
          user: "Sistema",
          title: "Encaminhamento Pactuado",
          description: `Definida ação para o órgão ${r.orgaoResponsavel} com prazo até ${r.prazo.split('-').reverse().join('/')}.`,
          type: "encaminhamento" as const
        }))
      ],
      anexos: [],
      resumoAI: resumoAI || undefined,
      nivelRiscoAI: nivelRiscoAI || undefined,
      vulnerabilidadesAI: vulnerabilidadesAI.length > 0 ? vulnerabilidadesAI : undefined
    };

    onSaveCase(newCase);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-4xl mx-auto overflow-hidden">
      
      {/* Visual Indicator of Steps */}
      <div className="bg-slate-950 text-white px-8 py-6 relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-sans text-2xl font-bold">Novo Registro Intersetorial (TIO SYSTEM)</h2>
            <p className="text-slate-400 text-xs mt-1">Registrar reuniões, classificar vulnerabilidades e definir ações de rede.</p>
          </div>
          {/* Step circles */}
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex items-center">
                <button
                  onClick={() => s <= step ? setStep(s as any) : null}
                  className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                    step === s
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : s < step
                      ? "bg-indigo-100/10 text-indigo-200 border border-indigo-500/30"
                      : "bg-slate-800 text-slate-500 border border-slate-700/60"
                  }`}
                  id={`btn-step-${s}`}
                >
                  {s < step ? <Check size={14} /> : s}
                </button>
                {s < 4 && <div className={`w-6 h-[2px] mx-1 ${s < step ? "bg-indigo-500/50" : "bg-slate-800"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 font-sans">
        
        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-xl flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Erro de validação ou de chave de API:</span> {errorMessage}
              <p className="text-xs mt-1 text-rose-500">
                Se você está usando a IA e a chave não foi definida nas Configurações, o sistema acusará erro. Você pode preencher os campos manualmente.
              </p>
            </div>
          </div>
        )}

        {/* STEP 1: CADASTRO DA REUNIÃO */}
        {step === 1 && (
          <div className="space-y-6" id="form-step-1">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Calendar size={18} /></div>
              <div>
                <h3 className="font-semibold text-slate-900">1. Atas e Dados da Reunião</h3>
                <p className="text-xs text-slate-500">Detalhes de quando e quem se reuniu para debater este caso.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data da Reunião</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={e => setMeetingDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm font-medium focus:outline-none transition-all"
                  id="inp-meeting-date"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Horário</label>
                <input
                  type="time"
                  value={meetingTime}
                  onChange={e => setMeetingTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm font-medium focus:outline-none transition-all"
                  id="inp-meeting-time"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Local ou Formato</label>
                <input
                  type="text"
                  placeholder="Ex: Online (Meet), CRAS Central, etc."
                  value={meetingLocation}
                  onChange={e => setMeetingLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all"
                  id="inp-meeting-location"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Responsável / Mediador</label>
                <input
                  type="text"
                  value={responsiblePerson}
                  onChange={e => setResponsiblePerson(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all"
                  id="inp-meeting-person"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Órgãos Co-participantes Presentes</span>
                <span className="text-[10px] text-indigo-600 font-normal normal-case">Selecione todos que compareceram</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ALL_ORGANS.map(organ => {
                  const isPresent = presentOrgans.includes(organ);
                  return (
                    <button
                      type="button"
                      key={organ}
                      onClick={() => handleToggleOrgan(organ)}
                      className={`flex items-center gap-2 p-3 text-xs font-semibold rounded-xl border text-left transition-all ${
                        isPresent
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                          : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      id={`btn-organ-chk-${organ.replace(/[^a-zA-Z0-9]/g, "")}`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition-all ${
                        isPresent ? "bg-indigo-600 text-white" : "border border-slate-300"
                      }`}>
                        {isPresent && <Check size={11} strokeWidth={3} />}
                      </div>
                      <span>{organ}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: IDENTIFICAÇÃO E SITUAÇÃO DO CASO */}
        {step === 2 && (
          <div className="space-y-6" id="form-step-2">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><User size={18} /></div>
              <div>
                <h3 className="font-semibold text-slate-900">2. Identificação do Assistido & Sigilo</h3>
                <p className="text-xs text-slate-500">Dados do menor/família sob análise e nível de privacidade.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Nome ou Iniciais <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: J. P. S. (Recomendado iniciais para sigilo)"
                  value={caseName}
                  onChange={e => setCaseName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all"
                  id="inp-case-name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Idade (anos)</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={caseAge}
                  onChange={e => setCaseAge(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all"
                  id="inp-case-age"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Endereço Residencial</label>
                <input
                  type="text"
                  placeholder="Rua, número, bairro ou referência geográfica"
                  value={caseAddress}
                  onChange={e => setCaseAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all"
                  id="inp-case-address"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nível de Sigilo</label>
                <select
                  value={caseSigilo}
                  onChange={e => setCaseSigilo(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm font-semibold focus:outline-none transition-all"
                  id="inp-case-sigilo"
                >
                  <option value="Público">Público (Livre na Rede)</option>
                  <option value="Sigiloso">Sigiloso (Recomendado)</option>
                  <option value="Restrito">Restrito (Alto Risco)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Resumo da Situação / Motivo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Negligência grave de saúde, evasão escolar, violência doméstica..."
                value={caseSituation}
                onChange={e => setCaseSituation(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all"
                id="inp-case-situation"
              />
            </div>
          </div>
        )}

        {/* STEP 3: DESCRIÇÃO DO CASO E IA SMART */}
        {step === 3 && (
          <div className="space-y-6" id="form-step-3">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FileText size={18} /></div>
                <div>
                  <h3 className="font-semibold text-slate-900">3. Relato Detalhado & Inteligência Artificial</h3>
                  <p className="text-xs text-slate-500">Escreva o relato do caso e use a IA para classificar riscos automaticamente.</p>
                </div>
              </div>
              
              {/* AI Trigger button */}
              <button
                type="button"
                onClick={handleAiAnalysis}
                disabled={aiAnalysisLoading}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 transition-all disabled:opacity-60 cursor-pointer"
                id="btn-ai-analyze"
              >
                {aiAnalysisLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Sparkles size={13} />
                )}
                Analisar Caso com IA
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Relato Detalhado (Histórico)</label>
                <textarea
                  rows={6}
                  placeholder="Descreva detalhadamente o caso, dinâmica familiar, histórico de intervenções..."
                  value={caseSituationDetails}
                  onChange={e => setCaseSituationDetails(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all resize-none"
                  id="inp-case-details"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Demandas Urgentes Identificadas</label>
                <textarea
                  rows={6}
                  placeholder="Quais as necessidades de curto prazo da família ou do menor?"
                  value={caseUrgentDemands}
                  onChange={e => setCaseUrgentDemands(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all resize-none"
                  id="inp-case-demands"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discussões e Anotações Livres da Reunião</label>
              <textarea
                rows={3}
                placeholder="Notas de conversas dos órgãos presentes durante a reunião de alinhamento..."
                value={discussaoText}
                onChange={e => setDiscussaoText(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all resize-none"
                id="inp-meeting-discuss"
              />
            </div>

            {/* AI Results Panel */}
            {(resumoAI || nivelRiscoAI || vulnerabilidadesAI.length > 0) && (
              <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 rounded-2xl border border-indigo-100/40 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-600" />
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Resultados da Análise Inteligente</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Resumo Clínico/Social</span>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{resumoAI}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Grau de Risco</span>
                    <div>
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-xl border ${
                        nivelRiscoAI === "Crítico" ? "bg-rose-100 border-rose-200 text-rose-800" :
                        nivelRiscoAI === "Alto" ? "bg-orange-100 border-orange-200 text-orange-800" :
                        nivelRiscoAI === "Médio" ? "bg-amber-100 border-amber-200 text-amber-800" :
                        "bg-emerald-100 border-emerald-200 text-emerald-800"
                      }`}>
                        {nivelRiscoAI}
                      </span>
                    </div>
                  </div>
                </div>

                {vulnerabilidadesAI.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Vulnerabilidades Principais</span>
                    <div className="flex flex-wrap gap-1.5">
                      {vulnerabilidadesAI.map((v, i) => (
                        <span key={i} className="text-[10px] font-semibold bg-white text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-lg">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: ENCAMINHAMENTOS (ESSENCIAL) */}
        {step === 4 && (
          <div className="space-y-6" id="form-step-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><ShieldAlert size={18} /></div>
                <div>
                  <h3 className="font-semibold text-slate-900">4. Encaminhamentos Pactuados</h3>
                  <p className="text-xs text-slate-500">Ações definidas, órgãos responsáveis e prazos pactuados na mesa.</p>
                </div>
              </div>
              
              {/* Trigger AI Suggestions */}
              <button
                type="button"
                onClick={handleAiSuggestActions}
                disabled={aiSuggestionsLoading}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 transition-all disabled:opacity-60 cursor-pointer"
                id="btn-ai-suggest-actions"
              >
                {aiSuggestionsLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Sparkles size={13} />
                )}
                Gerar Sugestões de Ações com IA
              </button>
            </div>

            {/* Referrals Table / List */}
            <div className="space-y-4">
              {referrals.length > 0 ? (
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <th className="p-4">Ação pactuada</th>
                        <th className="p-4">Responsável</th>
                        <th className="p-4">Prazo</th>
                        <th className="p-4">Prioridade</th>
                        <th className="p-4 text-center">Excluir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {referrals.map((r, index) => {
                        const priorityColors = {
                          Alta: "bg-rose-50 text-rose-600 border-rose-100",
                          Média: "bg-amber-50 text-amber-700 border-amber-100",
                          Baixa: "bg-slate-50 text-slate-600 border-slate-100"
                        };
                        return (
                          <tr key={r.id || index} className="hover:bg-slate-50/50 transition-all">
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-800 leading-tight">{r.acao}</span>
                                {r.justificativa && <span className="text-[10px] text-slate-400 mt-0.5">{r.justificativa}</span>}
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-slate-700">{r.orgaoResponsavel}</td>
                            <td className="p-4 font-mono text-xs text-slate-500">{r.prazo.split('-').reverse().join('/')}</td>
                            <td className="p-4">
                              <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md border ${priorityColors[r.prioridade]}`}>
                                {r.prioridade}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveReferral(r.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50/50 border border-slate-100 border-dashed rounded-2xl">
                  <p className="text-xs text-slate-500 font-medium">Nenhum encaminhamento pactuado ainda.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Adicione manualmente abaixo ou peça para a IA sugerir encaminhamentos.</p>
                </div>
              )}

              {/* Add Manual Referral Panel */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Adicionar Encaminhamento Manual</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Ação Definida</label>
                    <input
                      type="text"
                      placeholder="O que deve ser feito?"
                      value={tempAcao}
                      onChange={e => setTempAcao(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all"
                      id="inp-manual-action"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Órgão Responsável</label>
                    <select
                      value={tempOrgan}
                      onChange={e => setTempOrgan(e.target.value as Organ)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                      id="inp-manual-organ"
                    >
                      {ALL_ORGANS.filter(o => o !== "Rede Geral").map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Prazo de Resposta</label>
                    <input
                      type="date"
                      value={tempPrazo}
                      onChange={e => setTempPrazo(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 transition-all"
                      id="inp-manual-deadline"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Prioridade</label>
                    <select
                      value={tempPriority}
                      onChange={e => setTempPriority(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-all"
                      id="inp-manual-priority"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Média">Média</option>
                      <option value="Baixa">Baixa</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddReferral}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                      id="btn-add-manual-referral"
                    >
                      <Plus size={14} />
                      Adicionar Ação
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP BUTTONS */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm rounded-xl transition-all cursor-pointer"
            id="btn-form-cancel"
          >
            Cancelar
          </button>
          
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
                id="btn-form-back"
              >
                Voltar
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  // Basic validation per step
                  if (step === 2 && !caseName.trim()) {
                    setErrorMessage("Por favor, preencha o campo Nome/Iniciais do assistido.");
                    return;
                  }
                  if (step === 2 && !caseSituation.trim()) {
                    setErrorMessage("Por favor, preencha o Resumo da Situação.");
                    return;
                  }
                  setErrorMessage("");
                  setStep((step + 1) as any);
                }}
                className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer"
                id="btn-form-next"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-100 transition-all cursor-pointer"
                id="btn-form-submit"
              >
                Finalizar e Salvar Caso
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
