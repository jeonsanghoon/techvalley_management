import { createHandler, decodeKinesisRecord, partitionKey, getEnv } from "@techvalley/pipeline-core";

async function onEvent({ record }) {
  const payload = decodeKinesisRecord(record) ?? record;
  const keyField = getEnv("PARTITION_KEY_FIELD", "device_code");
  return {
    action: "stream_sync",
    device_code: partitionKey(payload, keyField),
    topic: payload?.topic,
    stored: true,
  };
}

export const handler = createHandler("stream-sync-consumer", { onEvent });
