import React from "react";
import { motion } from "motion/react";

interface LogoProps {
  size?: number;
  showText?: boolean;
  variant?: "horizontal" | "vertical" | "icon";
  textColorClassName?: string;
  subtitleColorClassName?: string;
}

export default function Logo({
  size = 48,
  showText = true,
  variant = "horizontal",
  textColorClassName = "text-slate-800",
  subtitleColorClassName = "text-slate-500"
}: LogoProps) {
  // SVG drawing of the custom tio-system shield logo
  const svgMarkup = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Node lines (Left-Top) */}
      <line
        x1="14"
        y1="31"
        x2="28"
        y2="38"
        stroke="#4db6ac"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Node lines (Left-Bottom) */}
      <line
        x1="14"
        y1="69"
        x2="28"
        y2="62"
        stroke="#4db6ac"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Node lines (Right-Top) */}
      <line
        x1="86"
        y1="31"
        x2="72"
        y2="38"
        stroke="#4db6ac"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Node lines (Right-Bottom) */}
      <line
        x1="86"
        y1="69"
        x2="72"
        y2="62"
        stroke="#4db6ac"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Nodes (Circles) */}
      <circle cx="12" cy="30" r="4.5" fill="#26a69a" />
      <circle cx="12" cy="70" r="4.5" fill="#26a69a" />
      <circle cx="88" cy="30" r="4.5" fill="#26a69a" />
      <circle cx="88" cy="70" r="4.5" fill="#26a69a" />

      {/* Shield filled with light cyan background and teal border */}
      <path
        d="M 50 15 L 28 23 L 28 52 C 28 72, 38 88, 50 95 C 62 88, 72 72, 72 52 L 72 23 Z"
        fill="#e6f4f1"
        stroke="#00695c"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* House Icon inside Shield (continuous line drawing) */}
      <path
        d="M 39 44 L 50 34 L 61 44 V 62 M 44 49 H 56 V 62 H 44 Z"
        stroke="#00352c"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === "icon" || !showText) {
    return svgMarkup;
  }

  if (variant === "vertical") {
    return (
      <motion.div 
        className="flex flex-col items-center text-center space-y-3 font-sans cursor-pointer select-none"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <div className="p-2 bg-teal-50/40 rounded-3xl border border-teal-100/50 shadow-inner flex items-center justify-center">
          {svgMarkup}
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase">
            <span className={textColorClassName}>TIO</span>
            <span className="text-teal-700">SYSTEM</span>
          </h1>
          <p className={`text-xs font-semibold ${subtitleColorClassName} mt-1`}>
            Rede integrada de proteção social
          </p>
        </div>
      </motion.div>
    );
  }

  // Horizontal variant (default)
  return (
    <motion.div 
      className="flex items-center gap-3.5 font-sans cursor-pointer select-none"
      whileHover={{ scale: 1.04, x: 2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {svgMarkup}
      <div className="flex flex-col justify-center">
        <h1 className="text-xl font-black tracking-tight leading-none uppercase">
          <span className={textColorClassName}>TIO</span>
          <span className="text-teal-700">SYSTEM</span>
        </h1>
        <p className={`text-[11px] font-semibold tracking-wide uppercase ${subtitleColorClassName} mt-1 leading-none`}>
          Rede integrada de proteção social
        </p>
      </div>
    </motion.div>
  );
}
