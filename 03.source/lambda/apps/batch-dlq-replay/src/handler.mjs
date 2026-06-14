import { createHandler, getEnv } from "@techvalley/pipeline-core";

async function onEvent({ event }) {
  return {
    action: "batch_dlq_replay",
    mode: getEnv("REPLAY_MODE", "invoke_original_lambda"),
    group_by: getEnv("GROUP_BY_FIELD", "cadence_id"),
    cadence_id: event?.cadence_id,
  };
}

export const handler = createHandler("batch-dlq-replay", { onEvent });
