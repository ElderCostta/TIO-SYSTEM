import express from "express";
import path from "path";
import fs from "fs";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { INITIAL_CASES, DEFAULT_GENERAL_ATAS } from "./src/data";

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

// Real-time synchronization Firestore database integration
let serverGeneralAtas: any[] = [...DEFAULT_GENERAL_ATAS];
let serverCases: any[] = [...INITIAL_CASES];

// Lazy-initialized Firestore DB instance
let db: Firestore | null = null;
let initializedFirebase = false;

function getFirestoreDb(): Firestore | null {
  if (initializedFirebase) return db;
  initializedFirebase = true;

  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) {
      console.warn("firebase-applet-config.json não foi encontrado. Usando dados em memória.");
      return null;
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (!config.projectId) {
      console.warn("Project ID ausente no firebase-applet-config.json. Usando dados em memória.");
      return null;
    }

    // Set the environment variable for database selection
    if (config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)") {
      process.env.FIRESTORE_DATABASE = config.firestoreDatabaseId;
    }

    // Try initializing firebase-admin
    if (getApps().length === 0) {
      initializeApp({
        projectId: config.projectId,
      });
    }
    
    if (config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)") {
      db = getFirestore(config.firestoreDatabaseId);
    } else {
      db = getFirestore();
    }
    console.log(`Firebase Admin inicializado com sucesso para o projeto ${config.projectId}, database: ${config.firestoreDatabaseId || "(default)"}`);
    return db;
  } catch (error) {
    console.error("Erro ao inicializar o Firebase Admin. O aplicativo continuará usando dados em memória:", error);
    db = null;
    return null;
  }
}

async function fetchCasesFromFirestore(): Promise<any[]> {
  const firestore = getFirestoreDb();
  if (!firestore) {
    return serverCases;
  }
  try {
    const snapshot = await firestore.collection("cases").get();
    if (snapshot.empty) {
      console.log("Banco de dados 'cases' vazio. Populando com casos iniciais...");
      const batch = firestore.batch();
      for (const item of INITIAL_CASES) {
        const docRef = firestore.collection("cases").doc(item.id);
        batch.set(docRef, item);
      }
      await batch.commit();
      serverCases = [...INITIAL_CASES];
      return serverCases;
    }

    const cases: any[] = [];
    snapshot.forEach(doc => {
      cases.push(doc.data());
    });
    cases.sort((a, b) => {
      const dateA = new Date(a.dataCriacao || 0).getTime();
      const dateB = new Date(b.dataCriacao || 0).getTime();
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return dateA - dateB;
      }
      return 0;
    });
    serverCases = cases;
    return serverCases;
  } catch (error) {
    console.error("Erro ao carregar casos do Firestore, usando fallback em memória:", error);
    return serverCases;
  }
}

async function fetchAtasFromFirestore(): Promise<any[]> {
  const firestore = getFirestoreDb();
  if (!firestore) {
    return serverGeneralAtas;
  }
  try {
    const snapshot = await firestore.collection("atas").get();
    if (snapshot.empty) {
      console.log("Banco de dados 'atas' vazio. Populando com atas iniciais...");
      const batch = firestore.batch();
      for (const item of DEFAULT_GENERAL_ATAS) {
        const docRef = firestore.collection("atas").doc(item.id);
        batch.set(docRef, item);
      }
      await batch.commit();
      serverGeneralAtas = [...DEFAULT_GENERAL_ATAS];
      return serverGeneralAtas;
    }

    const atas: any[] = [];
    snapshot.forEach(doc => {
      atas.push(doc.data());
    });
    atas.sort((a, b) => {
      if (a.numero && b.numero) {
        return b.numero - a.numero;
      }
      const dateA = new Date(a.date || a.dataCriacao || 0).getTime();
      const dateB = new Date(b.date || b.dataCriacao || 0).getTime();
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return dateB - dateA;
      }
      return 0;
    });
    serverGeneralAtas = atas;
    return serverGeneralAtas;
  } catch (error) {
    console.error("Erro ao carregar atas do Firestore, usando fallback em memória:", error);
    return serverGeneralAtas;
  }
}

async function saveCaseToFirestore(caseItem: any): Promise<void> {
  const existingIndex = serverCases.findIndex(c => c.id === caseItem.id);
  if (existingIndex !== -1) {
    serverCases[existingIndex] = caseItem;
  } else {
    serverCases.push(caseItem);
  }

  const firestore = getFirestoreDb();
  if (!firestore) return;
  try {
    await firestore.collection("cases").doc(caseItem.id).set(caseItem);
    console.log(`Caso ${caseItem.id} salvo com sucesso no Firestore.`);
  } catch (error) {
    console.error(`Erro ao salvar caso ${caseItem.id} no Firestore:`, error);
  }
}

async function deleteCaseFromFirestore(id: string): Promise<void> {
  serverCases = serverCases.filter(c => c.id !== id);

  const firestore = getFirestoreDb();
  if (!firestore) return;
  try {
    await firestore.collection("cases").doc(id).delete();
    console.log(`Caso ${id} deletado com sucesso do Firestore.`);
  } catch (error) {
    console.error(`Erro ao deletar caso ${id} do Firestore:`, error);
  }
}

