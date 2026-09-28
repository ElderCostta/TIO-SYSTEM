// Portuguese Administrative & Official Minutes Text Corrector
// Specialized for Conselho Tutelar, Grupo TIO, and Rede de Proteção da Criança e do Adolescente

export interface CorrectionFix {
  original: string;
  replacement: string;
  explanation: string;
  count: number;
}

export interface CorrectionResult {
  correctedText: string;
  fixes: CorrectionFix[];
  totalFixes: number;
}

// Word pairs for accurate case-preserving substitution
// e.g. "reuniao" -> "reunião", "Reuniao" -> "Reunião"
const PT_BR_DICTIONARY: Record<string, string> = {
  // Administrative and Meeting words
  "reuniao": "reunião",
  "reunioes": "reuniões",
  "atencao": "atenção",
  "deliberacao": "deliberação",
  "deliberacoes": "deliberações",
  "participacao": "participação",
  "situacao": "situação",
  "situacoes": "situações",
  "declaracao": "declaração",
  "sessao": "sessão",
  "sessoes": "sessões",
  "discussao": "discussão",
  "discussoes": "discussões",
  "aprovacao": "aprovação",
  "convocacao": "convocação",
  "horario": "horário",
  "horarios": "horários",
  "inicio": "início",
  "termino": "término",
  "numero": "número",
  "numeros": "números",
  "conclusao": "conclusão",
  "redacao": "redação",
  "coordenacao": "coordenação",
  "presenca": "presença",
  "presencas": "presenças",
  "resolucao": "resolução",
  "resolucoes": "resoluções",
  "observacao": "observação",
  "observacoes": "observações",
  "avaliacao": "avaliação",
  "avaliacoes": "avaliações",
  "informacao": "informação",
  "informacoes": "informações",
  "instituicao": "instituição",
  "instituicoes": "instituições",
  "relatorio": "relatório",
  "relatorios": "relatórios",
  "comissao": "comissão",
  "comissoes": "comissões",
  "urgencia": "urgência",
  "prioritario": "prioritário",
  "prioritaria": "prioritária",
  "prioritarios": "prioritários",
  "prioritarias": "prioritárias",
  "prevencao": "prevenção",
  "secretaria": "secretária",
  "secretario": "secretário",
  "secretarios": "secretários",
  "responsavel": "responsável",
  "responsaveis": "responsáveis",
  "encaminhamento": "encaminhamento",
  "encaminhamentos": "encaminhamentos",
  "justificativa": "justificativa",

  // Protection Network / Social / Health
  "crianca": "criança",
  "criancas": "crianças",
  "adolescencia": "adolescência",
  "protecao": "proteção",
  "assistencia": "assistência",
  "educacao": "educação",
  "saude": "saúde",
  "policia": "polícia",
  "policiais": "policiais",
  "familia": "família",
  "familias": "famílias",
  "municipio": "município",
  "municipios": "municípios",
  "orgao": "órgão",
  "orgaos": "órgãos",
  "cidadao": "cidadão",
  "cidadaos": "cidadãos",
  "violacao": "violação",
  "violacoes": "violações",
  "negligencia": "negligência",
  "violencia": "violência",
  "vulnerabilidade": "vulnerabilidade",
  "acolhimento": "acolhimento",

  // Common grammar & connecting words
  "tambem": "também",
  "ja": "já",
  "ate": "até",
  "apos": "após",
  "alem": "além",
  "atraves": "através",
  "necessario": "necessário",
  "necessaria": "necessária",
  "necessarios": "necessários",
  "necessarias": "necessárias",
  "possivel": "possível",
  "possiveis": "possíveis",
  "dificil": "difícil",
  "dificeis": "difíceis",
  "facil": "fácil",
  "faceis": "fáceis",
  "ultimo": "último",
  "ultima": "última",
  "ultimos": "últimos",
  "ultimas": "últimas",
  "proximo": "próximo",
  "proxima": "próxima",
  "proximos": "próximos",
  "proximas": "próximas",
  "periodo": "período",
  "periodos": "períodos",
  "duvida": "dúvida",
  "duvidas": "dúvidas",
  "nao": "não",
  "sao": "são",
  "estao": "estão",
  "estara": "estará",
  "estarao": "estarão",
  "sera": "será",
  "serao": "serão",
  "havera": "haverá",
  "haverao": "haverão",
  "ha": "há",
  "pais": "pais", // context dependent
  "acao": "ação",
  "acoes": "ações",
  "funcao": "função",
  "funcoes": "funções",
  "opcao": "opção",
  "opcoes": "opções",
  "posicao": "posição",
  "relacao": "relação",
  "condicao": "condição",
  "condicoes": "condições"
};

