import { createHandler, decodeKinesisRecord, getEnv } from "@techvalley/pipeline-core";

async function onEvent({ record, event }) {
  const payload = decodeKinesisRecord(record) ?? event?.payload ?? event;
  return {
    action: "payload_convert",
    rules_dir: getEnv("RULES_DIR", "/var/task/rules"),
    rule_id: payload?.rule_id ?? payload?.metadata?.rule_id,
  };
}

export const handler = createHandler("payload-converter", { onEvent });
