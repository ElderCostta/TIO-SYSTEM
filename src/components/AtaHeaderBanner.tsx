import React from "react";
import { CONSELHO_TUTELAR_DATA_URL } from "../utils/councilSeal";

/**
 * Reusable React component for displaying the official Header Banner of the Ata
 * with the attached Conselho Tutelar logomark in on-screen previews.
 */
export default function AtaHeaderBanner({ className = "" }: { className?: string }) {
  return (
    <div className={`text-center pb-4 mb-6 border-b-[2.5px] border-slate-800 select-text ${className}`}>
      <div className="flex items-center justify-center mb-3">
        <img
          src={CONSELHO_TUTELAR_DATA_URL}
          alt="Logomarca Oficial do Grupo TIO"
          className="w-[96px] h-[96px] object-contain rounded-full p-1 bg-white border-2 border-sky-500/50 shadow-md ring-4 ring-sky-50 select-none"
        />
      </div>
      <div className="space-y-1">
        <div className="text-[#0c4a80] text-lg sm:text-xl font-extrabold tracking-tight">
          Grupo de Integração Operacional de Direitos da Criança e do Adolescente
        </div>
        <div className="w-36 h-[3px] mx-auto my-1.5 bg-gradient-to-r from-[#0056b3] to-[#f57c00] rounded-full" />
        <div className="text-xs font-bold text-[#0056b3] uppercase tracking-wider">
          Conselho Tutelar <span className="text-slate-300 mx-1.5">|</span> Currais Novos - RN <span className="text-slate-300 mx-1.5">|</span> <span className="text-orange-500">Grupo TIO</span>
        </div>
      </div>
    </div>
  );
}