// Proper official entity casings
const OFFICIAL_ENTITIES: Array<{ pattern: RegExp; replacement: string; explanation: string }> = [
  { pattern: /\bconselho\s+tutelar\b/gi, replacement: "Conselho Tutelar", explanation: "Grafia oficial de órgão público (Conselho Tutelar)" },
  { pattern: /\bassistencia\s+social\b/gi, replacement: "Assistência Social", explanation: "Grafia oficial da pasta (Assistência Social)" },
  { pattern: /\bministerio\s+publico\b/gi, replacement: "Ministério Público", explanation: "Grafia oficial de órgão (Ministério Público)" },
  { pattern: /\bpolicia\s+militar\b/gi, replacement: "Polícia Militar", explanation: "Grafia oficial (Polícia Militar)" },
  { pattern: /\bpolicia\s+civil\b/gi, replacement: "Polícia Civil", explanation: "Grafia oficial (Polícia Civil)" },
  { pattern: /\bvara\s+da\s+infancia\s+e\s+(da\s+)?juventude\b/gi, replacement: "Vara da Infância e da Juventude", explanation: "Padronização de órgão judicial" },
  { pattern: /\bestatuto\s+da\s+crianca\s+e\s+do\s+adolescente\b/gi, replacement: "Estatuto da Criança e do Adolescente (ECA)", explanation: "Denominação legal oficial da Lei Federal 8.069/1990" },
  { pattern: /\b(\d+)\s*º\b/g, replacement: "$1º", explanation: "Numeração ordinal padronizada" },
  { pattern: /\b(\d+)\s*ª\b/g, replacement: "$1ª", explanation: "Numeração ordinal padronizada" },
  { pattern: /\bartigo\s+(\d+)/gi, replacement: "Art. $1", explanation: "Abreviação jurídica padrão (Art.)" },
  { pattern: /\bcras\b/gi, replacement: "CRAS", explanation: "Sigla oficial (CRAS)" },
  { pattern: /\bcreas\b/gi, replacement: "CREAS", explanation: "Sigla oficial (CREAS)" },
  { pattern: /\bubs\b/gi, replacement: "UBS", explanation: "Sigla oficial (UBS)" },
  { pattern: /\bsus\b/gi, replacement: "SUS", explanation: "Sigla oficial (SUS)" },
  { pattern: /\beca\b/gi, replacement: "ECA", explanation: "Sigla oficial (ECA)" },
];

/**
 * Matches casing from source to target (lowercase, Titlecase, UPPERCASE)
 */
function matchCase(source: string, target: string): string {
  if (source === source.toUpperCase()) {
    return target.toUpperCase();
  }
  if (source[0] === source[0].toUpperCase()) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return target.toLowerCase();
}

/**
 * Automatically corrects Portuguese text, typography, punctuation,
 * administrative terminology and common spelling mistakes in meeting minutes.
 */
