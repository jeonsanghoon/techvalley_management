#!/usr/bin/env node
/** 02.arch/config → 90.infra/config · 03.source/lambda/config 동기화 */
import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const src = join(repo, "02.arch/config");
const infra = join(repo, "90.infra/config");
const lambdaCfg = join(repo, "03.source/lambda/config");

function copyDir(from, to, exclude = []) {
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from)) {
    if (exclude.includes(name)) continue;
    cpSync(join(from, name), join(to, name), { recursive: true });
  }
}

copyDir(src, infra, ["scripts", "local"]);
copyDir(join(src, "converter-rules"), join(lambdaCfg, "converter-rules"));
copyDir(join(src, "rules"), join(lambdaCfg, "rules"));
// 로컬 Podman/Compose SSOT: 90.infra/10.local/ (sync 대상 아님)
console.log("synced: 02.arch/config → 90.infra/config, 03.source/lambda/config");
