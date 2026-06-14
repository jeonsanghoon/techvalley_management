#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { configRoot } from "./lib/paths.mjs";

function deepMerge(target, source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return source ?? target;
  const out = { ...target };
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v) && out[k] && typeof out[k] === "object" && !Array.isArray(out[k])) {
      out[k] = deepMerge(out[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

const index = parseYaml(readFileSync(join(configRoot, "manifest/processes/_index.yaml"), "utf8"));
let composed = {
  version: 1,
  _composed_from: index.processes.map((p) => p.file),
};

for (const proc of index.processes) {
  const fragment = parseYaml(readFileSync(join(configRoot, "manifest/processes", proc.file), "utf8"));
  composed = deepMerge(composed, fragment);
}

const header = `# 테크밸리 데이터 플랫폼 manifest (composed)
# SSOT 원본: manifest/processes/*.yaml — npm run compose:manifest
# 편집: processes/*.yaml 만 수정 · 본 파일은 compose 산출물
`;
const body = stringifyYaml(composed).replace(/^_composed_from:/m, "composed_from:");
writeFileSync(join(configRoot, "manifest/01-data-platform.manifest.yaml"), header + body);
console.log("composed:", join(configRoot, "manifest/01-data-platform.manifest.yaml"));
