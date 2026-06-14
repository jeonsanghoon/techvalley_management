import { createHandler, getEnv } from "@techvalley/pipeline-core";

async function onEvent({ record }) {
  const shardId = record?.kinesis?.shardId ?? record?.shardId ?? "unknown";
  return {
    action: "dlq_shard_replay",
    shard_key: shardId,
    group_by: getEnv("DLQ_GROUP_BY", "shard_key"),
  };
}

export const handler = createHandler("dlq-shard-processor", { onEvent });
