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
