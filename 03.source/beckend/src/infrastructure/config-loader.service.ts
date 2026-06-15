import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';
import type { YamlRuleFile } from '../common/types/db/yaml-rules';

@Injectable()
export class ConfigLoaderService {
  get configRoot() {
    return join(process.cwd(), '../../02.arch/config');
  }

  loadYaml(name: string): Record<string, unknown> {
    return parseYaml(readFileSync(join(this.configRoot, name), 'utf8')) as Record<string, unknown>;
  }

  loadRules(): YamlRuleFile[] {
    const dir = join(this.configRoot, 'rules');
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as YamlRuleFile);
  }
}
