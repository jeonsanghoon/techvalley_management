import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { matchTopicRoute } from "./topic-router.mjs";
import { convertPayload } from "./converter.mjs";
import { evaluateAlertsRaw, toAlarmNotificationDoc } from "./alerts-raw.mjs";
import { getMongo, getPgPool, loadYamlFile, loadJsonFile, upsertMongo, resolveDeviceOrg } from "./clients.mjs";
import { decodeKinesisRecord, getEnv } from "./kinesis.mjs";

function loadRule(rulesDir, ruleCode) {
  return loadJsonFile(join(rulesDir, `${ruleCode}.json`));
}

export async function processStreamRecord(record, options = {}) {
  const normalizePath =
    options.normalizeConfigPath ?? getEnv("NORMALIZE_CONFIG_PATH", "/var/task/config/normalize-config.default.yaml");
  const rulesDir = options.rulesDir ?? getEnv("RULES_DIR", "/var/task/rules");

  const raw = decodeKinesisRecord(record) ?? record;
  const topic = raw.topic ?? raw.meta?.topic ?? "";
  const normalizeConfig = loadYamlFile(normalizePath);
  const route = matchTopicRoute(normalizeConfig, topic);

  if (!route.rule_code) {
    const db = await getMongo(normalizeConfig.mongo?.database ?? "iot_service");
    await db.collection(route.collection).insertOne({ ...raw, topic, ingested_at: new Date() });
    return { action: "stream_sync", topic, collection: route.collection, stored: true, rule: null };
  }

  const rule = loadRule(rulesDir, route.rule_code);
  let doc = convertPayload(rule, raw, topic);

  const pg = await getPgPool();
  const org = await resolveDeviceOrg(pg, doc.device_code);
  doc.site_id = doc.site_id ?? org.site_code ?? org.site_id;
  doc.customer_id = doc.customer_id ?? org.customer_id;

  const alerts = evaluateAlertsRaw(doc, rule);
  const db = await getMongo(normalizeConfig.mongo?.database ?? "iot_service");

  const target = rule.targets?.[0];
  const uk = target?.unique_key ?? ["device_code", "device_timestamp", "data_index"];
  const sink = await upsertMongo(db, route.collection, doc, uk);

  const alarmDocs = [];
  for (const a of alerts) {
    const nd = toAlarmNotificationDoc(doc, a, topic);
    await upsertMongo(db, "device_notifications", nd, ["device_code", "device_timestamp", "data_index"]);
    alarmDocs.push(nd.alarm_code);
  }

  return {
    action: "stream_sync",
    topic,
    device_code: doc.device_code,
    collection: route.collection,
    rule_code: route.rule_code,
    stored: true,
    sink,
    alarms_fired: alarmDocs,
    is_alarm: doc.is_alarm ?? false,
  };
}

export function loadRulesDir(rulesDir) {
  return readdirSync(rulesDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => loadJsonFile(join(rulesDir, f)));
}
