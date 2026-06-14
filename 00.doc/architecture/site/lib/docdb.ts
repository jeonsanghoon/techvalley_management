import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { ARCH_ROOT } from "./docs";

export type DocDbIndex = { keys: Record<string, number>; unique?: boolean; name?: string };
export type DocDbCollection = {
  name: string;
  description?: string;
  indexes: DocDbIndex[];
  ttl?: string;
};

type YamlCollection = {
  name: string;
  description?: string;
  indexes?: DocDbIndex[];
  ttl?: { field?: string; expire_after_seconds?: number };
};

export function loadDocDbCollections(): DocDbCollection[] {
  const path = join(ARCH_ROOT, "config/manifest/processes/03-documentdb.yaml");
  const doc = parseYaml(readFileSync(path, "utf8")) as {
    documentdb?: { collections?: YamlCollection[] };
  };
  const collections = doc.documentdb?.collections ?? [];
  return collections.map((c) => ({
    name: c.name,
    description: c.description,
    indexes: c.indexes ?? [],
    ttl: c.ttl?.expire_after_seconds
      ? `${c.ttl.field ?? "?"} / ${c.ttl.expire_after_seconds}s`
      : undefined,
  }));
}

export function countDocDbCollections(): number {
  return loadDocDbCollections().length;
}

export type RdbmsLink = {
  id: string;
  documentdbField: string;
  postgresTables: string[];
};

export function loadRdbmsLinks(): RdbmsLink[] {
  const path = join(ARCH_ROOT, "config/manifest/processes/03-documentdb.yaml");
  const doc = parseYaml(readFileSync(path, "utf8")) as {
    documentdb?: {
      rdbms_time_series_link?: {
        links?: {
          id: string;
          documentdb?: { field?: string; composite_fields?: string[] };
          postgres?: { table: string }[];
        }[];
      };
    };
  };
  const links = doc.documentdb?.rdbms_time_series_link?.links ?? [];
  return links.map((l) => ({
    id: l.id,
    documentdbField:
      l.documentdb?.field ??
      (l.documentdb?.composite_fields?.join(" + ") || "—"),
    postgresTables: [...new Set((l.postgres ?? []).map((p) => p.table))],
  }));
}
