import { createHandler, getEnv } from "@techvalley/pipeline-core";

async function onEvent({ event }) {
  return {
    action: "rule_recommend",
    table: getEnv("RULE_RECOMMENDATIONS_TABLE"),
    device_code: event?.device_code,
    recommendation_id: event?.recommendation_id,
  };
}

export const handler = createHandler("rule-recommender", { onEvent });
