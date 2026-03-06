/*
 * Copyright 2026 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  unlinkSync,
  existsSync,
} from 'node:fs';
import { randomBytes } from 'node:crypto';
import { tmpdir } from 'node:os';
import { resolve, join, dirname, sep } from 'node:path';
import Module from 'node:module';

export const BACKEND_ROLES = new Set([
  'backend',
  'backend-plugin',
  'backend-plugin-module',
  'cli',
  'node-library',
]);

export const VALID_ENGINES = new Set(['eslint', 'oxlint']);

export function resolveOxlintBin(): string {
  let oxlintMain: string;
  try {
    oxlintMain = require.resolve('oxlint');
  } catch {
    throw new Error(
      "oxlint is not installed. Install it with 'yarn add --dev oxlint oxlint-tsgolint' or remove --engine oxlint from your lint scripts.",
    );
  }
  return resolve(dirname(oxlintMain), '../bin/oxlint');
}

export function resolveConfigDir(): string {
  // Use require.resolve to respect workspace resolution
  const configPath = require.resolve('@backstage/cli/config/oxlint.json');
  return dirname(configPath);
}

export function loadAndAdjustConfig(
  role: string | undefined,
  overrideConfigDir?: string,
): {
  config: Record<string, any>;
  configDir: string;
} {
  const configDir = overrideConfigDir ?? resolveConfigDir();
  const configPath = join(configDir, 'oxlint.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));

  // Resolve JS plugin paths to absolute (they're relative to config dir)
  if (config.jsPlugins) {
    config.jsPlugins = config.jsPlugins.map((p: string) =>
      resolve(configDir, p),
    );
  }

  // Expand no-restricted-globals string entries into objects with messages
  const restrictedGlobals = config.rules?.['no-restricted-globals'];
  if (Array.isArray(restrictedGlobals)) {
    const [globalSeverity, ...entries] = restrictedGlobals;
    config.rules['no-restricted-globals'] = [
      globalSeverity,
      ...entries.map((entry: string | { name: string }) => {
        if (typeof entry === 'string') {
          return {
            name: entry,
            message: `Avoid using implicitly global variables. Use e.g. window.${entry} instead if this was your intent.`,
          };
        }
        return entry;
      }),
    ];
  }

  // Inject Node.js builtin modules into no-restricted-imports
  // (frontend needs these blocked, backend role adjustment strips them)
  const builtins: readonly string[] = Module.builtinModules;
  const restricted = config.rules?.['no-restricted-imports'];
  if (Array.isArray(restricted)) {
    const [severity, opts] = restricted;
    if (opts?.paths) {
      for (const mod of builtins) {
        if (!mod.startsWith('_')) {
          opts.paths.push(mod);
        }
      }
    }
    config.rules['no-restricted-imports'] = [severity, opts];
  }

  // Role-based adjustments
  config.rules = config.rules ?? {};
  if (role && BACKEND_ROLES.has(role)) {
    // Backend: allow console
    config.rules['eslint/no-console'] = 'off';
    // Backend: enable new-cap with capIsNew: false (Express Router)
    config.rules['eslint/new-cap'] = ['error', { capIsNew: false }];
    // Backend: enable backend-specific syntax rules
    config.rules['restricted-syntax/no-winston-default-import'] = 'error';
    config.rules['restricted-syntax/no-dirname-in-src'] = 'error';
    // Backend: remove Node.js builtin restrictions
    const restrictedImports = config.rules['no-restricted-imports'];
    if (Array.isArray(restrictedImports)) {
      const [sev, importOpts] = restrictedImports;
      if (importOpts?.paths) {
        importOpts.paths = importOpts.paths.filter(
          (p: string | { name: string }) => {
            const name = typeof p === 'string' ? p : p.name;
            return !name.startsWith('node:') && !builtins.includes(name);
          },
        );
      }
      config.rules['no-restricted-imports'] = [sev, importOpts];
    }
  }

  return { config, configDir };
}

export function mergeOverrideFile(
  config: Record<string, any>,
  overrideDir: string,
): Record<string, any> {
  const localPath = join(overrideDir, '.oxlintrc.json');
  let content: string;
  try {
    content = readFileSync(localPath, 'utf-8');
  } catch {
    return config;
  }

  const local = JSON.parse(content);

  // Resolve jsPlugins paths: relative paths are resolved against the
  // override directory, bare specifiers use require.resolve for Node
  // module resolution (e.g. '@backstage/cli/config/oxlint-plugins/x.js')
  if (Array.isArray(local.jsPlugins)) {
    local.jsPlugins = local.jsPlugins.map((p: string) => {
      if (p.startsWith('.') || p.startsWith('/')) {
        return resolve(overrideDir, p);
      }
      return require.resolve(p);
    });
  }

  for (const key of Object.keys(local)) {
    if (
      typeof local[key] === 'object' &&
      local[key] !== null &&
      !Array.isArray(local[key]) &&
      typeof config[key] === 'object' &&
      config[key] !== null
    ) {
      config[key] = { ...config[key], ...local[key] };
    } else {
      config[key] = local[key];
    }
  }

  return config;
}

/**
 * Walk from packageDir up to rootDir (inclusive), collecting directories
 * that contain a `.oxlintrc.json` file. Returns paths in outermost-first
 * order so they can be merged with increasing specificity.
 */
