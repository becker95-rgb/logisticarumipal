import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to proxy & fetch Google Spreadsheet
  app.get("/api/fetch-sheet", async (req, res) => {
    try {
      const { url, sheetName } = req.query;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "Falta el parámetro 'url' de Google Sheets." });
      }

      // Extract Sheet ID and GID from the URL
      // SAMPLES: https://docs.google.com/spreadsheets/d/1YMmd2Ug93UtRUNsEvqcXNRLw-zmOfcXTKxuRH4K0KJw/edit?gid=0#gid=0
      const sheetIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        return res.status(400).json({ error: "URL de Google Sheets inválida." });
      }

      const sheetId = sheetIdMatch[1];
      
      let exportUrl = "";
      let isCsv = false;

      if (sheetName && typeof sheetName === "string" && sheetName.trim() !== "") {
        // Fetch specific sheet by name using gviz visualization API
        exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
        isCsv = true;
      } else {
        // Extract gid
        let gid = "0";
        const gidMatch = url.match(/gid=([0-9]+)/);
        if (gidMatch) {
          gid = gidMatch[1];
        }
        // Fetch as TSV (Tab-Separated Values) to prevent issues with commas in product names
        exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=tsv&gid=${gid}`;
      }
      
      console.log(`Fetching from Google Sheets: ${exportUrl}`);
      const response = await fetch(exportUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        }
      });

      if (!response.ok) {
        throw new Error(`Google Sheets respondió con código: ${response.status}`);
      }

      const rawText = await response.text();

      if (isCsv) {
        return res.json({ csv: rawText, sheetId, sheetName });
      } else {
        return res.json({ tsv: rawText, sheetId });
      }
    } catch (error: any) {
      console.error("Error fetching sheet:", error);
      return res.status(500).json({ error: error.message || "Error al obtener la planilla." });
    }
  });

  // Vite middleware for development
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
    console.log(`Dev Server and backend proxy running on http://localhost:${PORT}`);
  });
}

startServer();