async function resetCasesInFirestore(): Promise<void> {
  serverCases = [...INITIAL_CASES];

  const firestore = getFirestoreDb();
  if (!firestore) return;
  try {
    const snapshot = await firestore.collection("cases").get();
    const batch = firestore.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    const insertBatch = firestore.batch();
    for (const item of INITIAL_CASES) {
      const docRef = firestore.collection("cases").doc(item.id);
      insertBatch.set(docRef, item);
    }
    await insertBatch.commit();
    console.log("Banco de dados 'cases' resetado com sucesso no Firestore.");
  } catch (error) {
    console.error("Erro ao resetar casos no Firestore:", error);
  }
}

async function saveAtaToFirestore(ata: any): Promise<void> {
  const existingIndex = serverGeneralAtas.findIndex(a => a.id === ata.id);
  if (existingIndex !== -1) {
    serverGeneralAtas[existingIndex] = ata;
  } else {
    serverGeneralAtas = [ata, ...serverGeneralAtas];
  }

  const firestore = getFirestoreDb();
  if (!firestore) return;
  try {
    await firestore.collection("atas").doc(ata.id).set(ata);
    console.log(`Ata ${ata.id} salva com sucesso no Firestore.`);
  } catch (error) {
    console.error(`Erro ao salvar ata ${ata.id} no Firestore:`, error);
  }
}

async function deleteAtaFromFirestore(id: string): Promise<void> {
  serverGeneralAtas = serverGeneralAtas.filter(a => a.id !== id);

  const firestore = getFirestoreDb();
  if (!firestore) return;
  try {
    await firestore.collection("atas").doc(id).delete();
    console.log(`Ata ${id} deletada com sucesso do Firestore.`);
  } catch (error) {
    console.error(`Erro ao deletar ata ${id} do Firestore:`, error);
  }
}

async function syncAllCasesToFirestore(cases: any[]): Promise<void> {
  serverCases = cases;
  const firestore = getFirestoreDb();
  if (!firestore) return;
  try {
    const batch = firestore.batch();
    for (const item of cases) {
      const docRef = firestore.collection("cases").doc(item.id);
      batch.set(docRef, item);
    }
    await batch.commit();
    console.log("Todos os casos sincronizados com sucesso no Firestore.");
  } catch (error) {
    console.error("Erro ao sincronizar todos os casos no Firestore:", error);
  }
}

async function syncAllAtasToFirestore(atas: any[]): Promise<void> {
  serverGeneralAtas = atas;
  const firestore = getFirestoreDb();
  if (!firestore) return;
  try {
    const batch = firestore.batch();
    for (const item of atas) {
      const docRef = firestore.collection("atas").doc(item.id);
      batch.set(docRef, item);
    }
    await batch.commit();
    console.log("Todas as atas sincronizadas com sucesso no Firestore.");
  } catch (error) {
    console.error("Erro ao sincronizar todas as atas no Firestore:", error);
  }
}

// Middleware to disable caching for sync endpoints to guarantee real-time updates on mobile
app.use("/api/sync", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Endpoint to get synchronized general minutes (atas)
app.get("/api/sync/atas", async (req, res) => {
  const list = await fetchAtasFromFirestore();
  res.json({ atas: list });
});

// Endpoint to update synchronized general minutes (atas) - kept for fallback
app.post("/api/sync/atas", async (req, res) => {
  const { atas } = req.body;
  if (Array.isArray(atas)) {
    await syncAllAtasToFirestore(atas);
  }
  res.json({ success: true, atas: serverGeneralAtas });
});

// Endpoint to save or update a single general minute (ata)
app.post("/api/sync/atas/save", async (req, res) => {
  const { ata } = req.body;
  if (ata && typeof ata === "object" && ata.id) {
    await saveAtaToFirestore(ata);
  }
  res.json({ success: true, atas: serverGeneralAtas });
});

// Endpoint to delete a single general minute (ata)
app.post("/api/sync/atas/delete", async (req, res) => {
  const { id } = req.body;
  if (id) {
    await deleteAtaFromFirestore(id);
  }
  res.json({ success: true, atas: serverGeneralAtas });
});

// Endpoint to get synchronized cases
app.get("/api/sync/cases", async (req, res) => {
  const list = await fetchCasesFromFirestore();
  res.json({ cases: list });
});

// Endpoint to update synchronized cases - kept for fallback
app.post("/api/sync/cases", async (req, res) => {
  const { cases } = req.body;
  if (Array.isArray(cases)) {
    await syncAllCasesToFirestore(cases);
  }
  res.json({ success: true, cases: serverCases });
});

// Endpoint to save or update a single case
app.post("/api/sync/cases/save", async (req, res) => {
  const { caseItem } = req.body;
  if (caseItem && typeof caseItem === "object" && caseItem.id) {
    await saveCaseToFirestore(caseItem);
  }
  res.json({ success: true, cases: serverCases });
});

// Endpoint to delete a single case
app.post("/api/sync/cases/delete", async (req, res) => {
  const { id } = req.body;
  if (id) {
    await deleteCaseFromFirestore(id);
  }
  res.json({ success: true, cases: serverCases });
});

// Endpoint to reset cases to original defaults
app.post("/api/sync/cases/reset", async (req, res) => {
  await resetCasesInFirestore();
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
