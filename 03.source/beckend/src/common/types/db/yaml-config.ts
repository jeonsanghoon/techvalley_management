/** 02.arch/config YAML 스키마 (read-only pipeline) */

export interface IngressDeployYaml {
  kinesis?: Record<string, unknown>;
  lambdas?: Record<string, unknown>;
}

export interface NormalizeConfigYaml {
  routes?: unknown[];
  mongo?: { database?: string };
}

export interface BatchCadenceYaml {
  cadences?: Array<{ id: string; enabled?: boolean }>;
}
