import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for image base64 data
app.use(express.json({ limit: "25mb" }));

// Lazy initialize Gemini client
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please set it in Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Health Endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Gemini Lighting & Shading Analysis API
app.post("/api/gemini/analyze-lighting", async (req, res) => {
  try {
    const { imageBase64, lightSource, mimeType = "image/png" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 data" });
    }

    const ai = getGenAI();

    // Remove data URL prefix if present (handles any mime type)
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
    const safeMimeType = (mimeType && !mimeType.includes("svg")) ? mimeType : "image/png";

    const promptText = `You are a friendly, expert coloring book instructor helping a colorist know exactly where to place highlights, midtones, and shadows on this line-art coloring page.
Target Light Source Angle:
- Light Position: X=${Math.round(lightSource?.x || 50)}%, Y=${Math.round(lightSource?.y || 20)}% (0,0 is top-left, 100,100 is bottom-right)
- Light Angle: Light is coming from the ${lightSource?.x < 40 ? 'Top-Left' : lightSource?.x > 60 ? 'Top-Right' : 'Overhead/Center'}
- Light Elevation: ${lightSource?.z || 50}% height
- Light Tint: ${lightSource?.color || '#FFFAF0'}

Analyze the forms, curves, folds, and shapes in this coloring page image. Give encouraging, practical advice in plain language for colored pencil artists, alcohol marker fans, and watercolorists:

1. Title & Executive Summary: Inspiring description of the subject and light direction.
2. Highlights & Gel Pen Spots: Specific advice on which curves, tops of shapes, snouts, petals, or hair locks get the brightest light or white gel pen dots.
3. Shadows & Deep Pencil Pressure: Exactly where to press harder with dark pencils or apply darker shade markers (folds, under edges, behind overlapping shapes).
4. Color Blending Tip: Warm vs cool color shifts (e.g., using light yellow/cream pencils for highlights and deep purple/indigo for shadows).
5. 4-Step Coloring Order: 4 step-by-step instructions on what to color first (e.g. 1. Lay base colors, 2. Blend midtones, 3. Shade deep folds, 4. Pop highlights).
6. Recommended 4-tone palette (Base, Highlight, Shadow, Rim) hex codes.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: safeMimeType,
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            highlightsGuide: { type: Type.STRING },
            shadowsGuide: { type: Type.STRING },
            colorTheoryTip: { type: Type.STRING },
            stepByStepGuide: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            palette: {
              type: Type.OBJECT,
              properties: {
                base: { type: Type.STRING, description: "Hex color code e.g. #E06D53" },
                highlight: { type: Type.STRING, description: "Hex color code e.g. #FFD1A9" },
                shadow: { type: Type.STRING, description: "Hex color code e.g. #6B2D5C" },
                rimLight: { type: Type.STRING, description: "Hex color code e.g. #5CE0D8" },
              },
              required: ["base", "highlight", "shadow", "rimLight"],
            },
          },
          required: [
            "title",
            "summary",
            "highlightsGuide",
            "shadowsGuide",
            "colorTheoryTip",
            "stepByStepGuide",
            "palette",
          ],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    const analysisData = JSON.parse(response.text);
    return res.json({ success: true, data: analysisData });
  } catch (err: any) {
    console.error("Error analyzing lighting with Gemini:", err);
    return res.status(500).json({
      error: err.message || "Failed to analyze lighting",
    });
  }
});

async function startServer() {
  // Vite middleware setup for dev vs production static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
