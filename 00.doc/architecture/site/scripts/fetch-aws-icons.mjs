#!/usr/bin/env node
/** Ensures public/data/aws-icons-mermaid.json has SVG bodies (SSOT: awslabs/aws-icons-for-plantuml). */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/data/aws-icons-mermaid.json");
const URL =
  "https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/main/dist/aws-icons-mermaid.json";

function bodyLen(json) {
  const sample = json?.icons?.lambda?.body ?? "";
  return typeof sample === "string" ? sample.trim().length : 0;
}

async function download() {
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${URL}`);
  const text = await res.text();
  writeFileSync(OUT, text, "utf8");
  return JSON.parse(text);
}

async function main() {
  let json = null;
  if (existsSync(OUT)) {
    try {
      json = JSON.parse(readFileSync(OUT, "utf8"));
    } catch {
      json = null;
    }
  }

  if (!json || bodyLen(json) < 100) {
    console.log("Fetching AWS Mermaid icon pack…");
    json = await download();
    console.log(`Wrote ${OUT} (lambda body ${bodyLen(json)} chars)`);
  } else {
    console.log(`AWS icon pack OK (${OUT}, lambda body ${bodyLen(json)} chars)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
