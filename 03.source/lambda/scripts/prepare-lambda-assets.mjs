#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const r = spawnSync(process.execPath, [join(scriptsDir, "stage-bundles.mjs")], {
  stdio: "inherit",
});
if (r.status !== 0) process.exit(r.status ?? 1);
console.log("OK: lambda bundles staged");
