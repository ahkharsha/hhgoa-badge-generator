import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { promises as fsp } from "fs";
import pg from "pg";
const { Pool } = pg;

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize file-backed share storage (Fallback)
  const DATA_DIR = path.join(process.cwd(), ".data");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const SHARES_FILE = path.join(DATA_DIR, "shares.json");

  // Initialize PostgreSQL Pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  if (process.env.DATABASE_URL) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS shares (
          id VARCHAR(50) PRIMARY KEY,
          image_data TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("PostgreSQL Database connected and table verified.");
    } catch (err) {
      console.error("Failed to initialize PostgreSQL:", err);
    }
  } else {
    console.log("No DATABASE_URL found. Falling back to local JSON storage.");
  }

  app.use(express.json({ limit: "10mb" }));

  // API Route to upload shared image
  app.post("/api/share", async (req, res) => {
    try {
      const { dataUrl } = req.body;
      if (!dataUrl) {
        return res.status(400).json({ error: "No image provided" });
      }
      const id = Math.random().toString(36).substring(2, 10);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");

      if (process.env.DATABASE_URL) {
        await pool.query("INSERT INTO shares (id, image_data) VALUES ($1, $2)", [id, base64Data]);
      } else {
        const store = await readShareStore(SHARES_FILE);
        store[id] = base64Data;
        await fsp.writeFile(SHARES_FILE, JSON.stringify(store), "utf8");
      }
      
      res.json({ id });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // API Route to serve the actual image
  app.get("/api/share/image/:id", async (req, res) => {
    const id = req.params.id;

    let base64Data;
    if (process.env.DATABASE_URL) {
      const result = await pool.query("SELECT image_data FROM shares WHERE id = $1", [id]);
      if (result.rows.length > 0) base64Data = result.rows[0].image_data;
    } else {
      const store = await readShareStore(SHARES_FILE);
      base64Data = store[id];
    }

    if (!base64Data) {
      return res.status(404).send("Image not found");
    }

    const imgBuffer = Buffer.from(base64Data, "base64");
    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": imgBuffer.length,
    });
    res.end(imgBuffer);
  });

  // API Route to serve HTML with OG tags
  app.get("/share/:id", async (req, res) => {
    const id = req.params.id;

    let exists = false;
    if (process.env.DATABASE_URL) {
      const result = await pool.query("SELECT 1 FROM shares WHERE id = $1", [id]);
      exists = result.rows.length > 0;
    } else {
      const store = await readShareStore(SHARES_FILE);
      exists = !!store[id];
    }

    if (!exists) {
      return res.redirect("/");
    }
    

    const host = req.headers["x-forwarded-host"] || req.get("host");
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    
    const imageUrl = `${protocol}://${host}/api/share/image/${id}`;
    const appUrl = `${protocol}://${host}/`;
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>HH Goa 2026 - Builder Pass</title>
          <meta property="og:title" content="HH Goa 2026 Builder Pass" />
          <meta property="og:description" content="I just generated my HH Goa 2026 Builder Pass! Generate yours now." />
          <meta property="og:image" content="${imageUrl}" />
          <meta property="og:url" content="${appUrl}" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="HH Goa 2026 Builder Pass" />
          <meta name="twitter:description" content="I just generated my HH Goa 2026 Builder Pass! Generate yours now." />
          <meta name="twitter:image" content="${imageUrl}" />
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: #0B6839;
              color: #FFFEEA;
              font-family: monospace;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              overflow-x: hidden;
            }
            .container {
              max-width: 800px;
              width: 100%;
              padding: 2rem;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 2rem;
              text-align: center;
            }
            .badge-image {
              max-width: 100%;
              height: auto;
              max-height: 70vh;
              border-radius: 12px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
              border: 1px solid rgba(254, 225, 1, 0.3);
            }
            .build-btn {
              background-color: #FEE101;
              color: #0B6839;
              text-decoration: none;
              font-weight: bold;
              font-size: 1.2rem;
              padding: 1rem 2rem;
              border-radius: 8px;
              text-transform: uppercase;
              transition: transform 0.2s, background-color 0.2s;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .build-btn:hover {
              transform: translateY(-2px);
              background-color: #ffd700;
            }
            .title {
              font-size: 2rem;
              font-family: serif;
              font-weight: bold;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="title">HH GOA 2026<br><span style="color: #FEE101; font-family: monospace; font-size: 1.2rem;">BUILDER PASS</span></h1>
            <img src="${imageUrl}" alt="HH Goa Builder Pass" class="badge-image" />
            <a href="${appUrl}" class="build-btn">Generate Your Own Pass ⚡</a>
          </div>
        </body>
      </html>
    `;
    res.send(html);
  });

  // API Route for AI Builder Title & Stats Generation
  app.post("/api/generate-title", async (req, res) => {
    try {
      const { name, role, stack, bio } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        // Return realistic AI fallback
        return res.json({
          title: generateFallbackTitle(role || stack),
          motto: generateFallbackMotto(name, role || stack),
          stats: generateFallbackStats(role || stack),
          archetype: generateFallbackArchetype(stack),
          rarity: generateFallbackRarity(),
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `You are the chief hype architect for HH Goa 2026 (Hacker House Goa 2026), India's premier 4-day beach residency for 247 top builders in AI, Crypto, and Web3.
Given a builder's info:
Name: "${name || "Anonymous Builder"}"
Role/Stack: "${role || stack || "Full-Stack AI Developer"}"
Bio/Notes: "${bio || "Building cool products"}"
Generate a epic, slightly humorous, highly shareable tech badge personality for them.
Return a JSON object with:
1. "title": a snappy 3-6 word builder title (e.g. "Solana DeGEN & AI Agent Summoner", "Rust Overlord & Coconut Drinker", "LLM Fine-Tuner & Beach Hacker").
2. "motto": a funny 1-sentence builder quote or vibe (under 12 words) about building at Goa.
3. "stats": an array of 4 stats objects [{ "label": "SPEED", "value": 94 }, { "label": "HACK", "value": 98 }, { "label": "HYPE", "value": 92 }, { "label": "CAFFEINE", "value": 99 }] with values 70-99.
4. "archetype": 1-2 words badge designation (e.g. "AI ALCHEMIST", "PROTOCOL ARCHITECT", "CYBER MONK", "ZERO-KNOWLEDGE DEGEN").
5. "rarity": 1 word string representing the rarity tier ("COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC").`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              motto: { type: Type.STRING },
              archetype: { type: Type.STRING },
              rarity: { type: Type.STRING },
              stats: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.INTEGER },
                  },
                  required: ["label", "value"],
                },
              },
            },
            required: ["title", "motto", "stats", "archetype", "rarity"],
          },
        },
      });

      const resultText = response.text;
      if (resultText) {
        const parsed = JSON.parse(resultText);
        return res.json(parsed);
      } else {
        throw new Error("Empty response from AI model");
      }
    } catch (error) {
      console.error("Error generating title via Gemini:", error);
      const { stack, role, name } = req.body || {};
      res.json({
        title: generateFallbackTitle(role || stack),
        motto: generateFallbackMotto(name, role || stack),
        stats: generateFallbackStats(role || stack),
        archetype: generateFallbackArchetype(stack),
        rarity: generateFallbackRarity(),
      });
    }
  });

  // Vite middleware for development vs Static in production
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
    console.log(`HH Goa 2026 Badge App running on http://localhost:${PORT}`);
    
    // Internal CRON job to keep Render active (pings every 14 minutes)
    if (process.env.NODE_ENV === "production") {
      setInterval(() => {
        const targetUrl = process.env.RENDER_EXTERNAL_URL || "https://hhgoa-badge-generator.onrender.com";
        console.log(`[Keep-Alive Cron] Pinging ${targetUrl} to prevent sleep...`);
        fetch(targetUrl).catch(err => console.error("Keep-Alive ping failed:", err.message));
      }, 14 * 60 * 1000);
    }
  });
}

function generateFallbackTitle(roleOrStack?: string): string {
  const text = (roleOrStack || "").toLowerCase();
  if (text.includes("ai") || text.includes("ml") || text.includes("llm")) {
    return "Autonomous AI Agent Whisperer & Beach Hacker";
  }
  if (text.includes("crypto") || text.includes("web3") || text.includes("solana") || text.includes("eth")) {
    return "Protocol Wizard & Smart Contract DeGEN";
  }
  if (text.includes("design") || text.includes("ui") || text.includes("ux")) {
    return "Pixel Alchemist & Cyberpunk UI Director";
  }
  if (text.includes("front") || text.includes("react") || text.includes("full")) {
    return "Full-Stack Overlord & LATE NIGHT Shipper";
  }
  return "Goa Residency Builder & Code Ninja";
}

function generateFallbackMotto(name?: string, role?: string): string {
  const quotes = [
    "Shipping code directly from a lounge chair at LATE NIGHT.",
    "Powered by coconut water, zero sleep, and high-frequency commits.",
    "Building real products on the beach with 247 top builders.",
    "Transforming caffeine into multichain AI agents at HH Goa 2026.",
    "No pitch decks, just running code and beach vibes."
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function generateFallbackArchetype(stack?: string): string {
  const text = (stack || "").toLowerCase();
  if (text.includes("ai")) return "AI ALCHEMIST";
  if (text.includes("solana") || text.includes("crypto") || text.includes("web3")) return "PROTOCOL ARCHITECT";
  if (text.includes("design")) return "CREATIVE DIRECTOR";
  return "CYBER BUILDER";
}

function generateFallbackStats(stack?: string) {
  return [
    { label: "SPEED", value: Math.floor(Math.random() * 15) + 84 },
    { label: "HACK", value: Math.floor(Math.random() * 10) + 88 },
    { label: "HYPE", value: Math.floor(Math.random() * 12) + 85 },
    { label: "CAFFEINE", value: Math.floor(Math.random() * 8) + 92 },
  ];
}

function generateFallbackRarity(): string {
  const rarities = ["COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"];
  return rarities[Math.floor(Math.random() * rarities.length)];
}

async function readShareStore(filePath: string): Promise<Record<string, string>> {
  try {
    const raw = await fsp.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

startServer();
