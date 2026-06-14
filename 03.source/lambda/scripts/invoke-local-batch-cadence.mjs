#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { appsRoot } from "./lib/paths.mjs";

const event = {
  cadence_id: "rollup_device_10min",
  schedule_key: "rollup_device_10min",
  kind: "telemetry_rollup",
};

const handlerPath = join(appsRoot, "batch-cadence-runner/bundle/handler.mjs");
const { handler } = await import(pathToFileURL(handlerPath).href);
const result = await handler(event, {});
console.log(JSON.stringify(result, null, 2));
