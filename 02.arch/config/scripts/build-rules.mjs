#!/usr/bin/env node
/** converter-rules/*.yaml → rules/*.json */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const configRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(configRoot, "converter-rules");
const outDir = join(configRoot, "rules");
mkdirSync(outDir, { recursive: true });

for (const file of readdirSync(srcDir).filter((f) => f.endsWith(".yaml"))) {
  const doc = parseYaml(readFileSync(join(srcDir, file), "utf8"));
  const outName = `${doc.rule_code || doc.rule_id}.json`;
  writeFileSync(join(outDir, outName), JSON.stringify(doc, null, 2));
  console.log("built:", outName);
}
console.log("OK: rules build from 02.arch/config/converter-rules");
