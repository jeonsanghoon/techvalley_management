import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ARCH_ROOT } from "./docs";

export type PostgresColumn = { name: string; definition: string };
export type PostgresTable = { name: string; columns: PostgresColumn[] };
export type PostgresFile = { file: string; tables: PostgresTable[] };

function parseTableBlock(block: string): PostgresTable | null {
  const nameMatch = block.match(/CREATE TABLE(?: IF NOT EXISTS)?\s+(?:public\.)?"?(\w+)"?/i);
  if (!nameMatch) return null;
  const name = nameMatch[1]!;
  const bodyStart = block.indexOf("(");
  const bodyEnd = block.lastIndexOf(");");
  if (bodyStart < 0 || bodyEnd < 0) return { name, columns: [] };

  const body = block.slice(bodyStart + 1, bodyEnd);
  const columns: PostgresColumn[] = [];
    for (const line of body.split("\n")) {
    const trimmed = line.trim().replace(/,$/, "");
    if (!trimmed || trimmed.startsWith("--")) continue;
    if (/^(CONSTRAINT|PRIMARY KEY|UNIQUE|CHECK|FOREIGN KEY|REFERENCES|COMMENT)/i.test(trimmed)) continue;
    const col = trimmed.match(/^"?(\w+)"?\s+(.+)$/);
    if (col) columns.push({ name: col[1]!, definition: col[2]!.trim() });
  }
  return { name, columns };
}

export function loadPostgresSchema(): PostgresFile[] {
  const dir = join(ARCH_ROOT, "config/schema/postgres");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql") && !f.includes("seed"))
    .sort();

  return files.map((file) => {
    const text = readFileSync(join(dir, file), "utf8");
    const blocks = text.split(/(?=CREATE TABLE)/i).filter((b) => /CREATE TABLE/i.test(b));
    const tables = blocks.map(parseTableBlock).filter(Boolean) as PostgresTable[];
    return { file, tables };
  });
}

export function countPostgresTables(): number {
  return loadPostgresSchema().reduce((n, f) => n + f.tables.length, 0);
}
