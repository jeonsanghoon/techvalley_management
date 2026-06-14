/**
 * Generates src/lib/locale/messages/ko.ts and en.ts from key list + seed maps.
 * Run: node scripts/build-i18n-seeds.mjs && node scripts/build-en-catalog.mjs && node scripts/generate-i18n.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadJson(name) {
  const filePath = path.join(__dirname, name);
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadAllKeys() {
  const tvKeys = JSON.parse(fs.readFileSync("/tmp/tv-keys.json", "utf8"));
  const extraFiles = ["i18n-ko-partial.json", "i18n-ko-overrides.json", "i18n-en-overrides.json", "i18n-en-catalog.json"];
  const extras = extraFiles.flatMap((file) => Object.keys(loadJson(file)));
  return [...new Set([...tvKeys, ...extras])].sort();
}

const outDir = path.join(root, "src/lib/locale/messages");
const keys = loadAllKeys();

const KO_SEED = loadJson("i18n-ko-seed.json");
const EN_SEED = loadJson("i18n-en-seed.json");
const KO_OVERRIDES = loadJson("i18n-ko-overrides.json");
const KO_PARTIAL = loadJson("i18n-ko-partial.json");
const EN_OVERRIDES = loadJson("i18n-en-overrides.json");
const EN_CATALOG = loadJson("i18n-en-catalog.json");

function keyToKo(key) {
  if (KO_OVERRIDES[key]) return KO_OVERRIDES[key];
  if (KO_PARTIAL[key]) return KO_PARTIAL[key];
  if (KO_SEED[key]) return KO_SEED[key];
  return key.split(".").pop()?.replace(/_/g, " ") ?? key;
}

function keyToEn(key) {
  if (EN_OVERRIDES[key]) return EN_OVERRIDES[key];
  if (EN_CATALOG[key]) return EN_CATALOG[key];
  if (EN_SEED[key]) return EN_SEED[key];
  const last = key.split(".").pop() ?? key;
  const simple = {
    all: "All",
    title: "Title",
    subtitle: "Subtitle",
    create: "Create",
    total: "Total",
    online: "Online",
    alarm: "Alarms",
    maintenance: "Maintenance",
    ticket: "Tickets",
    yield: "Yield",
    from: "From",
    to: "To",
    hint: "Note",
    name: "Name",
    email: "Email",
  };
  if (simple[last]) return simple[last];
  return last
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

const ko = {};
const en = {};
for (const key of keys) {
  ko[key] = keyToKo(key);
  en[key] = keyToEn(key);
}

function emit(obj, name) {
  const lines = Object.entries(obj)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
  return `/** Auto-generated — run \`node scripts/generate-i18n.mjs\` */\nexport const ${name} = {\n${lines.join("\n")}\n} as const;\n`;
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "ko.ts"), emit(ko, "KO_MESSAGES"));
fs.writeFileSync(path.join(outDir, "en.ts"), emit(en, "EN_MESSAGES"));
fs.writeFileSync(
  path.join(outDir, "index.ts"),
  `/** Auto-generated message bundles */\nexport { KO_MESSAGES } from "./ko";\nexport { EN_MESSAGES } from "./en";\n\nimport { KO_MESSAGES } from "./ko";\nimport { EN_MESSAGES } from "./en";\n\nexport type TranslationKey = keyof typeof KO_MESSAGES;\n\nexport const MESSAGES = {\n  ko: KO_MESSAGES,\n  en: EN_MESSAGES,\n} as const;\n`,
);
console.log(`Generated ${Object.keys(ko).length} keys → ${outDir}`);
