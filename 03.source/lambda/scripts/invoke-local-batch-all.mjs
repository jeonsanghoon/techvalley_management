#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { appsRoot } from "./lib/paths.mjs";
import { applyLocalEnv, batchCadencePaths } from "./lib/local-env.mjs";
import { closeClients } from "../packages/pipeline-core/clients.mjs";

const CADENCES = [
  "rollup_device_10min",
  "fleet_hourly_export",
  "communication_quality_eval_10m",
];

applyLocalEnv();
batchCadencePaths(appsRoot);

const handlerPath = join(appsRoot, "batch-cadence-runner/bundle/handler.mjs");
const { handler } = await import(pathToFileURL(handlerPath).href);

try {
  for (const cadence_id of CADENCES) {
    const result = await handler({ cadence_id, schedule_key: cadence_id }, {});
    console.log(JSON.stringify(result));
  }
} finally {
  await closeClients();
}
