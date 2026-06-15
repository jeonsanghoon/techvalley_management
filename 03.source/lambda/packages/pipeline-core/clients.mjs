import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { mongoUri, postgresUri } from "./env.mjs";

let _mongo;
let _pg;

export async function getMongo(dbName = "iot_service") {
  if (!_mongo) {
    const { MongoClient } = await import("mongodb");
    _mongo = new MongoClient(mongoUri());
    await _mongo.connect();
  }
  return _mongo.db(dbName);
}

export async function getPgPool() {
  if (!_pg) {
    const pg = await import("pg");
    _pg = new pg.default.Pool({ connectionString: postgresUri() });
  }
  return _pg;
}

export async function closeClients() {
  if (_mongo) {
    await _mongo.close();
    _mongo = null;
  }
  if (_pg) {
    await _pg.end();
    _pg = null;
  }
}

export function loadYamlFile(path) {
  return parseYaml(readFileSync(path, "utf8"));
}

export function loadJsonFile(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export async function upsertMongo(db, collection, doc, uniqueKey) {
  const filter = {};
  for (const k of uniqueKey) filter[k] = doc[k];
  const r = await db.collection(collection).updateOne(filter, { $set: doc }, { upsert: true });
  return { collection, matched: r.matchedCount, upserted: r.upsertedCount > 0 };
}

export async function resolveDeviceOrg(pg, deviceCode) {
  const q = `
    SELECT d.device_code, d.site_id, s.code AS site_code, c.code AS company_code
    FROM device d
    LEFT JOIN site s ON s.id = d.site_id
    LEFT JOIN branch b ON b.id = s.branch_id
    LEFT JOIN company c ON c.id = COALESCE(b.company_id, s.company_id)
    WHERE d.device_code = $1
    LIMIT 1`;
  const { rows } = await pg.query(q, [deviceCode]);
  if (!rows[0]) {
    return { site_id: null, customer_id: null, site_code: null, company_code: null };
  }
  return {
    site_id: rows[0].site_id,
    site_code: rows[0].site_code,
    customer_id: rows[0].company_code,
    company_code: rows[0].company_code,
  };
}
