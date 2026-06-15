/** @techvalley/pipeline-core — Lambda 공통 유틸 (테크밸리) */

import { decodeKinesisRecord, getEnv, partitionKey } from "./kinesis.mjs";

export { decodeKinesisRecord, getEnv, partitionKey };
export { processStreamRecord } from "./stream-sync.mjs";
export { runCadence } from "./cadence-executor.mjs";
export { matchTopicRoute, parseTopicSegments } from "./topic-router.mjs";
export { convertPayload, computeBaseTime } from "./converter.mjs";
export { evaluateAlertsRaw, toAlarmNotificationDoc } from "./alerts-raw.mjs";
export {
  getMongo,
  getPgPool,
  closeClients,
  loadYamlFile,
  loadJsonFile,
  upsertMongo,
  resolveDeviceOrg,
} from "./clients.mjs";
export { mongoUri, postgresUri, minioConfig } from "./env.mjs";

export function createHandler(appName, options = {}) {
  const { onEvent = defaultOnEvent } = options;

  return async function handler(event, context) {
    const started = Date.now();
    const records = normalizeRecords(event);
    const results = [];

    for (const record of records) {
      try {
        results.push(await onEvent({ appName, record, event, context }));
      } catch (err) {
        console.error(JSON.stringify({ appName, error: String(err), recordPreview: preview(record) }));
        throw err;
      }
    }

    return {
      app: appName,
      processed: results.length,
      durationMs: Date.now() - started,
      results,
    };
  };
}

function normalizeRecords(event) {
  if (Array.isArray(event?.Records)) return event.Records;
  if (event?.detail) return [event.detail];
  if (event?.cadence_id) return [event];
  return [event ?? {}];
}

function preview(record) {
  const body = record?.kinesis?.data ?? record?.body ?? record;
  if (typeof body === "string" && body.length > 120) return `${body.slice(0, 120)}…`;
  return body;
}

async function defaultOnEvent({ appName, record }) {
  return { appName, status: "ok", recordType: record?.eventSource ?? "direct" };
}
