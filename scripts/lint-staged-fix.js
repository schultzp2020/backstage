#!/usr/bin/env node

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

'use strict';

const path = require('node:path');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const os = require('node:os');
const crypto = require('node:crypto');
const nodeModule = require('node:module');

const files = process.argv.slice(2);
if (files.length === 0) process.exit(0);

const rootDir = __dirname.replace(/[\\/]scripts$/, '');

/**
 * Walk up from a file to find its package.json and read backstage.role + scripts.lint
 */
function getPackageInfo(filePath) {
  let dir = path.dirname(path.resolve(rootDir, filePath));
  while (
    dir !== path.dirname(dir) &&
    !path.relative(rootDir, dir).startsWith('..')
  ) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      return { dir, pkg };
    }
    dir = path.dirname(dir);
  }
  return null;
}

/**
 * Detect engine from package's scripts.lint field
 */
function detectEngine(pkg) {
  const lintScript = pkg.scripts?.lint ?? '';
  return /(^|\s)--engine(?:=|\s+)oxlint(\s|$)/.test(lintScript)
    ? 'oxlint'
    : 'eslint';
}

/**
 * Walk from packageDir up to rootDir (inclusive), collecting directories
 * that contain a `.oxlintrc.json` file. Returns paths in outermost-first
 * order so they can be merged with increasing specificity.
 */
function collectAncestorOverrides(packageDir, root) {
  const normalizedRoot = path.resolve(root);
  const normalizedPkg = path.resolve(packageDir);

  if (
    normalizedPkg !== normalizedRoot &&
    !normalizedPkg.startsWith(normalizedRoot + path.sep)
  ) {
    return fs.existsSync(path.join(normalizedPkg, '.oxlintrc.json'))
      ? [normalizedPkg]
      : [];
  }

  const dirs = [];
  let current = normalizedPkg;

  while (current) {
    dirs.push(current);
    if (current === normalizedRoot) break;
    const parent = path.resolve(current, '..');
    current = parent === current ? undefined : parent;
  }

  dirs.reverse();
  return dirs.filter(dir => fs.existsSync(path.join(dir, '.oxlintrc.json')));
}

/**
 * Merge a `.oxlintrc.json` override into config using replacement semantics
 * for arrays and scalars, shallow-merge for objects.
 */
