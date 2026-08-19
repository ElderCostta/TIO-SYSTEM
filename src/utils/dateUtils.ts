// Utility functions for safe date handling without UTC timezone distortions

export const getLocalTodayISO = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateBR = (dateStr?: string): string => {
  if (!dateStr) return "Sem data";
  const clean = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.trim();
  
  if (clean.includes("/")) {
    const parts = clean.split("/");
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        // Already DD/MM/YYYY
        return `${parts[0].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[2]}`;
      } else if (parts[0].length === 4) {
        // YYYY/MM/DD
        return `${parts[2].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[0]}`;
      }
    }
  }
  
  if (clean.includes("-")) {
    const parts = clean.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        const [y, m, d] = parts;
        return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY
        const [d, m, y] = parts;
        return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
      }
    }
  }
  
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("pt-BR");
};

export const getPortugueseDateInWords = (dateStr?: string): { day: string; month: string; year: string } => {
  if (!dateStr) return { day: "____", month: "____________________", year: "______" };
  
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const clean = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.trim();
  
  let day = "";
  let month = "";
  let year = "";

  if (clean.includes("-")) {
    const parts = clean.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        year = parts[0];
        const mIdx = parseInt(parts[1], 10) - 1;
        month = monthNames[mIdx] || "____________________";
        day = parseInt(parts[2], 10).toString().padStart(2, "0");
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY
        day = parseInt(parts[0], 10).toString().padStart(2, "0");
        const mIdx = parseInt(parts[1], 10) - 1;
        month = monthNames[mIdx] || "____________________";
        year = parts[2];
      }
    }
  } else if (clean.includes("/")) {
    const parts = clean.split("/");
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        // DD/MM/YYYY
        day = parseInt(parts[0], 10).toString().padStart(2, "0");
        const mIdx = parseInt(parts[1], 10) - 1;
        month = monthNames[mIdx] || "____________________";
        year = parts[2];
      } else if (parts[0].length === 4) {
        // YYYY/MM/DD
        year = parts[0];
        const mIdx = parseInt(parts[1], 10) - 1;
        month = monthNames[mIdx] || "____________________";
        day = parseInt(parts[2], 10).toString().padStart(2, "0");
      }
    }
  }

  if (!day || !month || !year) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      day = d.getDate().toString().padStart(2, "0");
      month = monthNames[d.getMonth()] || "____________________";
      year = d.getFullYear().toString();
    } else {
      return { day: "____", month: "____________________", year: "______" };
    }
  }

  return { day, month, year };
};

export const extractYear = (dateStr?: string): string => {
  if (!dateStr) return new Date().getFullYear().toString();
  const clean = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.trim();
  if (clean.includes("-")) {
    const parts = clean.split("-");
    if (parts[0].length === 4) return parts[0];
    if (parts[2].length === 4) return parts[2];
  }
  if (clean.includes("/")) {
    const parts = clean.split("/");
    if (parts[2].length === 4) return parts[2];
    if (parts[0].length === 4) return parts[0];
  }
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) ? d.getFullYear().toString() : new Date().getFullYear().toString();
};

export const formatDateTimeBR = (dateStr?: string): string => {
  if (!dateStr) return "Sem data";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return formatDateBR(dateStr);
  return `${d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
};
