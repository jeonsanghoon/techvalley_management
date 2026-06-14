import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getAllDocEntries, slugFromRel } from "./manifest";

export const ARCH_ROOT = join(process.cwd(), "../../../02.arch");

export type TocItem = { id: string; text: string; level: 2 | 3 };

export type DocPage = {
  slug: string;
  rel: string;
  title: string;
  description: string;
  content: string;
  toc: TocItem[];
  readingMinutes: number;
};

function readArch(rel: string): string {
  const p = join(ARCH_ROOT, rel);
  if (!existsSync(p)) throw new Error(`Missing: ${p}`);
  return readFileSync(p, "utf8");
}

export function generatePostgresInventoryMd(): string {
  const dir = join(ARCH_ROOT, "config/schema/postgres");
  const sqlFiles = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  const lines = ["# Postgres 테이블 인벤토리 (DDL SSOT)", ""];
  for (const file of sqlFiles) {
    const text = readFileSync(join(dir, file), "utf8");
    const tables = [
      ...text.matchAll(/CREATE TABLE(?: IF NOT EXISTS)?\s+(?:public\.)?"?(\w+)"?/gi),
    ].map((m) => m[1]!);
    lines.push(`## ${file}`, "");
    if (tables.length === 0) {
      lines.push("_（CREATE TABLE 없음 — seed/참고 SQL）_", "");
    } else {
      lines.push("| # | 테이블 |", "|---|--------|");
      tables.forEach((t, i) => lines.push(`| ${i + 1} | \`${t}\` |`));
      lines.push("");
    }
  }
  lines.push(
    "> 상세 컬럼·FK·인덱스: [`reference/postgres`](/reference/postgres/) · manifest `06-postgres.yaml`",
  );
  return lines.join("\n");
}

function extractTitle(md: string, fallback: string): string {
  const m = md.match(/^#\s+(.+)$/m);
  return m?.[1]?.trim() ?? fallback;
}

function extractDescription(md: string): string {
  const lines = md.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    return t.replace(/\[(.+?)\]\(.+?\)/g, "$1").slice(0, 160);
  }
  return "";
}

function extractToc(md: string): TocItem[] {
  const items: TocItem[] = [];
  for (const line of md.split("\n")) {
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      items.push({ level: 2, text: h2[1]!.trim(), id: slugifyHeading(h2[1]!) });
      continue;
    }
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) items.push({ level: 3, text: h3[1]!.trim(), id: slugifyHeading(h3[1]!) });
  }
  return items;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const slugByBasename = new Map<string, string>();
for (const entry of getAllDocEntries()) {
  const base = entry.rel.split("/").pop()?.replace(/\.md$/i, "") ?? "";
  slugByBasename.set(base, entry.slug);
}

export function rewriteMarkdownLinks(md: string): string {
  let out = md;
  for (const [base, slug] of slugByBasename) {
    const re = new RegExp(`\\]\\([^)]*${base}\\.md([^)]*)\\)`, "g");
    out = out.replace(re, (_, hash: string) => `](/docs/${slug}/${hash || ""})`);
  }
  out = out.replace(/\]\(\.\.\/00\.doc\/architecture\/index\.html\)/g, "](/)");
  out = out.replace(/\]\(\.\/config\//g, "](/reference/config/)");
  return out;
}

export function loadDocContent(rel: string, label?: string): Omit<DocPage, "slug"> {
  const raw =
    rel === "__generated/postgres-table-inventory.md"
      ? generatePostgresInventoryMd()
      : readArch(rel);
  const content = rewriteMarkdownLinks(raw);
  const title = label ?? extractTitle(raw, rel);
  const description = extractDescription(raw);
  const words = content.split(/\s+/).length;
  return {
    rel,
    title,
    description,
    content,
    toc: extractToc(raw),
    readingMinutes: Math.max(1, Math.ceil(words / 220)),
  };
}

export function loadDocPage(slug: string): DocPage | null {
  const entry = getAllDocEntries().find((d) => d.slug === slug);
  if (!entry) return null;
  return { slug, ...loadDocContent(entry.rel, entry.label) };
}

export function loadAllDocPages(): DocPage[] {
  return getAllDocEntries().map((e) => ({
    slug: e.slug,
    ...loadDocContent(e.rel, e.label),
  }));
}

export function buildSearchIndex(): { slug: string; title: string; rel: string; excerpt: string }[] {
  return loadAllDocPages().map((p) => ({
    slug: p.slug,
    title: p.title,
    rel: p.rel,
    excerpt: p.description || p.content.slice(0, 240),
  }));
}

/** rel basename → doc slug for internal links */
export { slugFromRel };
