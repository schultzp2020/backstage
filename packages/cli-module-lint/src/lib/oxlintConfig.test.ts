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
import { mkdirSync, writeFileSync, rmSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import {
  mergeOverrideFile,
  collectAncestorOverrides,
  buildOxlintConfig,
} from './oxlintConfig';

function createTempDir(): string {
  const dir = join(tmpdir(), `oxlint-test-${randomBytes(6).toString('hex')}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function writeJson(dir: string, filename: string, data: object): void {
  writeFileSync(join(dir, filename), JSON.stringify(data));
}

describe('mergeOverrideFile', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('returns config unchanged when no override file exists', () => {
    const config = { rules: { 'no-console': 'error' } };
    const result = mergeOverrideFile(config, tempDir);
    expect(result).toEqual({ rules: { 'no-console': 'error' } });
  });

  it('shallow-merges rules from override', () => {
    const config = {
      rules: { 'no-console': 'error', 'no-debugger': 'warn' },
    };
    writeJson(tempDir, '.oxlintrc.json', {
      rules: { 'notice/notice': 'error' },
    });
    const result = mergeOverrideFile(config, tempDir);
    expect(result.rules).toEqual({
      'no-console': 'error',
      'no-debugger': 'warn',
      'notice/notice': 'error',
    });
  });

  it('replaces jsPlugins arrays instead of concatenating', () => {
    const config = { jsPlugins: ['/absolute/path/backstage-plugin.js'] };
    writeJson(tempDir, '.oxlintrc.json', {
      jsPlugins: ['./my-plugin.js'],
    });
    const result = mergeOverrideFile(config, tempDir);
    expect(result.jsPlugins).toEqual([resolve(tempDir, './my-plugin.js')]);
  });

  it('resolves jsPlugins paths relative to the override directory', () => {
    const config = { jsPlugins: [] };
    writeJson(tempDir, '.oxlintrc.json', {
      jsPlugins: ['./plugins/notice.js', '../shared/plugin.js'],
    });
    const result = mergeOverrideFile(config, tempDir);
    expect(result.jsPlugins).toEqual([
      resolve(tempDir, './plugins/notice.js'),
      resolve(tempDir, '../shared/plugin.js'),
    ]);
  });

  it('resolves bare-specifier jsPlugins via require.resolve', () => {
    const config = { jsPlugins: [] };
    writeJson(tempDir, '.oxlintrc.json', {
      jsPlugins: ['@backstage/cli/config/oxlint-plugins/notice-plugin.js'],
    });
    const result = mergeOverrideFile(config, tempDir);
    // Should resolve to the actual file path via require.resolve
    expect(result.jsPlugins).toHaveLength(1);
    expect(result.jsPlugins[0]).toContain('notice-plugin.js');
    // Should be an absolute path, not the bare specifier
    expect(result.jsPlugins[0]).not.toContain('@backstage');
  });

  it('replaces ignorePatterns arrays', () => {
    const config = { ignorePatterns: ['dist/**'] };
    writeJson(tempDir, '.oxlintrc.json', {
      ignorePatterns: ['generated/**'],
    });
    const result = mergeOverrideFile(config, tempDir);
    expect(result.ignorePatterns).toEqual(['generated/**']);
  });

  it('replaces overrides arrays', () => {
    const config = { overrides: [{ files: ['*.test.*'], rules: {} }] };
    writeJson(tempDir, '.oxlintrc.json', {
      overrides: [{ files: ['*.spec.*'], rules: {} }],
    });
    const result = mergeOverrideFile(config, tempDir);
    expect(result.overrides).toHaveLength(1);
    expect(result.overrides[0].files).toEqual(['*.spec.*']);
  });

  it('shallow-merges nested objects', () => {
    const config = { options: { typeAware: false, other: true } };
    writeJson(tempDir, '.oxlintrc.json', {
      options: { typeAware: true },
    });
    const result = mergeOverrideFile(config, tempDir);
    expect(result.options).toEqual({ typeAware: true, other: true });
  });

  it('replaces scalar values', () => {
    const config = { formatter: 'default' };
    writeJson(tempDir, '.oxlintrc.json', {
      formatter: 'json',
    });
    const result = mergeOverrideFile(config, tempDir);
    expect(result.formatter).toBe('json');
  });

  it('replaces plugins arrays', () => {
    const config = { plugins: ['typescript', 'import'] };
    writeJson(tempDir, '.oxlintrc.json', {
      plugins: ['react'],
    });
    const result = mergeOverrideFile(config, tempDir);
    expect(result.plugins).toEqual(['react']);
  });

  it('replaces extends arrays', () => {
    const config = { extends: ['./base.json'] };
    writeJson(tempDir, '.oxlintrc.json', {
      extends: ['./extra.json'],
    });
    const result = mergeOverrideFile(config, tempDir);
    expect(result.extends).toEqual(['./extra.json']);
  });
});

describe('collectAncestorOverrides', () => {
  let rootDir: string;

  beforeEach(() => {
    rootDir = createTempDir();
  });

  afterEach(() => {
    rmSync(rootDir, { recursive: true, force: true });
  });

  it('returns empty array when no .oxlintrc.json files exist', () => {
    const packageDir = join(rootDir, 'packages', 'my-pkg');
    mkdirSync(packageDir, { recursive: true });
    const result = collectAncestorOverrides(packageDir, rootDir);
    expect(result).toEqual([]);
  });

  it('collects configs from root to package in outermost-first order', () => {
    const pluginsDir = join(rootDir, 'plugins');
    const packageDir = join(pluginsDir, 'my-plugin');
    mkdirSync(packageDir, { recursive: true });

    writeJson(rootDir, '.oxlintrc.json', { rules: { root: 'error' } });
    writeJson(pluginsDir, '.oxlintrc.json', { rules: { plugins: 'error' } });
    writeJson(packageDir, '.oxlintrc.json', { rules: { pkg: 'error' } });

    const result = collectAncestorOverrides(packageDir, rootDir);
    // Should be outermost-first: root, plugins, package
    expect(result).toEqual([
      resolve(rootDir),
      resolve(pluginsDir),
      resolve(packageDir),
    ]);
  });

  it('skips directories without .oxlintrc.json', () => {
    const pluginsDir = join(rootDir, 'plugins');
    const packageDir = join(pluginsDir, 'my-plugin');
    mkdirSync(packageDir, { recursive: true });

    // Only root and package have configs, plugins/ does not
    writeJson(rootDir, '.oxlintrc.json', { rules: { root: 'error' } });
    writeJson(packageDir, '.oxlintrc.json', { rules: { pkg: 'error' } });

    const result = collectAncestorOverrides(packageDir, rootDir);
    expect(result).toEqual([resolve(rootDir), resolve(packageDir)]);
  });

  it('does not walk above rootDir', () => {
    const packageDir = join(rootDir, 'packages', 'my-pkg');
    mkdirSync(packageDir, { recursive: true });
    writeJson(rootDir, '.oxlintrc.json', { rules: { root: 'error' } });

    const result = collectAncestorOverrides(packageDir, rootDir);
    expect(result).toEqual([resolve(rootDir)]);
  });

  it('returns single entry when packageDir equals rootDir', () => {
    writeJson(rootDir, '.oxlintrc.json', { rules: { root: 'error' } });
    const result = collectAncestorOverrides(rootDir, rootDir);
    expect(result).toEqual([resolve(rootDir)]);
  });

  it('falls back to packageDir only when packageDir is not under rootDir', () => {
    const otherDir = createTempDir();
    try {
      writeJson(otherDir, '.oxlintrc.json', { rules: { other: 'error' } });
      const result = collectAncestorOverrides(otherDir, rootDir);
      // Should only return otherDir, not walk up into unrelated directories
      expect(result).toEqual([resolve(otherDir)]);
    } finally {
      rmSync(otherDir, { recursive: true, force: true });
    }
  });

  it('does not false-positive when packageDir shares a prefix with rootDir', () => {
    // e.g. rootDir=/tmp/foo, packageDir=/tmp/foo-sibling — not a child
    // Create a parent dir that has a config — if the guard is broken,
    // the walk would go up and incorrectly include this parent config
    const parentDir = resolve(rootDir, '..');
    const siblingDir = `${rootDir}-sibling`;
    const nestedDir = join(siblingDir, 'nested');
    mkdirSync(nestedDir, { recursive: true });
    writeJson(parentDir, '.oxlintrc.json', { rules: { parent: 'error' } });
    try {
      writeJson(nestedDir, '.oxlintrc.json', { rules: { nested: 'error' } });
      const result = collectAncestorOverrides(nestedDir, rootDir);
      // Should treat as not-under-rootDir, only check nestedDir itself
      // Must NOT include parentDir from walking up past rootDir
      expect(result).toEqual([resolve(nestedDir)]);
    } finally {
      rmSync(siblingDir, { recursive: true, force: true });
      try {
        unlinkSync(join(parentDir, '.oxlintrc.json'));
      } catch {
        /* ignore */
      }
    }
  });

  it('returns empty when packageDir is not under rootDir and has no config', () => {
    const otherDir = createTempDir();
    try {
      const result = collectAncestorOverrides(otherDir, rootDir);
      expect(result).toEqual([]);
    } finally {
      rmSync(otherDir, { recursive: true, force: true });
    }
  });
});

describe('buildOxlintConfig', () => {
  let rootDir: string;
  let packageDir: string;
  let configDir: string;

  beforeEach(() => {
    rootDir = createTempDir();
    packageDir = join(rootDir, 'packages', 'my-pkg');
    configDir = join(rootDir, 'config');
    mkdirSync(packageDir, { recursive: true });
    mkdirSync(configDir, { recursive: true });

    // Write a minimal base config
    writeJson(configDir, 'oxlint.json', {
      plugins: ['typescript'],
      jsPlugins: [],
      rules: { 'no-console': 'error' },
    });
  });

  afterEach(() => {
    rmSync(rootDir, { recursive: true, force: true });
  });

  it('merges ancestor configs in outermost-first order', () => {
    writeJson(rootDir, '.oxlintrc.json', {
      rules: { 'notice/notice': 'error' },
    });
    writeJson(packageDir, '.oxlintrc.json', {
      rules: { 'no-debugger': 'off' },
    });

    const result = JSON.parse(
      buildOxlintConfig(configDir, undefined, packageDir, rootDir),
    );
    expect(result.rules).toEqual(
      expect.objectContaining({
        'no-console': 'error',
        'notice/notice': 'error',
        'no-debugger': 'off',
      }),
    );
  });

  it('package-level overrides win over root-level', () => {
    writeJson(rootDir, '.oxlintrc.json', {
      rules: { 'notice/notice': 'error' },
    });
    writeJson(packageDir, '.oxlintrc.json', {
      rules: { 'notice/notice': 'off' },
    });

    const result = JSON.parse(
      buildOxlintConfig(configDir, undefined, packageDir, rootDir),
    );
    expect(result.rules['notice/notice']).toBe('off');
  });

  it('merges intermediate directory configs', () => {
    const pluginsDir = join(rootDir, 'plugins');
    const pluginDir = join(pluginsDir, 'my-plugin');
    mkdirSync(pluginDir, { recursive: true });

    writeJson(rootDir, '.oxlintrc.json', {
      rules: { 'notice/notice': 'error' },
    });
    writeJson(pluginsDir, '.oxlintrc.json', {
      rules: { 'plugin-shared-rule': 'warn' },
    });
    writeJson(pluginDir, '.oxlintrc.json', {
      rules: { 'pkg-rule': 'off' },
    });

    const result = JSON.parse(
      buildOxlintConfig(configDir, undefined, pluginDir, rootDir),
    );
    expect(result.rules).toEqual(
      expect.objectContaining({
        'no-console': 'error',
        'notice/notice': 'error',
        'plugin-shared-rule': 'warn',
        'pkg-rule': 'off',
      }),
    );
  });

  it('works when rootDir has no .oxlintrc.json', () => {
    const result = JSON.parse(
      buildOxlintConfig(configDir, undefined, packageDir, rootDir),
    );
    expect(result.rules).toEqual(
      expect.objectContaining({ 'no-console': 'error' }),
    );
  });

  it('works when rootDir is not provided', () => {
    const result = JSON.parse(
      buildOxlintConfig(configDir, undefined, packageDir),
    );
    expect(result.rules).toEqual(
      expect.objectContaining({ 'no-console': 'error' }),
    );
  });

  it('does not double-merge when rootDir equals packageDir', () => {
    writeJson(rootDir, '.oxlintrc.json', {
      jsPlugins: ['./notice.js'],
      ignorePatterns: ['extra/**'],
    });
    // When rootDir === packageDir, the override should only be applied once
    const result = JSON.parse(
      buildOxlintConfig(configDir, undefined, rootDir, rootDir),
    );
    // jsPlugins should contain the resolved path only once
    expect(result.jsPlugins).toEqual([resolve(rootDir, './notice.js')]);
    // ignorePatterns should appear only once
    expect(result.ignorePatterns).toEqual(['extra/**']);
  });

  it('inner jsPlugins replace outer jsPlugins', () => {
    writeJson(rootDir, '.oxlintrc.json', {
      jsPlugins: ['./root-plugin.js'],
    });
    writeJson(packageDir, '.oxlintrc.json', {
      jsPlugins: ['./pkg-plugin.js'],
    });

    const result = JSON.parse(
      buildOxlintConfig(configDir, undefined, packageDir, rootDir),
    );
    // Package-level replaces root-level, not concatenates
    expect(result.jsPlugins).toEqual([resolve(packageDir, './pkg-plugin.js')]);
  });
});
