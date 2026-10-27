import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { parseDuckDuckGo, parseGoogle, toCsv } from "../parser.js";

const dir = dirname(fileURLToPath(import.meta.url));
const googleHtml = readFileSync(join(dir, "fixtures", "google-serp.html"), "utf8");
const ddgHtml = readFileSync(join(dir, "fixtures", "ddg-serp.html"), "utf8");

describe("parseGoogle", () => {
  it("returns unique organic results and skips ads", () => {
    const { results, blocked } = parseGoogle(googleHtml);
    assert.equal(blocked, false);
    assert.deepEqual(
      results.map((r) => r.url),
      ["https://cs.wikipedia.org/wiki/Espresso", "https://www.example-prazirovna.cz/espresso"],
    );
    assert.equal(results[0].title, "Espresso – Wikipedie");
    assert.equal(JSON.stringify(results).includes("Koupit hned"), false);
    assert.equal(JSON.stringify(results).includes("googleadservices"), false);
  });
});

describe("parseDuckDuckGo", () => {
  it("returns organic results and skips ads", () => {
    const { results } = parseDuckDuckGo(ddgHtml);
    assert.equal(results.length, 2);
    assert.equal(results[0].url, "https://cs.wikipedia.org/wiki/Espresso");
  });
});

describe("toCsv", () => {
  it("writes parseable CSV", () => {
    const csv = toCsv([{ rank: 1, title: 'Káva, "espresso"', url: "https://example.com", snippet: "a" }]);
    assert.equal(csv, 'rank,title,url,snippet\r\n1,"Káva, ""espresso""",https://example.com,a\r\n');
  });
});
