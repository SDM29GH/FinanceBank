import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { INITIAL_FINTECH_DOCS, chunkDocuments } from "./src/data/fintechDocs.js";
import { PYTHON_REPO_FILES } from "./src/data/pythonCode.js";
import { FintechDocument, DocumentChunk } from "./src/types.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // In-memory state for documents & chunks
  let activeDocs: FintechDocument[] = [...INITIAL_FINTECH_DOCS];
  let activeChunks: DocumentChunk[] = chunkDocuments(activeDocs);

  // Initialize Gemini AI Client lazily/safely
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY no está disponible en process.env");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // 1. GET /api/documents - List available Fintech PDF documents
  app.get("/api/documents", (req, res) => {
    res.json({
      documents: activeDocs,
      totalDocuments: activeDocs.length,
      totalChunks: activeChunks.length,
    });
  });

  // 2. POST /api/documents/add - Add custom text/PDF document
  app.post("/api/documents/add", (req, res) => {
    try {
      const { title, content, filename, category } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: "Título y contenido son requeridos." });
      }

      const newDoc: FintechDocument = {
        id: `custom-doc-${Date.now()}`,
        title: title.trim(),
        category: category || "custom",
        filename: filename || `${title.replace(/\s+/g, "_")}.pdf`,
        pagesCount: Math.ceil(content.length / 1000) || 1,
        description: `Documento cargado por el usuario: ${title}`,
        pages: [
          {
            pageNumber: 1,
            content: content.trim(),
          },
        ],
      };

      activeDocs.push(newDoc);
      activeChunks = chunkDocuments(activeDocs);

      return res.json({
        message: "Documento agregado exitosamente",
        document: newDoc,
        totalDocuments: activeDocs.length,
        totalChunks: activeChunks.length,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 3. POST /api/rag/query - Perform RAG search & Gemini generation
  app.post("/api/rag/query", async (req, res) => {
    const startTime = Date.now();
    try {
      const { question, model = "gemini-3.6-flash", filterCategory } = req.body;

      if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "Debe proporcionar una pregunta válida." });
      }

      const qLower = question.toLowerCase();
      const qWords = qLower
        .replace(/[^\w\sáéíóúñ]/gi, "")
        .split(/\s+/)
        .filter((w) => w.length > 2);

      // Score chunks based on term overlap & relevance
      const scoredChunks = activeChunks
        .filter((chunk) => {
          if (!filterCategory || filterCategory === "all") return true;
          const parentDoc = activeDocs.find((d) => d.id === chunk.docId);
          return parentDoc?.category === filterCategory;
        })
        .map((chunk) => {
          const chunkTextLower = (chunk.content + " " + chunk.section + " " + chunk.docTitle).toLowerCase();
          let score = 0;

          // Simple term match scoring
          for (const word of qWords) {
            if (chunkTextLower.includes(word)) {
              score += 2;
            }
          }

          // Exact phrase match bonus
          if (qWords.length > 1 && chunkTextLower.includes(qLower)) {
            score += 5;
          }

          // Specific Fintech keyword boosts
          if (qLower.includes("límite") || qLower.includes("limite")) {
            if (chunk.content.includes("10,000") || chunk.content.includes("500") || chunk.content.includes("Nivel")) score += 3;
          }
          if (qLower.includes("nocturno") || qLower.includes("fraude") || qLower.includes("seguridad")) {
            if (chunk.content.includes("23:00") || chunk.content.includes("5,000") || chunk.content.includes("MFA")) score += 3;
          }
          if (qLower.includes("comision") || qLower.includes("comisión") || qLower.includes("cajero") || qLower.includes("tarifa")) {
            if (chunk.content.includes("2.50") || chunk.content.includes("0.00") || chunk.content.includes("8.5%")) score += 3;
          }
          if (qLower.includes("privacidad") || qLower.includes("arco") || qLower.includes("datos")) {
            if (chunk.content.includes("privacidad@financebank.com") || chunk.content.includes("ARCO")) score += 3;
          }

          return { chunk, score };
        });

      // Sort by score descending & pick top 3
      scoredChunks.sort((a, b) => b.score - a.score);
      let topScored = scoredChunks.slice(0, 3);

      // Fallback if no high matches found
      if (topScored.length === 0 || topScored[0].score === 0) {
        topScored = activeChunks.slice(0, 3).map((chunk) => ({ chunk, score: 1 }));
      }

      const retrievedChunks = topScored.map((item) => item.chunk);

      // Build context string for Gemini prompt
      const contextText = retrievedChunks
        .map(
          (c, idx) =>
            `[DOCUMENTO FUENTE ${idx + 1}: ${c.docTitle} - Página ${c.pageNumber} (${c.section})]\n"${c.content}"`
        )
        .join("\n\n---\n\n");

      const systemPrompt = `
Usted es el Asistente Virtual Inteligente de "FinanceBANK Fintech", un banco digital regulado.
Su tarea es responder la pregunta del cliente de forma clara, profesional, concisa y amable en español.

REGLAS DE RESPUESTA:
1. Utilice ÚNICAMENTE la información provista en los fragmentos del documento a continuación.
2. Si la respuesta se encuentra en los fragmentos, indíquela con precisión e incluya los números, tarifas o condiciones exactas.
3. Mencione brevemente de qué documento y página proviene la información.
4. Si la información solicitada NO figura en los fragmentos provistos, responda cortésmente:
   "Lo siento, esa consulta específica no se encuentra estipulada en los documentos públicos actuales. Le sugiero contactar a nuestro equipo de atención al cliente en soporte@financebank.com o al +1-800-FINANCE-HELP."

DOCUMENTOS RECUPERADOS (RAG CONTEXT):
${contextText}
`;

      let aiResponseText = "";
      try {
        const ai = getGeminiClient();
        const geminiRes = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: question,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2,
          },
        });
        aiResponseText = geminiRes.text || "No se obtuvo respuesta del modelo AI.";
      } catch (geminiErr: any) {
        console.error("Gemini call error:", geminiErr);
        // Clean fallback response using context directly if API key is not present or rate limited
        aiResponseText = `Según la documentación oficial de FinanceBANK:\n\n${retrievedChunks[0].content}\n\n*(Fuente: ${retrievedChunks[0].docTitle}, Página ${retrievedChunks[0].pageNumber})*`;
      }

      const latencyMs = Date.now() - startTime;

      const sources = retrievedChunks.map((chunk, idx) => ({
        docId: chunk.docId,
        docTitle: chunk.docTitle,
        filename: activeDocs.find((d) => d.id === chunk.docId)?.filename || "document.pdf",
        pageNumber: chunk.pageNumber,
        section: chunk.section,
        contentSnippet: chunk.content,
        similarityScore: Math.min(0.98, 0.72 + (topScored[idx]?.score || 1) * 0.05),
      }));

      return res.json({
        question,
        answer: aiResponseText,
        modelUsed: model,
        latencyMs,
        sources,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("Error in /api/rag/query:", err);
      return res.status(500).json({ error: err.message || "Error procesando la consulta RAG." });
    }
  });

  // 4. GET /api/code/files - Return Python repo files
  app.get("/api/code/files", (req, res) => {
    res.json({
      files: PYTHON_REPO_FILES,
      repoName: "fintech-rag-agent",
      author: "NeonBank Engineering",
    });
  });

  // 5. GET /api/oci/status - Return OCI deployment simulator status
  app.get("/api/oci/status", (req, res) => {
    res.json({
      instanceIp: "132.145.88.210",
      status: "running",
      region: "us-ashburn-1 (OCI Free Tier)",
      shape: "VM.Standard.A1.Flex (4 OCPU, 24GB RAM)",
      dockerStatus: "Up 14 days (Container: fintech-agent-container)",
      lastHealthCheck: new Date().toISOString(),
      port: 8000,
    });
  });

  // Vite middleware for dev / static for prod
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} (or http://127.0.0.1:${PORT})`);
  });
}

startServer();
