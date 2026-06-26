import React from "react";
import { Case, Referral, Organ } from "../types";
import { ALL_ORGANS } from "../data";
import Logo from "./Logo";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  AlertTriangle, 
  FileCheck,
  ShieldAlert,
  ArrowUpRight
} from "lucide-react";
import PrivacyText from "./PrivacyText";

interface DashboardProps {
  cases: Case[];
  onSelectCase: (caseId: string) => void;
  onNavigateToTab: (tab: string) => void;
  safeMode: boolean;
}

export default function Dashboard({ cases, onSelectCase, onNavigateToTab, safeMode }: DashboardProps) {
  // Current local time: 2026-06-25
  const TODAY_STR = "2026-06-25";
  const today = new Date(TODAY_STR);

  // 1. Calculations
  const totalCases = cases.length;
  const activeCases = cases.filter(c => c.status === "Ativo" || c.status === "Em Acompanhamento").length;
  
  let totalMeetingsCount = 0;
  cases.forEach(c => {
    totalMeetingsCount += c.reunioes ? c.reunioes.length : 0;
  });

  const allReferrals: Referral[] = [];
  cases.forEach(c => {
    if (c.encaminhamentos) {
      allReferrals.push(...c.encaminhamentos);
    }
  });

  const totalReferrals = allReferrals.length;
  const completedReferrals = allReferrals.filter(r => r.status === "Concluído").length;
  const completionRate = totalReferrals > 0 ? Math.round((completedReferrals / totalReferrals) * 100) : 0;

  // Overdue (Atrasados) calculation: deadline < 2026-06-25 and status !== 'Concluído'
  const overdueReferrals = allReferrals.filter(r => {
    if (r.status === "Concluído") return false;
    const deadlineDate = new Date(r.prazo);
    return deadlineDate < today;
  });
  const overdueCount = overdueReferrals.length;

  // 2. Data for Referral by Organ chart
  const organChartData = ALL_ORGANS.map(organ => {
    const organReferrals = allReferrals.filter(r => r.orgaoResponsavel === organ);
    const concluido = organReferrals.filter(r => r.status === "Concluído").length;
    const emAndamento = organReferrals.filter(r => r.status === "Em andamento").length;
    const pendente = organReferrals.filter(r => r.status === "Pendente").length;
    
    return {
      name: organ.replace("Assistência Social ", "").replace("Civil/Militar", ""),
      Concluído: concluido,
      "Em andamento": emAndamento,
      Pendente: pendente,
      total: organReferrals.length
    };
  }).filter(item => item.total > 0); // Only show organs with at least 1 action

  // 3. Data for Risk Level Distribution
  const riskLevels = {
    Crítico: 0,
    Alto: 0,
    Médio: 0,
    Baixo: 0
  };

  cases.forEach(c => {
    const risk = c.nivelRiscoAI || "Médio";
    if (risk in riskLevels) {
      riskLevels[risk as keyof typeof riskLevels]++;
    } else {
      riskLevels["Médio"]++;
    }
  });

  const COLORS_RISK = {
    Crítico: "#ef4444", // red-500
    Alto: "#f97316",    // orange-500
    Médio: "#f59e0b",   // amber-500
    Baixo: "#10b981"    // emerald-500
  };

  const riskChartData = Object.entries(riskLevels).map(([key, value]) => ({
    name: key,
    value,
    color: COLORS_RISK[key as keyof typeof COLORS_RISK]
  })).filter(item => item.value > 0);

  // 4. Overdue/Pending list for Table
  const urgentActionsList = allReferrals
    .map(ref => {
      // Find matching case
      const parentCase = cases.find(c => c.encaminhamentos?.some(r => r.id === ref.id));
      const deadlineDate = new Date(ref.prazo);
      const isOverdue = deadlineDate < today && ref.status !== "Concluído";
      return {
        ...ref,
        caseId: parentCase?.id || "",
        caseName: parentCase?.name || "Desconhecido",
        isOverdue
      };
    })
    .filter(ref => ref.status !== "Concluído")
    .sort((a, b) => {
      // Sort: Overdue first, then high priority
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      const priorityOrder = { Alta: 3, Média: 2, Baixa: 1 };
      return (priorityOrder[b.prioridade] || 0) - (priorityOrder[a.prioridade] || 0);
    })
    .slice(0, 5); // top 5 critical alerts

  return (
    <div className="space-y-8" id="dashboard-container">
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-teal-950 via-slate-900 to-teal-950 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 relative z-10">
          <div className="p-3 bg-white/10 border border-white/15 rounded-2xl shadow-inner backdrop-blur-md flex items-center justify-center shrink-0">
            <Logo size={68} showText={false} />
          </div>
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-xs font-bold text-teal-200">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              Painel Geral de Rede
            </div>
            <h1 className="font-sans text-3.5xl font-black tracking-tight leading-none uppercase">
              <span>TIO</span><span className="text-teal-400">SYSTEM</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Acompanhamento em tempo real das deliberações, encaminhamentos e prazos pactuados na rede integrada de proteção social.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => onNavigateToTab("nova-reuniao")}
            className="flex items-center gap-2 px-5 py-3 bg-white text-slate-950 hover:bg-slate-50 font-bold rounded-xl text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
            id="btn-quick-new-meeting"
          >
            <Calendar size={16} />
            Registrar Reunião de Rede
          </button>
        </div>
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md hover:border-slate-200/80">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Casos em Rede</span>
            <h3 className="text-3xl font-bold text-slate-900">{activeCases} <span className="text-sm font-medium text-slate-400">ativos</span></h3>
            <p className="text-xs text-slate-400 font-medium">De {totalCases} casos cadastrados</p>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
            <Users size={24} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md hover:border-slate-200/80">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reuniões Intersetoriais</span>
            <h3 className="text-3xl font-bold text-slate-900">{totalMeetingsCount}</h3>
            <p className="text-xs text-teal-600 font-semibold hover:underline cursor-pointer flex items-center gap-1" onClick={() => onNavigateToTab("casos")}>
              Ver histórico por caso <ArrowUpRight size={12} />
            </p>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
            <Calendar size={24} />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md hover:border-slate-200/80">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Metas da Rede</span>
            <h3 className="text-3xl font-bold text-slate-900">{completionRate}%</h3>
            <p className="text-xs text-emerald-600 font-medium">
              {completedReferrals} de {totalReferrals} concluídas
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md hover:border-slate-200/80">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ações Atrasadas</span>
            <h3 className={`text-3xl font-bold ${overdueCount > 0 ? "text-rose-600" : "text-slate-900"}`}>{overdueCount}</h3>
            <p className="text-xs text-rose-500 font-semibold animate-pulse">
              {overdueCount > 0 ? "Atenção aos prazos!" : "Nenhuma ação atrasada"}
            </p>
          </div>
          <div className={`p-3 rounded-2xl ${overdueCount > 0 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"}`}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Recharts Stacked Bar Chart for Referral by Organ */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[380px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 font-sans">Deliberações por Órgão Responsável</h3>
              <p className="text-xs text-slate-500">Distribuição do status das ações pactuadas em reuniões</p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              Hoje: 25/06/2026
            </span>
          </div>

          <div className="flex-1 w-full min-h-[250px]">
            {organChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={organChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '12px', 
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px'
                    }} 
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Bar dataKey="Concluído" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Em andamento" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Pendente" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                <FileCheck size={40} className="stroke-1 mb-2 text-slate-300" />
                <p className="text-sm">Nenhuma ação vinculada a órgãos ainda.</p>
                <p className="text-xs text-slate-400 mt-1">Crie reuniões e defina tarefas.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Pie Chart of Vulnerability Risk Levels */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 font-sans">Nível de Risco/Urgência Geral</h3>
            <p className="text-xs text-slate-500">Grau de severidade dos casos ativos sob análise de IA</p>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div className="relative h-[160px] flex items-center justify-center">
              {riskChartData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskChartData}
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {riskChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          borderRadius: '10px', 
                          color: '#fff', 
                          fontSize: '11px',
                          border: 'none' 
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Absolute Center Count */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-extrabold text-slate-800">{totalCases}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Casos Totais</span>
                  </div>
                </>
              ) : (
                <div className="text-slate-400 text-sm">Nenhum caso cadastrado</div>
              )}
            </div>

            {/* Risk Legend Grid */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-50">
              {Object.entries(COLORS_RISK).map(([risk, color]) => {
                const count = riskLevels[risk as keyof typeof riskLevels] || 0;
                return (
                  <div key={risk} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-all">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-700 leading-none">{risk}</span>
                      <span className="text-[10px] text-slate-400 font-bold mt-0.5">{count} {count === 1 ? 'caso' : 'casos'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Underneath Row: Alerts and Task lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Critical Alerts / Priority Referrals */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-500" />
              <div>
                <h3 className="font-semibold text-slate-900 font-sans">Ações em Alerta / Prioritárias</h3>
                <p className="text-xs text-slate-500">Tarefas atrasadas ou com alta prioridade que demandam atenção imediata</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigateToTab("acompanhamento")}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50/50 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-all"
            >
              Ver Todas
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            {urgentActionsList.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400 font-medium uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Ação / Encaminhamento</th>
                    <th className="pb-3 font-semibold">Órgão Responsável</th>
                    <th className="pb-3 font-semibold">Prazo</th>
                    <th className="pb-3 font-semibold">Prioridade</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Caso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {urgentActionsList.map((ref) => {
                    const statusColors = {
                      Pendente: "bg-amber-50 text-amber-600 border-amber-100",
                      "Em andamento": "bg-blue-50 text-blue-600 border-blue-100",
                      Concluído: "bg-emerald-50 text-emerald-600 border-emerald-100"
                    };
                    const priorityColors = {
                      Alta: "bg-rose-50 text-rose-600 border-rose-100",
                      Média: "bg-amber-50 text-amber-700 border-amber-100",
                      Baixa: "bg-slate-50 text-slate-600 border-slate-100"
                    };

                    return (
                      <tr key={ref.id} className="hover:bg-slate-50/40 transition-colors group">
                        <td className="py-3.5 pr-3 max-w-[240px]">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">{ref.acao}</span>
                            {ref.isOverdue && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-rose-500 font-semibold mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                                Prazo Estourado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 pr-2 font-medium text-slate-700">{ref.orgaoResponsavel}</td>
                        <td className="py-3.5 pr-2 text-slate-500 font-mono text-xs">{ref.prazo.split('-').reverse().join('/')}</td>
                        <td className="py-3.5 pr-2">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md border ${priorityColors[ref.prioridade]}`}>
                            {ref.prioridade}
                          </span>
                        </td>
                        <td className="py-3.5 pr-2">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md border ${statusColors[ref.status]}`}>
                            {ref.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => onSelectCase(ref.caseId)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:underline hover:text-teal-700"
                          >
                            <PrivacyText text={ref.caseName} type="name" safeMode={safeMode} className="text-teal-600 hover:text-teal-700 font-bold" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <CheckCircle2 size={36} className="text-emerald-500 mb-2 stroke-1" />
                <p className="text-sm font-medium">Nenhum alerta crítico ativo!</p>
                <p className="text-xs text-slate-400 mt-0.5">Todas as ações pendentes estão dentro do prazo.</p>
              </div>
            )}
          </div>
        </div>

        {/* Family Lookup / Person search */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 font-sans">Evitar Retrabalho da Rede</h3>
              <p className="text-xs text-slate-500">Mapear históricos familiares integrados para prevenir ações duplicadas.</p>
            </div>

            <div className="bg-gradient-to-br from-teal-50/30 to-emerald-50/20 p-4 rounded-xl border border-teal-100/30">
              <p className="text-xs text-teal-950 font-medium leading-relaxed">
                Antes de instaurar uma nova ficha de rede, utilize a barra de buscas em <strong className="text-teal-700">Casos</strong> para checar se iniciais ou sobrenomes de familiares já constam sob intervenção de outro órgão do município.
              </p>
              <div className="mt-4 p-2 bg-white rounded-lg border border-teal-100 flex items-center justify-between text-xs font-bold text-teal-600 hover:bg-teal-50/40 cursor-pointer transition-all" onClick={() => onNavigateToTab("casos")}>
                <span>Buscar histórico familiar</span>
                <ArrowUpRight size={14} />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Últimos casos inseridos</h4>
            <div className="space-y-2">
              {cases.slice(-2).reverse().map(c => (
                <div 
                  key={c.id} 
                  onClick={() => onSelectCase(c.id)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                      {c.name.substring(0, 2)}
                    </div>
                    <div className="flex flex-col items-start">
                      <PrivacyText text={c.name} type="name" safeMode={safeMode} className="text-xs font-bold text-slate-800" />
                      <span className="text-[10px] text-slate-400 font-mono">{c.age} anos · {c.sigilo}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                    c.status === "Ativo" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
