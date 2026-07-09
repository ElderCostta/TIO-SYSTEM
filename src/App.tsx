import React from "react";
import { Case, Organ, Role, UserSession } from "./types";
import { INITIAL_CASES, ALL_ORGANS } from "./data";
import Dashboard from "./components/Dashboard";
import Logo from "./components/Logo";
import Login from "./components/Login";
import CaseForm from "./components/CaseForm";
import CaseDetails from "./components/CaseDetails";
import RegistroAtas from "./components/RegistroAtas";
import PrivacyText from "./components/PrivacyText";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Calendar, 
  ShieldAlert, 
  Plus, 
  Search, 
  UserCheck, 
  HelpCircle, 
  FileText, 
  Database,
  Lock,
  Unlock,
  Bell,
  RefreshCw,
  LogOut,
  Shield,
  Trash2,
  Wifi,
  WifiOff
} from "lucide-react";

// Professional 3D Page Turn animation variants
const pageFlipVariants = {
  initial: {
    rotateY: -18,
    opacity: 0,
    x: -25,
    scale: 0.98,
    transformOrigin: "left center",
  },
  animate: {
    rotateY: 0,
    opacity: 1,
    x: 0,
    scale: 1,
    transformOrigin: "left center",
    transition: {
      duration: 0.42,
      ease: [0.25, 1, 0.5, 1] as any, // Cubic bezier for page physical feel
    }
  },
  exit: {
    rotateY: 18,
    opacity: 0,
    x: 25,
    scale: 0.98,
    transformOrigin: "right center",
    transition: {
      duration: 0.35,
      ease: [0.25, 1, 0.5, 1] as any,
    }
  }
};

