import { createHandler, processStreamRecord } from "@techvalley/pipeline-core";

async function onEvent({ record }) {
  return processStreamRecord(record);
}

export const handler = createHandler("stream-sync-consumer", { onEvent });
