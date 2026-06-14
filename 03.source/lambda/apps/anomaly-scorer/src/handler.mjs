import { createHandler, decodeKinesisRecord, getEnv } from "@techvalley/pipeline-core";

async function onEvent({ record }) {
  const payload = decodeKinesisRecord(record) ?? record;
  return {
    action: "anomaly_score",
    endpoint: getEnv("SAGEMAKER_ENDPOINT_NAME"),
    table: getEnv("ANOMALY_EVENTS_TABLE"),
    device_code: payload?.device_code,
    score: payload?.anomaly_score ?? null,
  };
}

export const handler = createHandler("anomaly-scorer", { onEvent });