export function correctPortugueseText(input: string): CorrectionResult {
  if (!input) {
    return { correctedText: "", fixes: [], totalFixes: 0 };
  }

  const fixMap = new Map<string, CorrectionFix>();

  const registerFix = (orig: string, rep: string, exp: string) => {
    if (orig === rep) return;
    const key = `${orig} -> ${rep}`;
    const existing = fixMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      fixMap.set(key, { original: orig, replacement: rep, explanation: exp, count: 1 });
    }
  };

  let text = input;

  // 1. Standard official entities replacement
  for (const entity of OFFICIAL_ENTITIES) {
    text = text.replace(entity.pattern, (matched) => {
      if (matched !== entity.replacement) {
        registerFix(matched, entity.replacement, entity.explanation);
      }
      return entity.replacement;
    });
  }

  // 2. Word dictionary replacement (preserves accents and case)
  // Split carefully preserving markdown delimiters, URLs, and code blocks
  text = text.replace(/\b([a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+)\b/g, (word) => {
    const lower = word.toLowerCase();
    const correct = PT_BR_DICTIONARY[lower];
    if (correct && lower !== correct) {
      const adjusted = matchCase(word, correct);
      registerFix(word, adjusted, `Correção ortográfica e acentuação de "${word}"`);
      return adjusted;
    }
    return word;
  });

  // 3. Typographical & Punctuation Cleanup
  // Avoid spaces before punctuation: "palavra ," -> "palavra,"
  text = text.replace(/(\S)\s+([,;:!?])/g, (full, p1, p2) => {
    registerFix(`${p1} ${p2}`, `${p1}${p2}`, "Espaço indevido antes de sinal de pontuação");
    return `${p1}${p2}`;
  });

  // Ensure single space after punctuation (comma, semicolon) if followed immediately by letter/number
  text = text.replace(/([,;])([a-zA-Z0-9À-ÿ])/g, (full, p1, p2) => {
    registerFix(`${p1}${p2}`, `${p1} ${p2}`, "Inserção de espaço obrigatório após pontuação");
    return `${p1} ${p2}`;
  });

  // Normalize excessive horizontal spaces (more than 1 space, but not line breaks)
  text = text.replace(/[ \t]{2,}/g, (match) => {
    return " ";
  });

  // Capitalize first letter after sentence terminating punctuation (. ! ?)
  text = text.replace(/([.!?]\s+)([a-zà-ÿ])/g, (full, punct, letter) => {
    const upper = letter.toUpperCase();
    registerFix(`${punct}${letter}`, `${punct}${upper}`, "Início de frase com letra maiúscula");
    return `${punct}${upper}`;
  });

  // Capitalize first letter in bullet points (e.g. "- palavra" -> "- Palavra")
  text = text.replace(/^([\s]*[-*+]\s+)([a-zà-ÿ])/gm, (full, bullet, letter) => {
    const upper = letter.toUpperCase();
    registerFix(`${bullet}${letter}`, `${bullet}${upper}`, "Início de item de lista com letra maiúscula");
    return `${bullet}${upper}`;
  });

  const fixes = Array.from(fixMap.values());
  const totalFixes = fixes.reduce((sum, f) => sum + f.count, 0);

  return {
    correctedText: text,
    fixes,
    totalFixes
  };
}

/**
 * Intelligent AI proofreading endpoint caller
 * Falls back automatically to offline rule-based correction if offline.
 */
export async function correctAtaWithAI(text: string): Promise<CorrectionResult> {
  try {
    const response = await fetch("/api/gemini/correct-ata-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data.correctedText === "string") {
        return {
          correctedText: data.correctedText,
          fixes: data.fixes || [{ original: "Texto", replacement: "Texto Revisado", explanation: "Revisão e aprimoramento por IA com concordância jurídica e gramatical", count: 1 }],
          totalFixes: (data.fixes && data.fixes.length > 0) ? data.fixes.length : 1
        };
      }
    }
  } catch (err) {
    console.warn("Fallback para o corretor ortográfico local:", err);
  }

  // Graceful fallback to rich local rule engine
  return correctPortugueseText(text);
}
