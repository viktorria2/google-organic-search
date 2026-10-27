import * as cheerio from "cheerio";

function clean(text) {
  return (text || "").replace(/\s+/g, " ").trim();
}

function unwrap(href, base) {
  if (!href) return null;
  try {
    const url = new URL(href, base);
    const nested = url.searchParams.get("q") || url.searchParams.get("url") || url.searchParams.get("uddg");
    if (nested) return new URL(nested).href;
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (/google\./i.test(url.hostname) || /duckduckgo\.com$/i.test(url.hostname)) return null;
    if (/googleadservices|doubleclick/i.test(url.hostname)) return null;
    return url.href;
  } catch {
    return null;
  }
}

function pushUnique(results, seen, title, url, snippet) {
  if (!title || !url || seen.has(url)) return;
  seen.add(url);
  results.push({ rank: results.length + 1, title, url, snippet: snippet || "" });
}

export function parseGoogle(html) {
  const blocked = /\/sorry\/|unusual traffic|before you continue|consent\.google\.com|než budete pokračovat/i.test(
    html || "",
  );
  const $ = cheerio.load(html || "");
  $("#tads, #tadsb, #bottomads, [data-text-ad], .uEierd").remove();
  const results = [];
  const seen = new Set();
  $("a").each((_, el) => {
    const $a = $(el);
    const title = clean($a.find("h3").first().text());
    const url = unwrap($a.attr("href"), "https://www.google.com");
    const snippet = clean($a.closest("div").find(".VwiC3b, .IsZvec, .s").first().text());
    pushUnique(results, seen, title, url, snippet);
  });
  return { blocked, results };
}

export function parseDuckDuckGo(html) {
  const $ = cheerio.load(html || "");
  $(".result--ad").remove();
  const results = [];
  const seen = new Set();
  $("a.result__a").each((_, el) => {
    const $a = $(el);
    const title = clean($a.text());
    const url = unwrap($a.attr("href"), "https://html.duckduckgo.com");
    const snippet = clean($a.closest(".result").find(".result__snippet").first().text());
    pushUnique(results, seen, title, url, snippet);
  });
  return { results };
}

export function toCsv(results) {
  const esc = (value) => {
    const text = String(value ?? "");
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  const rows = (results || []).map((r) => [r.rank, r.title, r.url, r.snippet].map(esc).join(","));
  return ["rank,title,url,snippet", ...rows].join("\r\n") + "\r\n";
}
