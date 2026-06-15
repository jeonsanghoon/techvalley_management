#!/usr/bin/env node
/** DocumentDB 컬렉션·인덱스 — manifest/processes/03-documentdb.yaml 기준 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const localDir = dirname(fileURLToPath(import.meta.url));
const infra = join(localDir, "..");
const repo = join(infra, "..");

async function importFromRepo(pkg) {
  const roots = [
    join(repo, "03.source/lambda/node_modules", pkg),
    join(repo, "03.source/beckend/node_modules", pkg),
  ];
  for (const root of roots) {
    const dist = join(root, "dist/index.js");
    const pkgJson = join(root, "package.json");
    if (existsSync(dist)) {
      return import(pathToFileURL(dist).href);
    }
    if (existsSync(pkgJson)) {
      const meta = JSON.parse(readFileSync(pkgJson, "utf8"));
      const entry = meta.module ?? meta.main;
      if (entry && existsSync(join(root, entry))) {
        return import(pathToFileURL(join(root, entry)).href);
      }
    }
  }
  return import(pkg);
}

const { parse: parseYaml } = await importFromRepo("yaml");
const { MongoClient } = await importFromRepo("mongodb").catch(() => {
  console.error("mongodb driver missing — run: npm install --prefix 03.source/lambda");
  process.exit(1);
});

const docdb = parseYaml(
  readFileSync(join(infra, "config/manifest/processes/03-documentdb.yaml"), "utf8"),
);
const uri =
  process.env.MONGO_URI ??
  process.env.TV_MONGO_URI ??
  "mongodb://tv:tv_local_dev@127.0.0.1:37017/iot_service?authSource=admin&directConnection=true";
const dbName = docdb.documentdb?.database ?? "iot_service";

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);

for (const col of docdb.documentdb?.collections ?? []) {
  const names = await db.listCollections({ name: col.name }).toArray();
  if (names.length === 0) await db.createCollection(col.name);
  for (const idx of col.indexes ?? []) {
    const keys = idx.keys ?? idx;
    const options = { ...(idx.options ?? {}), name: idx.options?.name ?? undefined };
    await db.collection(col.name).createIndex(keys, options);
  }
  console.log("OK:", col.name, `(${(col.indexes ?? []).length} indexes)`);
}

await client.close();
console.log("documentdb bootstrap OK:", dbName);
