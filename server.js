import express from "express";
import multer from "multer";

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 3 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    cb(allowed.includes(file.mimetype) ? null : new Error("Envie imagens JPG, PNG ou WEBP."), allowed.includes(file.mimetype));
  }
});

app.use(express.static("public"));

app.post("/api/analisar", upload.fields([
  { name: "frontal", maxCount: 1 },
  { name: "lateral", maxCount: 1 },
  { name: "tresQuartos", maxCount: 1 }
]), async (req, res) => {
  try {
    if (!API_KEY || !MODEL) {
      return res.status(500).json({ error: "Configure OPENAI_API_KEY e OPENAI_MODEL no arquivo .env antes de analisar." });
    }

    const files = req.files || {};
    const photos = [
      ["Frontal", files.frontal?.[0]],
      ["Lateral", files.lateral?.[0]],
      ["Três quartos", files.tresQuartos?.[0]]
    ].filter(([, file]) => file);

    if (!photos.length) {
      return res.status(400).json({ error: "Envie pelo menos uma fotografia." });
    }

    const content = [{
      type: "input_text",
      text: `Você é um especialista em observação de anatomia facial para ajudar a recriar rostos no editor do PES 2021.
Analise somente características físicas VISÍVEIS. Não tente identificar a pessoa, estimar idade, etnia, personalidade ou saúde.
Se houver apenas uma vista, deixe claro o que não pode ser concluído. Não invente medidas milimétricas nem ângulos exatos: use comparações relativas e indique confiança (alta, média ou baixa).
Diferencie cuidadosamente: tamanho, posição, inclinação, profundidade/projeção e formato. Não confunda expressão momentânea (sorriso, tensão) com formato natural da boca ou dos olhos.
Para cada região, descreva o que se vê e como isso poderia orientar a observação no editor, mas NÃO invente nomes ou valores de sliders específicos.
Estruture em português do Brasil, com estes títulos:
1. IMPRESSÃO GERAL
2. FORMATO E PROPORÇÕES DO ROSTO
3. TESTA E SOBRANCELHAS
4. OLHOS
5. NARIZ
6. BOCHECHAS E MAÇÃS DO ROSTO
7. BOCA E LÁBIOS
8. QUEIXO E MANDÍBULA
9. CARACTERÍSTICAS MAIS MARCANTES (ordene as 5 mais distintivas)
10. O QUE NÃO DÁ PARA CONCLUIR
11. GUIA DE REPRODUÇÃO NO PES 2021
Em cada parte, use descrições objetivas e, quando possível, compare proporções (ex.: mais largo que, relativamente curto, mais projetado). Para cada conclusão importante, indique confiança. Não faça elogios genéricos.`
    }];

    for (const [label, file] of photos) {
      const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      content.push({ type: "input_text", text: `Fotografia: ${label}.` });
      content.push({ type: "input_image", image_url: dataUrl, detail: "high" });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        input: [{ role: "user", content }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || "Falha ao consultar o serviço de IA.";
      return res.status(response.status).json({ error: message });
    }

    const output = (data.output || [])
      .filter(item => item.type === "message")
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    if (!output) return res.status(502).json({ error: "A IA não retornou um relatório. Tente novamente com fotos mais nítidas." });
    res.json({ analysis: output });
  } catch (err) {
    res.status(400).json({ error: err.message || "Não foi possível processar as imagens." });
  }
});

app.listen(PORT, () => console.log(`Face Analyzer disponível em http://localhost:${PORT}`));
