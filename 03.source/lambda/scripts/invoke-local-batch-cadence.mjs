#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { appsRoot } from "./lib/paths.mjs";
import { applyLocalEnv, batchCadencePaths } from "./lib/local-env.mjs";
import { closeClients } from "../packages/pipeline-core/clients.mjs";

applyLocalEnv();
batchCadencePaths(appsRoot);

const cadenceId = process.argv[2] ?? "rollup_device_10min";
const event = { cadence_id: cadenceId, schedule_key: cadenceId, kind: "telemetry_rollup" };

const handlerPath = join(appsRoot, "batch-cadence-runner/bundle/handler.mjs");
const { handler } = await import(pathToFileURL(handlerPath).href);
try {
  const result = await handler(event, {});
  console.log(JSON.stringify(result, null, 2));
} finally {
  await closeClients();
}
