/** @techvalley/pipeline-core — Lambda 공통 유틸 (테크밸리) */

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

export function decodeKinesisRecord(record) {
  if (!record?.kinesis?.data) return null;
  const raw = Buffer.from(record.kinesis.data, "base64").toString("utf8");
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}

export function getEnv(name, fallback = "") {
  return process.env[name] ?? fallback;
}

export function partitionKey(payload, field = "device_code") {
  return payload?.[field] ?? payload?.device?.code ?? "unknown";
}
