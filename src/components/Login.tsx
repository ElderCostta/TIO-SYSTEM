import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, User, Eye, EyeOff, Shield, CheckCircle, AlertCircle, Download } from "lucide-react";
import Logo from "./Logo";
import { ALL_ORGANS } from "../data";
import { Organ } from "../types";

interface LoginProps {
  onLoginSuccess: (initialOrgan: Organ) => void;
  onInstallPwa: () => void;
}

export default function Login({ onLoginSuccess, onInstallPwa }: LoginProps) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [selectedOrgan, setSelectedOrgan] = React.useState<Organ>("Conselho Tutelar");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Normalize credentials
    const normUser = username.trim().toUpperCase();
    const normPass = password.trim();

    if (!normUser || !normPass) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (normUser === "REDETIO" && normPass === "@Reuniaotio") {
      setIsLoading(true);
      
      // Simulate brief loading effect for realism
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(selectedOrgan);
      }, 800);
    } else {
      setError("Usuário ou senha incorretos. Verifique as credenciais.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden" id="login-container">
      {/* Background Image with elegant overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src="/login_background.jpg" 
          alt="Reunião de Rede de Proteção" 
          className="w-full h-full object-cover scale-105 opacity-55 blur-[1px] select-none"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-teal-950/30"></div>
      </div>

      {/* Background ambient glow shapes */}
      <div className="absolute right-[-10%] top-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute left-[-10%] bottom-[-10%] w-[500px] h-[500px] bg-teal-700/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="w-full max-w-md bg-slate-950/45 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative z-10"
      >
        {/* Logo and branding Header */}
        <div className="mb-8 flex flex-col items-center">
          <Logo variant="vertical" size={64} textColorClassName="text-white" subtitleColorClassName="text-teal-400/80" />
        </div>

        {/* Credentials hints badge */}
        <div className="mb-6 bg-slate-900/80 border border-slate-800/60 p-3.5 rounded-2xl text-center">
          <p className="text-[10px] uppercase font-bold tracking-wider text-teal-400 mb-1.5 flex items-center justify-center gap-1.5">
            <Shield size={12} />
            Credenciais de Acesso à Rede
          </p>
          <div className="flex justify-center gap-4 text-xs font-mono text-slate-300">
            <div>
              <span className="text-slate-500 font-sans mr-1">USUÁRIO:</span>
              <strong className="text-white">REDETIO</strong>
            </div>
            <div>
              <span className="text-slate-500 font-sans mr-1">SENHA:</span>
              <strong className="text-white">@Reuniaotio</strong>
            </div>
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Organ selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Seu Órgão de Atuação
            </label>
            <div className="relative">
              <select
                value={selectedOrgan}
                onChange={(e) => setSelectedOrgan(e.target.value as Organ)}
                className="w-full bg-slate-900 hover:bg-slate-900/90 border border-slate-800 focus:border-teal-500 rounded-2xl py-3 px-4 text-sm text-slate-200 focus:outline-none transition-all cursor-pointer font-medium appearance-none"
              >
                {ALL_ORGANS.map((org) => (
                  <option key={org} value={org} className="bg-slate-950 text-slate-200">
                    {org}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Usuário
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-500">
                <User size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: REDETIO"
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-teal-500 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Senha
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-500">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ex: @Reuniaotio"
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-teal-500 rounded-2xl py-3 pl-11 pr-12 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message with AnimatePresence */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs py-2.5 px-4 rounded-xl flex items-center gap-2"
              >
                <AlertCircle size={14} className="shrink-0 text-rose-400" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-teal-950/50 transition-colors duration-200 mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Autenticando na Rede...</span>
              </>
            ) : (
              <span>Entrar no Sistema</span>
            )}
          </motion.button>
        </form>

        {/* Footer info */}
        <p className="mt-8 text-center text-xs text-slate-500">
          TIO SYSTEM • Rede integrada de proteção social municipal.
        </p>

        {/* PWA Install Link */}
        <div className="mt-5 pt-4 border-t border-slate-900/60 flex justify-center">
          <button
            type="button"
            onClick={onInstallPwa}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-teal-400 hover:text-teal-300 transition-all bg-teal-950/40 border border-teal-900/40 hover:border-teal-800/80 px-4 py-2.5 rounded-2xl cursor-pointer"
            id="btn-login-install-pwa"
          >
            <Download size={14} className="animate-bounce" />
            <span>Baixar / Instalar App no Dispositivo</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
