/** rules/*.json payload transform — json_to_json + metric_kv_catalog */

function getPath(obj, path) {
  return String(path)
    .split(".")
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function setPath(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] == null) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
}

function coerce(value, type) {
  if (value == null) return value;
  switch (type) {
    case "int64":
    case "number":
      return Number(value);
    case "string":
      return String(value);
    case "array":
      return Array.isArray(value) ? value : [value];
    default:
      return value;
  }
}

function applyMetricKvCatalog(doc, rule) {
  const catalog = rule.metric_kv_catalog;
  if (!catalog?.pivot || !catalog.source_array) return doc;
  const arr = doc[catalog.source_array];
  if (!Array.isArray(arr)) return doc;
  const kv = {};
  for (const item of arr) {
    const k = item[catalog.pivot.key_field];
    if (k != null) kv[k] = item[catalog.pivot.value_field];
  }
  doc[catalog.pivot.into ?? "metric_values_kv"] = kv;
  return doc;
}

export function convertPayload(rule, raw, topic) {
  const doc = structuredClone(raw ?? {});
  const map = rule?.payload?.map ?? [];
  const out = {};

  for (const m of map) {
    let val = m.from.includes(".") ? getPath(doc, m.from) : doc[m.from];
    if (val === undefined && m.from === "deviceId") val = doc.device_code ?? doc.deviceId;
    if (m.required && (val === undefined || val === null)) {
      throw new Error(`converter missing required field: ${m.from}`);
    }
    if (val !== undefined) out[m.to] = coerce(val, m.target_type);
  }

  if (!out.device_code && doc.device_code) out.device_code = doc.device_code;
  if (!out.device_timestamp && doc.timestamp) out.device_timestamp = Number(doc.timestamp);
  if (out.device_timestamp == null && doc.device_timestamp != null) {
    out.device_timestamp = Number(doc.device_timestamp);
  }
  if (out.data_index == null) out.data_index = doc.data_index ?? 0;

  out.meta = {
    ...(doc.meta ?? {}),
    topic,
    rule_code: rule.rule_code,
    ingest_source: "stream-sync",
  };
  out.rule_code = rule.rule_code;
  out.data = doc.data ?? doc.datas ?? out.data;
  out.created_at = new Date().toISOString();

  applyMetricKvCatalog(out, rule);
  out.base_time = computeBaseTime(out.device_timestamp);
  out.base_hour = Math.floor(out.base_time / 100);

  return out;
}

export function computeBaseTime(deviceTimestampMs) {
  const d = new Date(Number(deviceTimestampMs));
  const min = Math.floor(d.getUTCMinutes() / 10) * 10;
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const da = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(min).padStart(2, "0");
  return Number(`${y}${mo}${da}${h}${m}`);
}

export { getPath };