export default function App() {
  // 1. Core State
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(() => {
    return localStorage.getItem("tio_system_logged_in") === "true";
  });
  const [cases, setCases] = React.useState<Case[]>([]);
  const [activeTab, setActiveTab] = React.useState<string>("dashboard"); // "dashboard" | "casos" | "nova-reuniao"
  const [selectedCaseId, setSelectedCaseId] = React.useState<string | null>(null);
  
  // State for LGPD Screen-Shield / Anti-vazamento (defaults to true for safety)
  const [safeMode, setSafeMode] = React.useState<boolean>(() => {
    return localStorage.getItem("tio_system_safe_mode") !== "false";
  });

  const toggleSafeMode = () => {
    const newValue = !safeMode;
    setSafeMode(newValue);
    localStorage.setItem("tio_system_safe_mode", String(newValue));
  };

  // State for Real-Time cloud synchronization
  const [realTimeSync, setRealTimeSync] = React.useState<boolean>(() => {
    return localStorage.getItem("tio_system_real_time_sync") !== "false";
  });

  const toggleRealTimeSync = () => {
    const newValue = !realTimeSync;
    setRealTimeSync(newValue);
    localStorage.setItem("tio_system_real_time_sync", String(newValue));
  };

  // Real-time synchronization polling
  React.useEffect(() => {
    if (!realTimeSync) return;

    let isMounted = true;
    
    const syncWithServer = async () => {
      try {
        const response = await fetch("/api/sync/cases");
        const data = await response.json();
        
        if (isMounted && data.cases) {
          const serverJson = JSON.stringify(data.cases);
          const localStored = localStorage.getItem("tio_system_cases");
          if (serverJson !== localStored) {
            setCases(data.cases);
            localStorage.setItem("tio_system_cases", serverJson);
          }
        }
      } catch (err) {
        console.error("Erro ao puxar casos sincronizados:", err);
      }
    };

    syncWithServer();
    const intervalId = setInterval(syncWithServer, 1500);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [realTimeSync]);

  // Simulated Login Session
  const [session, setSession] = React.useState<UserSession>({
    organ: "Conselho Tutelar",
    role: "Administrador",
    username: "Conselho Tutelar"
  });

  // Filters State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterOrgan, setFilterOrgan] = React.useState<string>("Todos");
  const [filterStatus, setFilterStatus] = React.useState<string>("Todos");
  const [filterRisk, setFilterRisk] = React.useState<string>("Todos");
  const [filterBairro, setFilterBairro] = React.useState<string>("Todos");
  const [filterTipoViolacao, setFilterTipoViolacao] = React.useState<string>("Todos");
  const [filterDateRange, setFilterDateRange] = React.useState<string>("Todos");

  // Notifications State
  const [notifications, setNotifications] = React.useState<Array<{ id: string; text: string; time: string }>>([
    { id: "1", text: "Nova reunião convocada pelo CREAS para amanhã às 14h.", time: "há 10 min" },
    { id: "2", text: "Ação de Saúde para o assistido A. L. O. vence hoje.", time: "há 1 hora" }
  ]);
  const [showNotifications, setShowNotifications] = React.useState(false);

  // 2. Load and Sync LocalStorage
  React.useEffect(() => {
    const stored = localStorage.getItem("tio_system_cases");
    if (stored) {
      try {
        setCases(JSON.parse(stored));
      } catch (e) {
        console.error("Erro ao ler localStorage:", e);
        setCases(INITIAL_CASES);
      }
    } else {
      // Seed initial cases
      setCases(INITIAL_CASES);
      localStorage.setItem("tio_system_cases", JSON.stringify(INITIAL_CASES));
    }
  }, []);

  const saveCasesToStorage = (updatedCases: Case[]) => {
    setCases(updatedCases);
    localStorage.setItem("tio_system_cases", JSON.stringify(updatedCases));
    if (realTimeSync) {
      fetch("/api/sync/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cases: updatedCases })
      })
      .then(res => res.json())
      .catch(err => console.error("Erro ao sincronizar casos no servidor:", err));
    }
  };

  // 3. Simulated user logins
  const handleSimulateLogin = (organ: Organ) => {
    const namesByOrgan: Record<Organ, string> = {
      "Conselho Tutelar": "Conselho Tutelar",
      "Assistência Social (CRAS/CREAS)": "Assistência Social (CRAS/CREAS)",
      "Saúde": "Saúde",
      "Educação": "Educação",
      "Ministério Público": "Ministério Público",
      "Polícia": "Polícia",
      "Rede Geral": "Rede Geral"
    };

    const roleByOrgan: Record<Organ, Role> = {
      "Conselho Tutelar": "Administrador",
      "Assistência Social (CRAS/CREAS)": "Editar",
      "Saúde": "Editar",
      "Educação": "Editar",
      "Ministério Público": "Administrador",
      "Polícia": "Editar",
      "Rede Geral": "Visualizar"
    };

    setSession({
      organ,
      username: namesByOrgan[organ],
      role: roleByOrgan[organ]
    });

    // Create a simulation notification
    const newNotif = {
      id: Date.now().toString(),
      text: `Perfil alterado com sucesso para ${organ} (${roleByOrgan[organ]}).`,
      time: "Agora"
    };
    setNotifications([newNotif, ...notifications.slice(0, 4)]);
  };

  const handleUpdateSessionRole = (role: Role) => {
    setSession({ ...session, role });
  };

  const handleLoginSuccess = (initialOrgan: Organ) => {
    setIsLoggedIn(true);
    localStorage.setItem("tio_system_logged_in", "true");
    
    const namesByOrgan: Record<Organ, string> = {
      "Conselho Tutelar": "Conselho Tutelar",
      "Assistência Social (CRAS/CREAS)": "Assistência Social (CRAS/CREAS)",
      "Saúde": "Saúde",
      "Educação": "Educação",
      "Ministério Público": "Ministério Público",
      "Polícia": "Polícia",
      "Rede Geral": "Rede Geral"
    };

    const roleByOrgan: Record<Organ, Role> = {
      "Conselho Tutelar": "Administrador",
      "Assistência Social (CRAS/CREAS)": "Editar",
      "Saúde": "Editar",
      "Educação": "Editar",
      "Ministério Público": "Administrador",
      "Polícia": "Editar",
      "Rede Geral": "Visualizar"
    };

    setSession({
      organ: initialOrgan,
      username: namesByOrgan[initialOrgan],
      role: roleByOrgan[initialOrgan]
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("tio_system_logged_in");
  };

  // 4. Action Handlers
  const handleSaveNewCase = (newCase: Case) => {
    const updated = [...cases, newCase];
    saveCasesToStorage(updated);
    
    // Add timeline notification
    const newNotif = {
      id: Date.now().toString(),
      text: `Novo caso registrado na rede: "${newCase.name}" (${newCase.sigilo}).`,
      time: "Agora"
    };
    setNotifications([newNotif, ...notifications.slice(0, 4)]);

    // Go to list or details
    setSelectedCaseId(newCase.id);
    setActiveTab("casos");
  };

  const handleUpdateCase = (updatedCase: Case) => {
    const updated = cases.map(c => c.id === updatedCase.id ? updatedCase : c);
    saveCasesToStorage(updated);
  };

  const handleDeleteCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Previne abrir o detalhamento do caso
    if (window.confirm("Deseja realmente apagar este caso do sistema? Esta ação é irreversível.")) {
      const deletedCase = cases.find(c => c.id === id);
      const updated = cases.filter(c => c.id !== id);
      saveCasesToStorage(updated);

      const newNotif = {
        id: Date.now().toString(),
        text: `Caso "${deletedCase?.name || 'desconhecido'}" excluído com sucesso do sistema.`,
        time: "Agora"
      };
      setNotifications([newNotif, ...notifications.slice(0, 4)]);

      if (selectedCaseId === id) {
        setSelectedCaseId(null);
      }
    }
  };

  const handleResetData = () => {
    saveCasesToStorage(INITIAL_CASES);
    setSelectedCaseId(null);
    setActiveTab("dashboard");
    
    // Add timeline notification
    const newNotif = {
      id: Date.now().toString(),
      text: "Banco de dados restaurado para o padrão original.",
      time: "Agora"
    };
    setNotifications([newNotif, ...notifications.slice(0, 4)]);
  };

  // 5. Calculations / Filtering
  const uniqueBairros = Array.from(
    new Set(cases.map(c => c.bairro).filter(Boolean))
  ) as string[];

  const uniqueTiposViolacao = Array.from(
    new Set(cases.map(c => c.tipoViolacao).filter(Boolean))
  ) as string[];

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.situation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesOrgan = 
      filterOrgan === "Todos" || 
      c.encaminhamentos?.some(r => r.orgaoResponsavel === filterOrgan) ||
      c.reunioes?.some(m => m.presentOrgans.includes(filterOrgan as Organ));

    const matchesStatus = 
      filterStatus === "Todos" || 
      c.status === filterStatus;

    const matchesRisk = 
      filterRisk === "Todos" || 
      c.nivelRiscoAI === filterRisk;

    const matchesBairro = 
      filterBairro === "Todos" || 
      (c.bairro && c.bairro === filterBairro);

    const matchesTipoViolacao = 
      filterTipoViolacao === "Todos" || 
      (c.tipoViolacao && c.tipoViolacao === filterTipoViolacao);

    const matchesDateRange = () => {
      if (filterDateRange === "Todos") return true;
      const caseTime = new Date(c.dataCriacao || Date.now()).getTime();
      const now = Date.now();
      const diffDays = (now - caseTime) / (1000 * 60 * 60 * 24);
      if (filterDateRange === "7d") return diffDays <= 7;
      if (filterDateRange === "30d") return diffDays <= 30;
      if (filterDateRange === "365d") return diffDays <= 365;
      return true;
    };

    return matchesSearch && matchesOrgan && matchesStatus && matchesRisk && matchesBairro && matchesTipoViolacao && matchesDateRange();
  });

  const selectedCase = cases.find(c => c.id === selectedCaseId);

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="app-root">
      
      {/* 1. INTER-AGENCY SIMULATOR TOP BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border-b border-teal-900/30 text-white px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md relative z-40">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-teal-500/20 border border-teal-400/35 rounded-xl flex items-center justify-center">
            <Database size={18} className="text-teal-300" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-teal-300 uppercase tracking-widest block leading-none">Simulador de Acesso</span>
            <span className="text-xs text-slate-300 font-medium">Troque de órgão abaixo para testar as permissões e níveis de sigilo:</span>
          </div>
        </div>

        {/* Dynamic drop-downs to simulate login */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Organ selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] font-extrabold text-teal-300 uppercase tracking-wider">Órgão Ativo:</span>
            <select
              value={session.organ}
              onChange={e => handleSimulateLogin(e.target.value as Organ)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              id="session-organ-select"
            >
              {ALL_ORGANS.map(org => (
                <option key={org} value={org} className="bg-slate-900 text-white text-xs">{org}</option>
              ))}
            </select>
          </div>

          {/* Role selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] font-extrabold text-teal-300 uppercase tracking-wider">Nível:</span>
            <select
              value={session.role}
              onChange={e => handleUpdateSessionRole(e.target.value as Role)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              id="session-role-select"
            >
              <option value="Visualizar" className="bg-slate-900 text-white">Visualizar</option>
              <option value="Editar" className="bg-slate-900 text-white">Editar</option>
              <option value="Administrador" className="bg-slate-900 text-white">Administrador</option>
            </select>
          </div>

          {/* User Display Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-teal-700 rounded-xl border border-teal-600 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold font-sans" id="user-display-name">{session.username}</span>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY NAVIGATION HEADER */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <Logo size={42} />

        {/* Middle tabs navigation */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 relative">
          {[
            { id: "dashboard", label: "Painel Geral", action: () => { setActiveTab("dashboard"); setSelectedCaseId(null); }, isActive: activeTab === "dashboard" && !selectedCaseId },
            { id: "casos", label: "Casos da Rede", action: () => { setActiveTab("casos"); }, isActive: activeTab === "casos" || selectedCaseId !== null },
            { id: "nova-reuniao", label: "Registrar Reunião / Caso", action: () => { setActiveTab("nova-reuniao"); setSelectedCaseId(null); }, isActive: activeTab === "nova-reuniao" },
            { id: "registro-atas", label: "Registro de Atas", action: () => { setActiveTab("registro-atas"); setSelectedCaseId(null); }, isActive: activeTab === "registro-atas" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={tab.action}
              className={`relative px-5 py-2.5 rounded-xl text-xs font-bold transition-colors duration-200 cursor-pointer select-none z-10 ${
                tab.isActive ? "text-slate-950" : "text-slate-500 hover:text-slate-900"
              }`}
              id={`nav-${tab.id}`}
            >
              {tab.isActive && (
                <motion.div
                  layoutId="activeTabIndicatorDesktop"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-100/50 -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right tools (alerts and reset) */}
        <div className="flex items-center gap-3.5 relative">
          
          {/* Notifications bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all cursor-pointer"
              id="btn-bell"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 border border-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Alertas Recentes</span>
                  <button 
                    onClick={() => setNotifications([])} 
                    className="text-[10px] font-semibold text-rose-500 hover:underline"
                    id="btn-clear-notif"
                  >
                    Limpar
                  </button>
                </div>
                
                <div className="space-y-2.5 max-h-[250px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100/50 transition-all border border-slate-100/40">
                        <p className="text-xs text-slate-700 leading-normal font-sans font-medium">{n.text}</p>
                        <span className="text-[9px] text-slate-400 font-mono mt-1 block">{n.time}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">Sem notificações no momento.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Toggle Real-Time Cloud Sync */}
          <button
            onClick={toggleRealTimeSync}
            className={`px-3 py-1.5 rounded-xl transition-all border flex items-center gap-2 font-bold text-xs select-none cursor-pointer ${
              realTimeSync 
                ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm" 
                : "bg-slate-50 text-slate-500 border-slate-200"
            }`}
            id="toggle-real-time-sync"
            title="Sincronização em Tempo Real (Atas sincronizadas simultaneamente entre todos os computadores)"
          >
            {realTimeSync ? (
              <>
                <Wifi size={14} className="text-indigo-600 animate-pulse" />
                <span className="hidden md:inline">Nuvem Real-Time: Ativo</span>
                <span className="md:hidden">Sincronizado</span>
              </>
            ) : (
              <>
                <WifiOff size={14} className="text-slate-400" />
                <span className="hidden md:inline">Nuvem Real-Time: Inativo</span>
                <span className="md:hidden">Local Only</span>
              </>
            )}
          </button>

          {/* Toggle LGPD Safe Mode / Screen-Shield */}
          <button
            onClick={toggleSafeMode}
            className={`px-3 py-1.5 rounded-xl transition-all border flex items-center gap-2 font-bold text-xs select-none cursor-pointer ${
              safeMode 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm" 
                : "bg-slate-50 text-slate-500 border-slate-200"
            }`}
            id="toggle-safe-mode"
            title="Ativar/Desativar Escudo Anti-Vazamento LGPD (Mascarar nomes e dados confidenciais automaticamente)"
          >
            <Shield size={14} className={safeMode ? "text-emerald-600 animate-pulse" : "text-slate-400"} />
            <span className="hidden md:inline">{safeMode ? "Escudo LGPD: Ativo" : "Escudo LGPD: Inativo"}</span>
            <span className="md:hidden">{safeMode ? "LGPD" : "LGPD"}</span>
          </button>

          <button
            onClick={handleResetData}
            title="Restaurar banco de dados"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
            id="btn-restore-data"
          >
            <RefreshCw size={17} />
          </button>

          <button
            onClick={handleLogout}
            title="Sair do sistema"
            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 font-bold text-xs"
            id="btn-logout"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* 3. MOBILE TAB NAVIGATION HEADER */}
      <div className="flex md:hidden bg-white border-b border-slate-100 p-2 gap-1.5 justify-around relative">
        {[
          { id: "dashboard", label: "Painel", action: () => { setActiveTab("dashboard"); setSelectedCaseId(null); }, isActive: activeTab === "dashboard" && !selectedCaseId },
          { id: "casos", label: "Casos", action: () => { setActiveTab("casos"); }, isActive: activeTab === "casos" || selectedCaseId !== null },
          { id: "nova-reuniao", label: "Reunião", action: () => { setActiveTab("nova-reuniao"); setSelectedCaseId(null); }, isActive: activeTab === "nova-reuniao" },
          { id: "registro-atas", label: "Atas", action: () => { setActiveTab("registro-atas"); setSelectedCaseId(null); }, isActive: activeTab === "registro-atas" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={tab.action}
            className={`relative flex-1 py-2 text-xs font-bold rounded-lg transition-colors duration-200 cursor-pointer select-none z-10 ${
              tab.isActive ? "text-slate-900" : "text-slate-500"
            }`}
          >
            {tab.isActive && (
              <motion.div
                layoutId="activeTabIndicatorMobile"
                className="absolute inset-0 bg-slate-100 rounded-lg -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. MAIN WORKSPACE CONTENT */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8" style={{ perspective: "1500px", overflowX: "hidden" }}>
        
        <AnimatePresence mode="wait">
          {selectedCaseId && selectedCase ? (
            <motion.div
              key={`case-${selectedCaseId}`}
              variants={pageFlipVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ backfaceVisibility: "hidden" }}
              className="w-full"
            >
              <CaseDetails
                caseItem={selectedCase}
                activeSession={session}
                onBack={() => setSelectedCaseId(null)}
                onUpdateCase={handleUpdateCase}
                safeMode={safeMode}
              />
            </motion.div>
          ) : activeTab === "dashboard" ? (
            <motion.div
              key="dashboard"
              variants={pageFlipVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ backfaceVisibility: "hidden" }}
            >
              <Dashboard
                cases={cases}
                onSelectCase={(id) => { setSelectedCaseId(id); setActiveTab("casos"); }}
                onNavigateToTab={(tab) => { setActiveTab(tab); setSelectedCaseId(null); }}
                safeMode={safeMode}
              />
            </motion.div>
          ) : activeTab === "casos" ? (
            <motion.div
              key="casos"
              variants={pageFlipVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ backfaceVisibility: "hidden" }}
              className="space-y-6"
              id="tab-casos-list"
            >
                
                {/* Searching & Filter Bar */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-sans text-xl font-bold text-slate-900">Casos Registrados no Colegiado</h2>
                      <p className="text-xs text-slate-500">Consulte o prontuário de rede e andamento de encaminhamentos intersetoriais.</p>
                    </div>

                    <button
                      onClick={() => setActiveTab("nova-reuniao")}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                      id="btn-register-case-tab"
                    >
                      <Plus size={16} />
                      Nova Reunião / Caso
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-2">
                    
                    {/* Input search */}
                    <div className="relative">
                      <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar por nome, resumo, rua..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none transition-all"
                        id="search-query-inp"
                      />
                    </div>

                    {/* Filter Organ */}
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3.5 py-1 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Ações de:</span>
                      <select
                        value={filterOrgan}
                        onChange={e => setFilterOrgan(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none flex-1 cursor-pointer"
                        id="filter-organ-select"
                      >
                        <option value="Todos">Todos os Órgãos</option>
                        {ALL_ORGANS.map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filter Status */}
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3.5 py-1 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Status:</span>
                      <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none flex-1 cursor-pointer"
                        id="filter-status-select"
                      >
                        <option value="Todos">Todos os Status</option>
                        <option value="Ativo">Ativo</option>
                        <option value="Em Acompanhamento">Em Acompanhamento</option>
                        <option value="Concluído">Pactuado Concluído</option>
                        <option value="Arquivado">Arquivado</option>
                      </select>
                    </div>

                    {/* Filter Risk */}
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3.5 py-1 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Risco AI:</span>
                      <select
                        value={filterRisk}
                        onChange={e => setFilterRisk(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none flex-1 cursor-pointer"
                        id="filter-risk-select"
                      >
                        <option value="Todos">Qualquer Risco</option>
                        <option value="Baixo">Baixo</option>
                        <option value="Médio">Médio</option>
                        <option value="Alto">Alto</option>
                        <option value="Crítico">Crítico</option>
                      </select>
                    </div>

                    {/* Filter Bairro */}
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3.5 py-1 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Bairro:</span>
                      <select
                        value={filterBairro}
                        onChange={e => setFilterBairro(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none flex-1 cursor-pointer"
                        id="filter-bairro-select"
                      >
                        <option value="Todos">Todos os Bairros</option>
                        {uniqueBairros.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filter Tipo Violacao */}
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3.5 py-1 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Violação:</span>
                      <select
                        value={filterTipoViolacao}
                        onChange={e => setFilterTipoViolacao(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none flex-1 cursor-pointer"
                        id="filter-tipo-violacao-select"
                      >
                        <option value="Todos">Todas as Violações</option>
                        {uniqueTiposViolacao.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filter Date Range */}
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3.5 py-1 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Cadastro:</span>
                      <select
                        value={filterDateRange}
                        onChange={e => setFilterDateRange(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none flex-1 cursor-pointer"
                        id="filter-date-select"
                      >
                        <option value="Todos">Qualquer data</option>
                        <option value="7d">Últimos 7 dias</option>
                        <option value="30d">Últimos 30 dias</option>
                        <option value="365d">Último ano</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* Cases Grid */}
                {filteredCases.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCases.map(c => {
                      
                      const riskColorMap = {
                        Crítico: "bg-rose-50 border-rose-200 text-rose-700",
                        Alto: "bg-orange-50 border-orange-200 text-orange-700",
                        Médio: "bg-amber-50 border-amber-200 text-amber-700",
                        Baixo: "bg-emerald-50 border-emerald-200 text-emerald-700"
                      };

                      const currentRiskColor = riskColorMap[c.nivelRiscoAI as keyof typeof riskColorMap] || "bg-slate-50 border-slate-200 text-slate-600";
                      
                      const completedTasks = c.encaminhamentos?.filter(r => r.status === "Concluído").length || 0;
                      const totalTasks = c.encaminhamentos?.length || 0;
                      const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCaseId(c.id)}
                          className="bg-white border border-slate-100 hover:border-slate-200 hover:shadow-md rounded-3xl p-6 transition-all flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                          id={`case-card-${c.id}`}
                        >
                          <div className="space-y-4">
                            
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 font-extrabold text-sm flex items-center justify-center">
                                  {c.name.substring(0, 2)}
                                </div>
                                <div className="flex flex-col items-start">
                                  <h3 className="font-bold text-slate-800 text-sm font-sans group-hover:text-indigo-600 transition-colors flex items-center">
                                    {c.sigilo !== "Público" && session.role !== "Administrador" && !["Conselho Tutelar", "Assistência Social (CRAS/CREAS)", "Ministério Público"].includes(session.organ) ? (
                                      <span>M. [OCULTO]</span>
                                    ) : (
                                      <PrivacyText text={c.name} type="name" safeMode={safeMode} className="font-bold text-slate-800 text-sm font-sans group-hover:text-indigo-600 transition-colors" />
                                    )}
                                  </h3>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{c.age} anos · {c.sigilo}</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-md uppercase tracking-wide">
                                      {c.bairro || "Centro"}
                                    </span>
                                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-indigo-50/70 text-indigo-700 rounded-md uppercase tracking-wide">
                                      {c.tipoViolacao || "Geral"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold border ${currentRiskColor}`}>
                                  {c.nivelRiscoAI || "Risco N/D"}
                                </span>
                                <button
                                  onClick={(e) => handleDeleteCase(c.id, e)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                  title="Apagar caso do sistema"
                                  id={`btn-delete-case-${c.id}`}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Situation */}
                            <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-3">
                              {c.situation}
                            </p>

                            {/* Present Organs Badges */}
                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                              {c.reunioes?.[0]?.presentOrgans?.slice(0, 3).map((org, idx) => (
                                <span key={idx} className="text-[9px] font-bold bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                                  {org.replace("Assistência Social ", "")}
                                </span>
                              ))}
                              {c.reunioes?.[0]?.presentOrgans && c.reunioes[0].presentOrgans.length > 3 && (
                                <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">
                                  +{c.reunioes[0].presentOrgans.length - 3}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Progress slider bar & actions count */}
                          <div className="pt-5 mt-5 border-t border-slate-50 flex items-center justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase">
                                <span>Andamento</span>
                                <span className="font-mono text-slate-600 font-bold">{progressPct}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }}></div>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Ações</span>
                              <span className="text-xs font-extrabold text-slate-700">{completedTasks}/{totalTasks}</span>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm">
                    <Search size={40} className="stroke-1 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">Nenhum caso encontrado para estes filtros.</p>
                    <p className="text-xs text-slate-400 mt-1">Experimente limpar sua busca ou registrar um novo caso.</p>
                  </div>
                )}

              </motion.div>
            ) : activeTab === "nova-reuniao" ? (
              <motion.div
                key="nova-reuniao"
                variants={pageFlipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ backfaceVisibility: "hidden" }}
              >
                <CaseForm
                  onSaveCase={handleSaveNewCase}
                  activeSession={session}
                  onCancel={() => setActiveTab("dashboard")}
                />
              </motion.div>
            ) : activeTab === "registro-atas" ? (
              <motion.div
                key="registro-atas"
                variants={pageFlipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ backfaceVisibility: "hidden" }}
              >
                <RegistroAtas
                  activeSession={session}
                  realTimeSync={realTimeSync}
                />
              </motion.div>
            ) : null}
        </AnimatePresence>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 px-6 py-4 mt-12 text-center text-xs text-slate-400 font-sans font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>TIO SYSTEM · Formulário Digital Inteligente Intersetorial</span>
          <div className="flex items-center gap-4">
            <span className="text-[10px] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-150 font-bold text-slate-500 uppercase">Versão Homologação 2026</span>
          </div>
        </div>
      </footer>


    </div>
  );
}
