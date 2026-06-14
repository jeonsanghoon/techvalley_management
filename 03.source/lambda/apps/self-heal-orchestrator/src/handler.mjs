import { createHandler, getEnv } from "@techvalley/pipeline-core";

async function onEvent({ event }) {
  return {
    action: "self_heal_orchestrate",
    table: getEnv("SELF_HEAL_PLAYBOOKS_TABLE"),
    playbook_id: event?.playbook_id,
    device_code: event?.device_code,
    step: event?.step ?? "evaluate",
  };
}

export const handler = createHandler("self-heal-orchestrator", { onEvent });
