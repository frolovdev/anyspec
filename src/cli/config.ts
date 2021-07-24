import { rulesMap } from '../validation';
import { default as nodePath } from 'path';

type Config = { rules: Record<string, 'error' | 'off'> };

type ConfigRes = { res: Config; err: null } | { err: string; res: null };

const isConfig = (configFile: unknown): configFile is Config => {
  return (configFile as Config).rules !== undefined;
};

export function readConfig(path?: string): ConfigRes {
  const resolvedPath = resolveConfigPath(path);
  try {
    const configFile = require(resolvedPath);

    if (!isConfig(configFile)) {
      return { err: `Invalid config file`, res: null };
    }
    return { res: configFile, err: null };
  } catch (e) {
    return { err: `Can't find anyspec.config.js in ${resolvedPath}`, res: null };
  }
}

export function parseConfig({ rules }: Config): { enabledRules: string[]; invalidRules: string[] } {
  const existingRules = Object.keys(rulesMap);
  const enabled = Object.keys(rules).filter((key) => rules[key] === 'error');
  const invalidRules = enabled.filter((rule) => !existingRules.includes(rule));
  const validRules = enabled.filter((rule) => existingRules.includes(rule));
  return { enabledRules: validRules, invalidRules };
}

function resolveConfigPath(path?: string) {
  if (path) {
    return nodePath.isAbsolute(path) ? path : nodePath.resolve(process.cwd(), path);
  }

  return nodePath.resolve(process.cwd(), 'anyspec.config');
}
