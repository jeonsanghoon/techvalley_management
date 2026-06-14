#!/usr/bin/env node
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { readFileSync } from "node:fs";
import { appsRoot, configRoot } from "./lib/paths.mjs";

const sample = JSON.parse(
  readFileSync(join(configRoot, "samples/periodic_telemetry.samples.json"), "utf8"),
);
const payload = Array.isArray(sample) ? sample[0] : sample;
const event = {
  Records: [
    {
      eventSource: "aws:kinesis",
      kinesis: {
        data: Buffer.from(JSON.stringify({ ...payload, topic: "tv/factory/hk/HK-2024-00158/periodic/telemetry/report/json" })).toString("base64"),
        shardId: "shardId-000000000000",
      },
    },
  ],
};

const handlerPath = join(appsRoot, "stream-sync-consumer/bundle/handler.mjs");
const { handler } = await import(pathToFileURL(handlerPath).href);
const result = await handler(event, {});
console.log(JSON.stringify(result, null, 2));
