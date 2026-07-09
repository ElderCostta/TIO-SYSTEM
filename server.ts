import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini client getter to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured in environment variables. Please configure it in Settings > Secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Endpoint to suggest actions based on case description
app.post("/api/gemini/suggest-actions", async (req, res) => {
  try {
    const { title, age, situation, situationDetails, urgentDemands } = req.body;
    
    if (!situation && !situationDetails) {
      return res.status(400).json({ error: "Descrição da situação ou caso é necessária." });
    }

    const ai = getGeminiClient();

    const prompt = `Como um assistente inteligente especializado na Rede de Proteção Social do Brasil (Conselho Tutelar, CRAS, CREAS, Saúde, Educação, Ministério Público, etc.), analise o caso abaixo e sugira ações práticas de encaminhamento (encaminhamentos).

Caso:
- Nome/Iniciais: ${title || "Não informado"}
- Idade: ${age || "Não informada"}
- Resumo da Situação: ${situation || "Não informado"}
- Detalhes do Caso: ${situationDetails || "Não informado"}
- Demandas Urgentes: ${urgentDemands || "Não informado"}

Retorne exatamente um array de JSON representando as ações sugeridas. Cada ação deve conter:
1. "acao": Descrição clara e direta do que deve ser feito (máximo 120 caracteres).
2. "orgaoResponsavel": O órgão mais adequado para executar essa ação. Escolha rigorosamente entre: "Conselho Tutelar", "Assistência Social (CRAS/CREAS)", "Saúde", "Educação", "Ministério Público" ou "Polícia Civil/Militar".
3. "prazoDias": Um prazo razoável em dias para conclusão (ex: 3, 5, 10, 15, 30).
4. "justificativa": Uma breve explicação do motivo dessa ação ser prioritária (máximo 150 caracteres).
5. "prioridade": "Alta", "Média" ou "Baixa".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              acao: { type: Type.STRING },
              orgaoResponsavel: { type: Type.STRING },
              prazoDias: { type: Type.INTEGER },
              justificativa: { type: Type.STRING },
              prioridade: { type: Type.STRING }
            },
            required: ["acao", "orgaoResponsavel", "prazoDias", "justificativa", "prioridade"]
          }
        }
      }
    });

    const suggestions = JSON.parse(response.text || "[]");
    res.json({ suggestions });
  } catch (error: any) {
    console.error("Erro na sugestão de ações:", error);
    res.status(500).json({ 
      error: error.message || "Erro desconhecido ao chamar a API Gemini." 
    });
  }
});

// Endpoint to summarize a case and define risk level
app.post("/api/gemini/summarize-case", async (req, res) => {
  try {
    const { title, age, situation, situationDetails, urgentDemands } = req.body;
    
    if (!situation && !situationDetails) {
      return res.status(400).json({ error: "Descrição da situação é necessária." });
    }

    const ai = getGeminiClient();

    const prompt = `Analise a situação de vulnerabilidade relatada e forneça:
1. Um resumo curto e objetivo em apenas 1 ou 2 frases (máximo 180 caracteres).
2. Classificação de urgência/risco: Escolha entre "Baixo", "Médio", "Alto" ou "Crítico".
3. Principais vulnerabilidades identificadas (lista de até 3 itens curtos).

Caso:
- Nome/Iniciais: ${title || "Não informado"}
- Idade: ${age || "Não informada"}
- Resumo: ${situation || "Não informado"}
- Detalhes: ${situationDetails || "Não informado"}
- Demandas: ${urgentDemands || "Não informado"}

Retorne exatamente um objeto JSON contendo:
{
  "resumoInteligente": "...",
  "nivelRisco": "...",
  "vulnerabilidades": ["...", "...", "..."]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resumoInteligente: { type: Type.STRING },
            nivelRisco: { type: Type.STRING },
            vulnerabilidades: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["resumoInteligente", "nivelRisco", "vulnerabilidades"]
        }
      }
    });

    const summary = JSON.parse(response.text || "{}");
    res.json({ summary });
  } catch (error: any) {
    console.error("Erro no resumo de caso:", error);
    res.status(500).json({ 
      error: error.message || "Erro desconhecido ao chamar a API Gemini." 
    });
  }
});

// Endpoint to generate formal minutes
app.post("/api/gemini/generate-minutes", async (req, res) => {
  try {
    const { meeting, assistido, discussions, encaminhamentos } = req.body;

    const ai = getGeminiClient();

    const prompt = `Gere uma Ata de Reunião de Caso Intersetorial oficial e altamente profissional, formatada em Markdown, baseando-se nas informações reais fornecidas.

Reunião:
- Data/Hora: ${meeting.date} às ${meeting.time}
- Local/Formato: ${meeting.location}
- Órgão Responsável: ${meeting.responsibleOrgan}
- Responsável: ${meeting.responsiblePerson}
- Órgãos Presentes: ${meeting.presentOrgans?.join(", ") || "Nenhum informado"}

Assistido:
- Identificação: ${assistido.name} (${assistido.age} anos)
- Endereço: ${assistido.address || "Não informado"}
- Resumo do Caso: ${assistido.situation}

Discussões registradas na reunião:
${discussions || "Não informado"}

Encaminhamentos e Decisões pactuadas:
${JSON.stringify(encaminhamentos, null, 2)}

A ata em Markdown deve ser estruturada profissionalmente com os seguintes tópicos:
1. Título formal: "ATA DE REUNIÃO DE REDE INTERSETORIAL - CASO ${assistido.name.toUpperCase()}"
2. Cabeçalho de Identificação (data, local, órgãos presentes)
3. Relato do Caso e Discussão Intersetorial (síntese fluida e formal das discussões)
4. Tabela de Encaminhamentos Pactuados (colunas: Ação, Órgão Responsável, Prazo, Prioridade)
5. Encerramento formal e campo para assinaturas dos órgãos presentes.

Retorne APENAS o conteúdo em Markdown, pronto para visualização, sem blocos de código com 'markdown' envolta, apenas o texto Markdown cru.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ markdown: response.text });
  } catch (error: any) {
    console.error("Erro na geração da ata:", error);
    res.status(500).json({ 
      error: error.message || "Erro desconhecido ao chamar a API Gemini." 
    });
  }
});

// Real-time synchronization in-memory database endpoints
let serverGeneralAtas: any[] = [];
let serverCases: any[] = [];

// Endpoint to get synchronized general minutes (atas)
app.get("/api/sync/atas", (req, res) => {
  res.json({ atas: serverGeneralAtas });
});

// Endpoint to update synchronized general minutes (atas)
app.post("/api/sync/atas", (req, res) => {
  const { atas } = req.body;
  if (Array.isArray(atas)) {
    serverGeneralAtas = atas;
  }
  res.json({ success: true, atas: serverGeneralAtas });
});

// Endpoint to get synchronized cases
app.get("/api/sync/cases", (req, res) => {
  res.json({ cases: serverCases });
});

// Endpoint to update synchronized cases
app.post("/api/sync/cases", (req, res) => {
  const { cases } = req.body;
  if (Array.isArray(cases)) {
    serverCases = cases;
  }
  res.json({ success: true, cases: serverCases });
});

// Setup Vite Dev Server / Static Hosting

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only listen if not running in Vercel Serverless environment
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
