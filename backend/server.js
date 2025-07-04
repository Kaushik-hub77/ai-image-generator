import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ✅ Test if HF token works
app.get("/test-token", async (req, res) => {
  try {
    const response = await fetch("https://huggingface.co/api/whoami", {
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      res.json({ valid: true, user: data.name });
    } else {
      res.status(401).json({ valid: false, error: "Invalid token" });
    }
  } catch (err) {
    res.status(500).json({ valid: false, error: err.message });
  }
});

// 🎨 Real text-to-image transform
app.post("/transform", async (req, res) => {
  const prompt = req.body.prompt;

  if (!prompt) return res.status(400).json({ error: "Prompt is required" });
  if (!process.env.HF_TOKEN) return res.status(500).json({ error: "HF_TOKEN not configured" });

  try {
    console.log("🎨 Generating image for prompt:", prompt);

    const response = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
        "x-use-cache": "false",
      },
      body: JSON.stringify({ inputs: prompt }),
    });
    console.log("Response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error:", errorText);

      if (response.status === 503) {
        return res.status(503).json({ error: "Model is loading", retry: true });
      }
      if (response.status === 401) {
        return res.status(401).json({ error: "Invalid token" });
      }
      if (response.status === 429) {
        return res.status(429).json({ error: "Rate limit exceeded" });
      }

      return res.status(response.status).json({ error: "API error", details: errorText });
    }

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.startsWith("image/")) {
      const imageBuffer = await response.buffer();
      const base64Image = imageBuffer.toString("base64");
      const dataUri = `data:${contentType};base64,${base64Image}`;

      console.log("✅ Image generated successfully");

      res.json({
        output: dataUri,
        model: "stabilityai/stable-diffusion-2",
        prompt: prompt,
      });
    } else {
      const textResponse = await response.text();
      try {
        const jsonResponse = JSON.parse(textResponse);
        return res.status(500).json({ error: "Unexpected response", details: jsonResponse });
      } catch (parseErr) {
        return res.status(500).json({ error: "Unexpected response format", details: textResponse });
      }
    }
  } catch (err) {
    console.error("💥 Backend Error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// 🧪 Mock test endpoint for frontend
app.post("/mock-transform", async (req, res) => {
  const prompt = req.body.prompt;

  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const colors = ["FF0000", "00FF00", "0000FF", "FFFF00", "FF00FF", "00FFFF"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  const canvas = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#${color}"/>
    <text x="50" y="50" font-family="Arial" font-size="8" fill="white" text-anchor="middle" dy=".3em">Generated</text>
  </svg>`;

  const base64 = Buffer.from(canvas).toString("base64");
  const dataUri = `data:image/svg+xml;base64,${base64}`;

  res.json({
    output: dataUri,
    message: `Mock image generated for: "${prompt}"`,
    model: "mock-model",
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`🔍 Test token: http://localhost:${PORT}/test-token`);
  console.log(`🎨 Use /transform or /mock-transform`);
});
