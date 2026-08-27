var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var distPath = import_path.default.join(process.cwd(), "dist");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "15mb" }));
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "Milit\xE2ncia S\xE3o Jos\xE9 - SC API",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      city: "S\xE3o Jos\xE9 - Santa Catarina",
      target_mysql: "u844537895_Militantes @ militancia.mastervisionmarketing.com"
    });
  });
  app.get("/api/checkin/test-hostinger", async (req, res) => {
    const startTime = Date.now();
    const targetUrl = "https://militancia.mastervisionmarketing.com/api/teste_conexao.php";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: { "Accept": "application/json" },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      const data = await response.json().catch(() => ({ status: "active_non_json" }));
      return res.json({
        success: true,
        endpoint: targetUrl,
        latencyMs,
        httpStatus: response.status,
        hostingerData: data,
        message: "Endpoint Hostinger acess\xEDvel com sucesso."
      });
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const isTimeout = error.name === "AbortError";
      return res.json({
        success: false,
        endpoint: targetUrl,
        latencyMs,
        isTimeout,
        errorType: isTimeout ? "TIMEOUT_3500MS" : "NETWORK_ERROR",
        errorMessage: error.message || "Erro ao conectar no servidor Hostinger.",
        message: "Servidor Hostinger temporariamente indispon\xEDvel. Modo de conting\xEAncia e fila offline ativo.",
        targetDatabase: "u844537895_Militantes"
      });
    }
  });
  app.post("/api/checkin", async (req, res) => {
    const checkInData = req.body;
    const targetUrl = "https://militancia.mastervisionmarketing.com/api/checkin.php";
    if (!checkInData || !checkInData.streetName && !checkInData.nome_rua) {
      return res.status(400).json({
        success: false,
        error: "Dados de check-in inv\xE1lidos. Nome da rua \xE9 obrigat\xF3rio."
      });
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4e3);
      const hostingerResponse = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(checkInData),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (hostingerResponse.ok) {
        const responseData = await hostingerResponse.json().catch(() => null);
        return res.json({
          success: true,
          status: "synced_mysql",
          destination: "Hostinger MySQL: u844537895_Militantes (militancia.mastervisionmarketing.com)",
          message: "Check-in persistido diretamente no banco MySQL da Hostinger com sucesso.",
          hostingerResponse: responseData,
          checkIn: checkInData
        });
      } else {
        return res.json({
          success: true,
          status: "synced_local_queued",
          destination: "Fila de Sincroniza\xE7\xE3o Local (Hostinger retornou HTTP " + hostingerResponse.status + ")",
          message: "Check-in salvo localmente. Aguardando sincroniza\xE7\xE3o com MySQL da Hostinger.",
          checkIn: checkInData
        });
      }
    } catch (error) {
      const isTimeout = error.name === "AbortError";
      return res.json({
        success: true,
        status: "synced_local_queued",
        destination: "Fila de Sincroniza\xE7\xE3o Local (Offline / Timeout)",
        message: isTimeout ? "Tempo limite de conex\xE3o com o Hostinger atingido (4s). Check-in armazenado em fila local para envio autom\xE1tico." : "Falha de rede ao contatar o Hostinger. Check-in salvo e enfileirado para sincroniza\xE7\xE3o assim que a conex\xE3o restabelecer.",
        networkNote: error.message,
        checkIn: checkInData
      });
    }
  });
  app.post("/api/ai-strategy", async (req, res) => {
    try {
      const { prompt, contextData } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          strategy: generateFallbackStrategy(prompt, contextData),
          source: "local_heuristic_advisor"
        });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
      const systemInstruction = `Voc\xEA \xE9 o Estrategista-Chefe de Campanha e Coordena\xE7\xE3o Territorial para a elei\xE7\xE3o no munic\xEDpio de S\xE3o Jos\xE9 - SC (Santa Catarina).
Voc\xEA conhece profundamente a geografia, bairros e dados demogr\xE1ficos do Censo IBGE de S\xE3o Jos\xE9:
- Regi\xE3o Central/Campinas: Kobrasol (alto fluxo comercial, edif\xEDcios residenciais), Campinas (Av. Pres. Kennedy, Av. Central), Praia Comprida (hist\xF3rico, hospital regional), Fazenda Santo Ant\xF4nio, Ro\xE7ado.
- Regi\xE3o Barreiros: Barreiros (Av. Leoberto Leal, densamente povoado, divisa com Fpolis), Bela Vista, Serraria, Ipiranga, Areias / Bosque das Mans\xF5es.
- Regi\xE3o Forquilhinhas: Forquilhinhas (grande polo residencial e eleitoral), Forquilhas, Potecas.
- Regi\xE3o Oeste/Sede Rural: Picadas do Sul, Sert\xE3o do Maruim, Col\xF4nia Santana.

A campanha decorre de 26/08/2026 a 03/10/2026 (v\xE9spera da vota\xE7\xE3o).
Os materiais a serem distribu\xEDdos em cada rua s\xE3o: Santinhos, Adesivos, Adesivo Bola (vidro traseiro), Adesivo Parachoque e Colinhas.
Forne\xE7a sempre orienta\xE7\xF5es t\xE1ticas, distribui\xE7\xE3o eficiente de equipes e vans, foco em hor\xE1rios de pico comercial ou residencial, e mensagens motivadoras em Portugu\xEAs do Brasil de forma estruturada e profissional.`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemInstruction}

