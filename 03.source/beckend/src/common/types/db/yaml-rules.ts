/** 02.arch/config/rules/*.json YAML ruleset mirror */

export interface YamlAlertWhen {
  path?: string;
  op?: string;
  value?: unknown;
}

export interface YamlAlertRule {
  id: string;
  severity?: string;
  when?: YamlAlertWhen;
}

export interface YamlRuleFile {
  rule_code: string;
  alerts_raw?: YamlAlertRule[];
}
