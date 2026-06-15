import { getMongo, getPgPool, loadYamlFile, upsertMongo } from "./clients.mjs";
import { getEnv } from "./kinesis.mjs";

function findCadence(config, cadenceId) {
  return (config.cadences ?? []).find((c) => c.id === cadenceId);
}

async function rollupDevice10Min(db, cadence) {
  const src = cadence.storage?.documentdb?.read_collections?.[0] ?? "periodic_telemetry";
  const dst = cadence.storage?.documentdb?.write_collections?.[0] ?? "telemetry_rollups_device_10min";
  const rows = await db.collection(src).find({}).sort({ device_timestamp: -1 }).limit(500).toArray();
  const buckets = new Map();

  for (const row of rows) {
    const key = `${row.device_code}:${row.base_time}`;
    if (!buckets.has(key)) {
      buckets.set(key, {
        device_code: row.device_code,
        base_time: row.base_time,
        site_id: row.site_id,
        customer_id: row.customer_id,
        count: 0,
        metric_values_kv: {},
      });
    }
    const b = buckets.get(key);
    b.count += 1;
    Object.assign(b.metric_values_kv, row.metric_values_kv ?? {});
  }

  let written = 0;
  for (const doc of buckets.values()) {
    doc.updated_at = new Date().toISOString();
    await upsertMongo(db, dst, doc, ["device_code", "base_time"]);
    written += 1;
  }
  return { cadence: cadence.id, rollup_docs: written, source_rows: rows.length };
}

async function fleetHourlyExport(pg) {
  const stats = await pg.query(`
    SELECT
      COUNT(*)::int AS fleet_size,
      COUNT(*) FILTER (WHERE operational_status_type = 1)::int AS online
    FROM device`);
  const row = stats.rows[0] ?? { fleet_size: 0, online: 0 };
  const critical = await pg.query(
    `SELECT COUNT(*)::int AS c FROM communication_alarm_incident WHERE incident_status = 'open'`,
  );
  const criticalOpen = critical.rows[0]?.c ?? 0;
  const asOf = new Date().toISOString();
  const uptimePct = row.fleet_size > 0 ? (row.online / row.fleet_size) * 100 : 0;
  await pg.query(
    `INSERT INTO sla_fleet_snapshot (snapshot_at, fleet_size, uptime_pct, critical_open_count, metrics_json)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [
      asOf,
      row.fleet_size,
      uptimePct,
      criticalOpen,
      JSON.stringify({ source: "batch-cadence-runner", online: row.online }),
    ],
  );
  return { cadence: "fleet_hourly_export", fleet_size: row.fleet_size, online: row.online, snapshot_at: asOf };
}

async function communicationQualityEval(db, pg) {
  const alarms = await db
    .collection("device_notifications")
    .find({ acknowledged: false })
    .limit(50)
    .toArray();
  let inserted = 0;
  for (const a of alarms) {
    const exists = await pg.query(
      `SELECT 1 FROM communication_alarm_incident
       WHERE device_code = $1 AND alert_code = $2 AND incident_status = 'open' LIMIT 1`,
      [a.device_code, a.alarm_code],
    );
    if (exists.rowCount > 0) continue;

    const dev = await pg.query(
      `SELECT d.id AS device_id, d.device_code, s.id AS site_id, p.id AS product_id,
              c.id AS company_id, b.id AS branch_id, c.id AS tenant_id
       FROM device d
       JOIN site s ON s.id = d.site_id
       LEFT JOIN branch b ON b.id = s.branch_id
       JOIN company c ON c.id = COALESCE(s.company_id, b.company_id)
       JOIN product p ON p.id = d.product_id
       WHERE d.device_code = $1 LIMIT 1`,
      [a.device_code],
    );
    const d = dev.rows[0];
    if (!d) continue;

    const severityType = a.severity === "critical" ? 3 : 2;
    await pg.query(
      `INSERT INTO communication_alarm_incident
        (tenant_id, alert_code, alarm_type_code, rule_code, severity_type, alarm_grade_type,
         incident_status, company_id, branch_id, site_id, product_id, device_id, device_code, opened_at, remark)
       VALUES ($1, $2, $3, $4, $5, 1, 'open', $6, $7, $8, $9, $10, $11, to_timestamp($12 / 1000.0), $13)`,
      [
        d.tenant_id,
        a.alarm_code,
        "telemetry_threshold",
        a.meta?.rule_code ?? "rule_periodic_telemetry_v1",
        severityType,
        d.company_id,
        d.branch_id,
        d.site_id,
        d.product_id,
        d.device_id,
        a.device_code,
        a.device_timestamp ?? Date.now(),
        a.message ?? "pipeline alerts_raw",
      ],
    );
    inserted += 1;
  }
  return { cadence: "communication_quality_eval_10m", alarm_docs: alarms.length, pg_inserted: inserted };
}

export async function runCadence(event, options = {}) {
  const cadenceId = event.cadence_id ?? event.schedule_key;
  const configPath =
    options.batchCadencePath ?? getEnv("BATCH_CADENCE_CONFIG_PATH", "/var/task/config/02-batch-cadence.yaml");
  const config = loadYamlFile(configPath);
  const cadence = findCadence(config, cadenceId);
  if (!cadence) throw new Error(`unknown cadence_id: ${cadenceId}`);

  const db = await getMongo("iot_service");
  const pg = await getPgPool();

  switch (cadenceId) {
    case "rollup_device_10min":
      return rollupDevice10Min(db, cadence);
    case "fleet_hourly_export":
      return fleetHourlyExport(pg);
    case "communication_quality_eval_10m":
      return communicationQualityEval(db, pg);
    case "rollup_hourly":
    case "rollup_daily":
    case "alarm_daily_rollup":
      return { cadence: cadenceId, status: "noop_local_stub", note: "extend in cadence-executor" };
    default:
      return { cadence: cadenceId, status: "skipped", enabled: cadence.enabled !== false };
  }
}