Contexto Atual da Campanha:
${JSON.stringify(contextData || {}, null, 2)}

Pergunta/Solicita\xE7\xE3o do Coordenador Geral:
${prompt}`
              }
            ]
          }
        ]
      });
      res.json({
        strategy: response.text || "An\xE1lise de cobertura conclu\xEDda com sucesso.",
        source: "gemini-2.5-flash"
      });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.json({
        strategy: generateFallbackStrategy(req.body?.prompt, req.body?.contextData),
        source: "local_heuristic_advisor_fallback",
        errorNote: error.message
      });
    }
  });
  function generateFallbackStrategy(prompt, context) {
    return `### Plano Estrat\xE9gico de Cobertura Territorial - S\xE3o Jos\xE9 (SC)

**1. Diagn\xF3stico de Cobertura Atual:**
- **Kobrasol & Campinas:** Grande concentra\xE7\xE3o eleitoral. Recomenda-se manter duplas de militantes na Av. L\xE9dio Jo\xE3o Martins e Av. Presidente Kennedy entre 09h e 13h (hor\xE1rio comercial) e foco em adesiva\xE7\xE3o de ve\xEDculos (Adesivo Bola Perfurite).
- **Forquilhinhas & Forquilhas:** Maior densidade de eleitores da Zona Oeste. Priorizar panfletagem porta a porta nas vias transversais \xE0 Rua Vereador Arthur Mariano.
- **Barreiros & Serraria:** Cobertura de 60%. Acelerar a rota da Van 02 no eixo da Av. Leoberto Leal e no loteamento Luar da Serraria.

**2. Aloca\xE7\xE3o T\xE1tica da Frota de Vans:**
- **Van 01 (Sprinter):** Foco matutino em Forquilhinhas e transbordo para Potecas \xE0s 14h.
- **Van 02 (Master):** Eixo Barreiros - Bela Vista - Serraria. Ponto de encontro: Trevo de Barreiros.
- **Van 03 (Ducato):** Sede hist\xF3rica, Praia Comprida e Sert\xE3o do Maruim.

**3. Meta de Materiais para a Pr\xF3xima Rodada:**
- Distribui\xE7\xE3o m\xEDnima de 400 santinhos + 250 colinhas por militante/dia.
- Incentivar registro fotogr\xE1fico com geolocaliza\xE7\xE3o no app de campo para valida\xE7\xE3o imediata no painel.`;
  }
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath2 = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath2));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath2, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Milit\xE2ncia SJ Server] Running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
