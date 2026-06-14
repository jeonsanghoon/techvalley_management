#!/usr/bin/env node
/** DocumentDB 컬렉션·인덱스 — manifest/processes/03-documentdb.yaml 기준 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const repo = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const lambdaModules = join(repo, "03.source/lambda/node_modules/mongodb");

const docdb = parseYaml(
  readFileSync(join(repo, "02.arch/config/manifest/processes/03-documentdb.yaml"), "utf8"),
);
const uri =
  process.env.MONGO_URI ??
  process.env.TV_MONGO_URI ??
  "mongodb://tv:tv_local_dev@127.0.0.1:27000/iot_service?authSource=admin&directConnection=true";
const dbName = docdb.documentdb?.database ?? "iot_service";

const { MongoClient } = await import(lambdaModules).catch(() => import("mongodb")).catch(() => {
  console.error("mongodb driver missing — cd 03.source/lambda && npm install");
  process.exit(1);
});

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
