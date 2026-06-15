#!/usr/bin/env node
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { readFileSync } from "node:fs";
import { appsRoot, configRoot } from "./lib/paths.mjs";
import { applyLocalEnv, streamSyncPaths } from "./lib/local-env.mjs";
import { closeClients } from "../packages/pipeline-core/clients.mjs";

applyLocalEnv();
streamSyncPaths(appsRoot);

const alarmMode = process.argv.includes("--alarm");
const sample = JSON.parse(
  readFileSync(join(configRoot, "samples/periodic_telemetry.samples.json"), "utf8"),
);
const payload = structuredClone(Array.isArray(sample) ? sample[0] : sample);
if (alarmMode) {
  payload.data = payload.data.map((d) =>
    d.key === "tube.kv" ? { ...d, value: 185.0 } : d,
  );
  delete payload.metric_values_kv;
}

const topic = "tv/factory/hk/HK-2024-00158/periodic/telemetry/report/json";
const event = {
  Records: [
    {
      eventSource: "aws:kinesis",
      kinesis: {
        data: Buffer.from(JSON.stringify({ ...payload, topic })).toString("base64"),
        shardId: "shardId-000000000000",
      },
    },
  ],
};

const handlerPath = join(appsRoot, "stream-sync-consumer/bundle/handler.mjs");
const { handler } = await import(pathToFileURL(handlerPath).href);
try {
  const result = await handler(event, {});
  console.log(JSON.stringify(result, null, 2));
  if (alarmMode && !result.results?.[0]?.alarms_fired?.length) {
    console.error("expected alarm from high tube.kv sample");
    process.exit(1);
  }
} finally {
  await closeClients();
}
