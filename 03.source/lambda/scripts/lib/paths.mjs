import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
export const lambdaRoot = join(scriptsDir, "../..");
export const repoRoot = join(lambdaRoot, "../..");
export const configRoot = join(repoRoot, "02.arch/config");
export const infraRoot = join(repoRoot, "90.infra");
export const appsRoot = join(lambdaRoot, "apps");
