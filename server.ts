import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please set it in Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "maker-mosaic-light-studio",
      },
    },
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/gemini/analyze-lighting", async (req, res) => {
  try {
    const {
      imageBase64,
      lightSource,
      coloringMedium = "colored-pencils",
      mimeType = "image/png",
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 data" });
    }

    const ai = getGenAI();
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
    const safeMimeType =
      mimeType && !mimeType.includes("svg") ? mimeType : "image/png";

    const lightX = Math.round(lightSource?.x ?? 50);
    const lightY = Math.round(lightSource?.y ?? 20);
    const lightZ = Math.round(lightSource?.z ?? 60);
    const lightDirection =
      lightX < 40
        ? "upper-left"
        : lightX > 60
          ? "upper-right"
          : lightY > 60
            ? "lower/under-light"
            : "overhead/center";

    const promptText = `You are the vision and lighting-analysis engine for Maker Mosaic Light Studio.

The user has uploaded artwork or a coloring page and placed a virtual light source. Your job is to TEACH where light and shadow should be added while preserving the user's original artwork.

LIGHT SETUP
- Light position on the displayed page: X=${lightX}%, Y=${lightY}%.
- Approximate direction: ${lightDirection}.
- Elevation/distance: ${lightZ}%.
- Light tint: ${lightSource?.color || "#FFFAF0"}.
- User medium: ${coloringMedium}.

IMPORTANT SPATIAL RULES
- The supplied image has already been normalized to the exact square canvas used by the app.
- All region coordinates MUST use that same image coordinate system.
- x=0 is the left edge, x=100 is the right edge.
- y=0 is the top edge, y=100 is the bottom edge.
- Do not redraw, reinterpret, or alter the line art.
- Infer the likely 3D forms and overlaps from the image: spheres/heads, cylinders, folds, petals, leaves, boxes, flat planes, objects in front of other objects, etc.
- Prefer useful, conservative guidance over pretending uncertain geometry is exact.

SEMANTIC GUIDE REGIONS
Return 6-16 practical polygon regions that can be overlaid on the ORIGINAL image.
Each region must be one of:
- "highlight": surfaces most directly facing the light.
- "form-shadow": the turning-away side of a rounded or angled form.
- "cast-shadow": shadow one object would cast onto another visible surface.
- "deep-shadow": occlusion/crease/contact areas receiving very little light.

For each region:
- points: 3-10 ordered polygon vertices in 0..100 coordinates.
- label: a short human label such as "top of mushroom cap".
- explanation: one concise sentence explaining why that area receives this light/shadow.
- strength: 0.15..1.0.
- Keep polygons local to the real object surface. Do NOT return giant generic page quadrants.
- Do NOT shade blank page/background unless it is clearly part of the illustration.
- If geometry is ambiguous, use a smaller region rather than inventing a huge one.

TEACHING RESPONSE
Also give:
1. A short title and summary.
2. Specific highlight advice.
3. Specific form/cast/deep-shadow advice.
4. A medium-aware blending tip for ${coloringMedium}.
5. A four-step coloring order.
6. A four-tone palette with valid hex codes (base, highlight, shadow, rimLight).

The goal is not photorealistic ray tracing. The goal is a clear, trustworthy learning guide that helps a hobby artist understand WHY each area is lighter or darker.`;

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
          { text: promptText },
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
                base: { type: Type.STRING, description: "Hex color code" },
                highlight: { type: Type.STRING, description: "Hex color code" },
                shadow: { type: Type.STRING, description: "Hex color code" },
                rimLight: { type: Type.STRING, description: "Hex color code" },
              },
              required: ["base", "highlight", "shadow", "rimLight"],
            },
            regions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  kind: {
                    type: Type.STRING,
                    format: "enum",
                    enum: ["highlight", "form-shadow", "cast-shadow", "deep-shadow"],
                  },
                  label: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  strength: { type: Type.NUMBER },
                  points: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                      },
                      required: ["x", "y"],
                    },
                  },
                },
                required: ["kind", "label", "explanation", "strength", "points"],
              },
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
            "regions",
          ],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    const analysisData = JSON.parse(response.text);

    if (Array.isArray(analysisData.regions)) {
      analysisData.regions = analysisData.regions
        .filter((region: any) => Array.isArray(region.points) && region.points.length >= 3)
        .map((region: any) => ({
          ...region,
          strength: Math.max(0.15, Math.min(1, Number(region.strength) || 0.5)),
          points: region.points
            .slice(0, 10)
            .map((p: any) => ({
              x: Math.max(0, Math.min(100, Number(p.x) || 0)),
              y: Math.max(0, Math.min(100, Number(p.y) || 0)),
            })),
        }))
        .slice(0, 20);
    } else {
      analysisData.regions = [];
    }

    return res.json({ success: true, data: analysisData });
  } catch (err: any) {
    console.error("Error analyzing lighting with Gemini:", err);
    return res.status(500).json({
      error: err.message || "Failed to analyze lighting",
    });
  }
});

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
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
