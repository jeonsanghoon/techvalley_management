import { createHandler, getEnv } from "@techvalley/pipeline-core";

async function onEvent({ record, event }) {
  const cadenceId = event?.cadence_id ?? record?.cadence_id ?? "unknown";
  return {
    action: "batch_cadence_run",
    cadence_id: cadenceId,
    scheduler: getEnv("TV_BATCH_SCHEDULER", "eventbridge"),
    dlq_collection: getEnv("BATCH_DLQ_COLLECTION", "pipeline_dlq_events"),
  };
}

export const handler = createHandler("batch-cadence-runner", { onEvent });
