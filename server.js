import express from "express";
import { fileURLToPath } from "node:url";
import { parseDuckDuckGo, parseGoogle } from "./parser.js";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
  "Accept-Language": "cs-CZ,cs;q=0.9",
};

async function load(url) {
  const response = await fetch(url, { headers: HEADERS, redirect: "follow" });
  return response.text();
}

export async function search(query) {
  const google = parseGoogle(
    await load(`https://www.google.com/search?q=${encodeURIComponent(query)}&num=10&hl=cs&gl=cz&gbv=1`),
  );
  if (!google.blocked && google.results.length) {
    return { source: "google", results: google.results };
  }
  const fallback = parseDuckDuckGo(
    await load(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`),
  );
  return { source: "web-organic-fallback", results: fallback.results };
}

const app = express();
app.use(express.static("public"));

app.get("/api/search", async (req, res) => {
  const query = String(req.query.q || "").trim();
  if (!query) {
    return res.status(400).json({ error: "Zadejte klíčové slovní spojení." });
  }
  try {
    const { source, results } = await search(query);
    res.json({
      query,
      page: 1,
      resultType: "organic",
      source,
      resultCount: results.length,
      results,
    });
  } catch (error) {
    res.status(502).json({ error: error.message || "Vyhledávání selhalo." });
  }
});

export { app };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 8000);
  app.listen(port, "0.0.0.0", () => {
    console.log(`http://localhost:${port}`);
  });
}
