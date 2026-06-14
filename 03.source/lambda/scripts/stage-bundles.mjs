#!/usr/bin/env node
import { cpSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { loadIngressDeploy, appDirName } from "./lib/deploy-config.mjs";
import { appsRoot, configRoot } from "./lib/paths.mjs";

const STAGE_FILES = {
  "stream-sync-consumer": [
    { from: "normalize-config.default.yaml", to: "config/normalize-config.default.yaml" },
    { from: "rules", to: "rules", dir: true },
  ],
  "batch-cadence-runner": [
    { from: "02-batch-cadence.yaml", to: "config/02-batch-cadence.yaml" },
  ],
  "payload-converter": [{ from: "rules", to: "rules", dir: true }],
  "file-upload-orchestrator": [
    { from: "media-upload.yaml", to: "config/media-upload.yaml" },
    { from: "rules", to: "rules", dir: true },
  ],
  "anomaly-scorer": [{ from: "rules", to: "rules", dir: true }],
};

function stageApp(appDir, bundleDir) {
  const srcHandler = join(appsRoot, appDir, "src/handler.mjs");
  mkdirSync(bundleDir, { recursive: true });

  const handlerSrc = readFileSync(srcHandler, "utf8");
  writeFileSync(join(bundleDir, "handler.mjs"), handlerSrc);
  writeFileSync(join(bundleDir, "lambda.mjs"), 'export { handler } from "./handler.mjs";\n');

  writeFileSync(
    join(bundleDir, "package.json"),
    JSON.stringify({ type: "module", name: `@techvalley/${appDir}` }, null, 2),
  );

  const coreSrc = join(appsRoot, "..", "packages/pipeline-core");
  mkdirSync(join(bundleDir, "node_modules/@techvalley/pipeline-core"), { recursive: true });
  for (const f of readdirSync(coreSrc).filter((n) => n.endsWith(".mjs"))) {
    cpSync(join(coreSrc, f), join(bundleDir, "node_modules/@techvalley/pipeline-core", f));
  }
  writeFileSync(
    join(bundleDir, "node_modules/@techvalley/pipeline-core/package.json"),
    JSON.stringify({ type: "module", name: "@techvalley/pipeline-core", main: "index.mjs" }, null, 2),
  );

  const extras = STAGE_FILES[appDir] ?? [];
  for (const item of extras) {
    const src = join(configRoot, item.from);
    const dest = join(bundleDir, item.to);
    if (item.dir) {
      mkdirSync(dest, { recursive: true });
      for (const f of readdirSync(src)) {
        cpSync(join(src, f), join(dest, f));
      }
    } else {
      mkdirSync(join(bundleDir, "config"), { recursive: true });
      cpSync(src, dest);
    }
  }
}

const ingress = loadIngressDeploy();
for (const [key, cfg] of Object.entries(ingress.lambdas ?? {})) {
  const appDir = cfg.app_dir ?? appDirName(cfg.terraform_map_key ?? key);
  const bundleDir = join(appsRoot, appDir, "bundle");
  try {
    rmSync(bundleDir, { recursive: true, force: true });
  } catch {
    /* empty */
  }
  stageApp(appDir, bundleDir);
  console.log("staged:", appDir);
}
