import React from "react";
import { Eye, EyeOff, Shield } from "lucide-react";

interface PrivacyTextProps {
  text: string;
  type: "name" | "address" | "text";
  safeMode: boolean;
  className?: string;
}

export default function PrivacyText({ text, type, safeMode, className = "" }: PrivacyTextProps) {
  const [isRevealed, setIsRevealed] = React.useState(false);

  if (!safeMode) return <span className={className}>{text}</span>;

  const getMaskedText = () => {
    if (type === "name") {
      const parts = text.trim().split(/\s+/);
      const initials = parts.map(p => p[0] ? `${p[0].toUpperCase()}.` : "").join(" ");
      return `${initials} ***`;
    } else if (type === "address") {
      return "Endereço Oculto (Modo Seguro)";
    }
    return "Informação Restrita (Modo Seguro)";
  };

  return (
    <span 
      className={`inline-flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        setIsRevealed(!isRevealed);
      }}
    >
      <span 
        className={`transition-all duration-300 rounded-md px-2 py-0.5 border ${
          isRevealed 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200/60 font-semibold" 
            : "bg-slate-100/60 text-slate-500 border-slate-200/40 select-none filter blur-[2px] hover:blur-0"
        }`}
        title={isRevealed ? "Clique para ocultar" : "Passe o mouse ou clique para revelar dados reais"}
      >
        {isRevealed ? text : getMaskedText()}
      </span>
      <span
        className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
        title={isRevealed ? "Ocultar" : "Revelar"}
      >
        {isRevealed ? <EyeOff size={11} /> : <Eye size={11} />}
      </span>
    </span>
  );
}
