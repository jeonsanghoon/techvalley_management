import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { configRoot } from "./paths.mjs";

let cached;

export function loadIngressDeploy() {
  if (!cached) {
    cached = parseYaml(readFileSync(join(configRoot, "ingress-deploy.yaml"), "utf8"));
  }
  return cached;
}

export function loadInfrastructure() {
  return parseYaml(readFileSync(join(configRoot, "infrastructure.yaml"), "utf8"));
}

export function loadBatchCadence() {
  return parseYaml(readFileSync(join(configRoot, "02-batch-cadence.yaml"), "utf8"));
}

export function loadManifest() {
  return parseYaml(
    readFileSync(join(configRoot, "manifest/01-data-platform.manifest.yaml"), "utf8"),
  );
}

export function appDirName(terraformMapKey) {
  return String(terraformMapKey).replace(/_/g, "-");
}

export function resolveBundlePath(lambdaKey, cfg, pkg = loadIngressDeploy().lambda_package) {
  const dir = cfg.app_dir ?? appDirName(cfg.terraform_map_key ?? lambdaKey);
  return join(pkg.apps_root.replace("../../", ""), dir, pkg.bundle_dir);
}
