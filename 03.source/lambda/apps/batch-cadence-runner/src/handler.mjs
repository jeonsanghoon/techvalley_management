import { createHandler, runCadence } from "@techvalley/pipeline-core";

async function onEvent({ record, event }) {
  const payload = record?.cadence_id ? record : event;
  return runCadence(payload);
}

export const handler = createHandler("batch-cadence-runner", { onEvent });