function mergeOverrideFile(config, overrideDir) {
  const localPath = path.join(overrideDir, '.oxlintrc.json');
  let content;
  try {
    content = fs.readFileSync(localPath, 'utf-8');
  } catch (error) {
    if (error && error.code === 'ENOENT') return;
    throw error;
  }

  const local = JSON.parse(content);

  // Resolve jsPlugins paths
  if (Array.isArray(local.jsPlugins)) {
    local.jsPlugins = local.jsPlugins.map(p => {
      if (p.startsWith('.') || p.startsWith('/')) {
        return path.resolve(overrideDir, p);
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
}

// Group files by engine
const eslintFiles = [];
const oxlintGroups = new Map(); // pkgDir -> { files, role }

for (const file of files) {
  const info = getPackageInfo(file);
  if (!info) {
    eslintFiles.push(file);
    continue;
  }

  const engine = detectEngine(info.pkg);
  if (engine === 'eslint') {
    eslintFiles.push(file);
  } else {
    const group = oxlintGroups.get(info.dir) ?? {
      files: [],
      role: info.pkg.backstage?.role,
    };
    group.files.push(file);
    oxlintGroups.set(info.dir, group);
  }
}

// Run ESLint for eslint-engine files
if (eslintFiles.length > 0) {
  const eslintBin = path.resolve(
    path.dirname(require.resolve('eslint')),
    '../bin/eslint.js',
  );
  const result = spawnSync(
    process.execPath,
    [eslintBin, '--fix', ...eslintFiles],
    { cwd: rootDir, stdio: 'inherit' },
  );
  if (result.status !== 0) process.exitCode = result.status ?? 1;
}

// Run oxlint for oxlint-engine files (grouped by package for role config)
if (oxlintGroups.size > 0) {
  let oxlintBin;
  try {
    const oxlintMain = require.resolve('oxlint');
    oxlintBin = path.resolve(path.dirname(oxlintMain), '../bin/oxlint');
  } catch {
    console.error(
      'oxlint is not installed, but some packages are configured to use the oxlint engine.\n' +
        "Install oxlint (e.g. 'yarn add --dev oxlint oxlint-tsgolint') or update your lint scripts to not use --engine oxlint.",
    );
    process.exit(1);
  }

  if (oxlintBin) {
    // Check if type-aware linting is available
    let isTypeAwareAvailable = false;
    try {
      require.resolve('oxlint-tsgolint');
      isTypeAwareAvailable = true;
    } catch {
      // not available
    }

    // Resolve config dir using require.resolve (respects workspace resolution)
    let configDir;
    try {
      const configPath = require.resolve('@backstage/cli/config/oxlint.json');
      configDir = path.dirname(configPath);
    } catch {
      console.warn('Could not resolve @backstage/cli/config/oxlint.json');
      process.exit(1);
    }

    const backendRoles = new Set([
      'backend',
      'backend-plugin',
      'backend-plugin-module',
      'cli',
      'node-library',
    ]);
    const builtins = nodeModule.builtinModules;

    for (const [pkgDir, group] of oxlintGroups) {
      const configPath = path.join(configDir, 'oxlint.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

      // Resolve JS plugin paths
      if (config.jsPlugins) {
        config.jsPlugins = config.jsPlugins.map(p =>
          path.resolve(configDir, p),
        );
      }

      // Inject Node.js builtin restrictions
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

      // Apply role adjustments
      config.rules = config.rules ?? {};
      if (group.role && backendRoles.has(group.role)) {
        config.rules['eslint/no-console'] = 'off';
        config.rules['eslint/new-cap'] = ['error', { capIsNew: false }];
        config.rules['restricted-syntax/no-winston-default-import'] = 'error';
        config.rules['restricted-syntax/no-dirname-in-src'] = 'error';

        // Remove Node.js builtin restrictions for backend
        const restrictedImports = config.rules['no-restricted-imports'];
        if (Array.isArray(restrictedImports)) {
          const [sev, importOpts] = restrictedImports;
          if (importOpts?.paths) {
            importOpts.paths = importOpts.paths.filter(p => {
              const name = typeof p === 'string' ? p : p.name;
              return !name.startsWith('node:') && !builtins.includes(name);
            });
          }
          config.rules['no-restricted-imports'] = [sev, importOpts];
        }
      }

      // Merge ancestor .oxlintrc.json overrides (outermost-first, matching
      // the semantics of collectAncestorOverrides + mergeOverrideFile in
      // packages/cli-module-lint/src/lib/oxlintConfig.ts)
      const overrideDirs = collectAncestorOverrides(pkgDir, rootDir);
      for (const overrideDir of overrideDirs) {
        mergeOverrideFile(config, overrideDir);
      }

      // Write temp config
      const tmpDir = path.join(os.tmpdir(), 'backstage-oxlint');
      fs.mkdirSync(tmpDir, { recursive: true });
      const tmpPath = path.join(
        tmpDir,
        `lint-staged-${crypto.randomBytes(6).toString('hex')}.json`,
      );

      try {
        fs.writeFileSync(tmpPath, JSON.stringify(config));
        const result = spawnSync(
          process.execPath,
          [
            oxlintBin,
            '--config',
            tmpPath,
            ...(isTypeAwareAvailable ? ['--type-aware', '--type-check'] : []),
            '--fix',
            ...group.files,
          ],
          {
            cwd: rootDir,
            stdio: 'inherit',
            env: { ...process.env, FORCE_COLOR: '1' },
          },
        );
        if (result.status !== 0) process.exitCode = result.status ?? 1;
      } finally {
        try {
          fs.unlinkSync(tmpPath);
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }
}