export function collectAncestorOverrides(
  packageDir: string,
  rootDir: string,
): string[] {
  const normalizedRoot = resolve(rootDir);
  const normalizedPkg = resolve(packageDir);

  // Guard: if packageDir is not under rootDir (or equal), only check packageDir itself
  if (
    normalizedPkg !== normalizedRoot &&
    !normalizedPkg.startsWith(normalizedRoot + sep)
  ) {
    return existsSync(join(normalizedPkg, '.oxlintrc.json'))
      ? [normalizedPkg]
      : [];
  }

  // Collect directories from packageDir up to rootDir
  const dirs: string[] = [];
  let current: string | undefined = normalizedPkg;

  while (current) {
    dirs.push(current);
    if (current === normalizedRoot) {
      break;
    }
    const parent = resolve(current, '..');
    // Safety: stop if we've hit the filesystem root (resolve('..') === self)
    current = parent === current ? undefined : parent;
  }

  // Reverse so outermost (root) is first
  dirs.reverse();

  // Filter to only directories that have .oxlintrc.json
  return dirs.filter(dir => existsSync(join(dir, '.oxlintrc.json')));
}

export function buildOxlintConfig(
  configDir: string,
  role: string | undefined,
  packageDir: string,
  rootDir?: string,
): string {
  const { config } = loadAndAdjustConfig(role, configDir);

  if (rootDir) {
    // Walk from rootDir down to packageDir, merging each .oxlintrc.json
    const overrideDirs = collectAncestorOverrides(packageDir, rootDir);
    for (const dir of overrideDirs) {
      mergeOverrideFile(config, dir);
    }
  } else {
    // No rootDir — only merge package-level overrides (backwards compat)
    mergeOverrideFile(config, packageDir);
  }

  return JSON.stringify(config);
}

export function loadAndFinalizeConfig(
  role: string | undefined,
  packageDir: string,
  rootDir?: string,
): string {
  return buildOxlintConfig(resolveConfigDir(), role, packageDir, rootDir);
}

export function writeTempConfig(configJson: string): string {
  const tmpDir = join(tmpdir(), 'backstage-oxlint');
  mkdirSync(tmpDir, { recursive: true });
  const tmpPath = join(tmpDir, `oxlint-${randomBytes(6).toString('hex')}.json`);
  writeFileSync(tmpPath, configJson);
  return tmpPath;
}

export function cleanupTempConfig(tmpPath: string): void {
  try {
    unlinkSync(tmpPath);
  } catch {
    /* ignore */
  }
}

export function isTypeAwareAvailable(): boolean {
  try {
    require.resolve('oxlint-tsgolint');
    return true;
  } catch {
    return false;
  }
}
