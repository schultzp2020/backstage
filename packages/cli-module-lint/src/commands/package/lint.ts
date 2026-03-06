/*
 * Copyright 2020 The Backstage Authors
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

import { cli } from 'cleye';
import type { CliCommandContext } from '@backstage/cli-node';
import { VALID_ENGINES } from '../../lib/oxlintConfig';

function resolveDefaultExport<T>(mod: any): T {
  if (typeof mod?.default === 'function') return mod.default as T;
  if (typeof mod?.default?.default === 'function')
    return mod.default.default as T;
  return mod as T;
}

export interface PackageLintOptions {
  fix: boolean;
  format: string | undefined;
  outputFile: string | undefined;
  maxWarnings: string | undefined;
  directories: string[];
}

export default async ({ args, info }: CliCommandContext) => {
  const {
    flags: { engine, fix, format, outputFile, maxWarnings },
    _: directories,
  } = cli(
    {
      help: { ...info, usage: `${info.usage} [directories...]` },
      booleanFlagNegation: true,
      parameters: ['[directories...]'],
      flags: {
        engine: {
          type: String,
          description:
            'Lint engine to use: "eslint" or "oxlint" (default: "eslint")',
          default: 'eslint',
        },
        fix: {
          type: Boolean,
          description: 'Attempt to automatically fix violations',
        },
        format: {
          type: String,
          description: 'Lint report output format',
        },
        outputFile: {
          type: String,
          description: 'Write the lint report to a file instead of stdout',
        },
        maxWarnings: {
          type: String,
          description:
            'Fail if more than this number of warnings. -1 allows warnings. (default: -1)',
        },
      },
    },
    undefined,
    args,
  );

  if (!VALID_ENGINES.has(engine)) {
    console.error(
      `Unknown lint engine "${engine}". Valid engines: ${[
        ...VALID_ENGINES,
      ].join(', ')}`,
    );
    process.exit(1);
  }

  const opts: PackageLintOptions = {
    fix: fix ?? false,
    format,
    outputFile,
    maxWarnings,
    directories,
  };

  if (engine === 'oxlint') {
    const mod = await import('./oxlint');
    const runOxlint =
      resolveDefaultExport<(opts: PackageLintOptions) => Promise<boolean>>(mod);
    const passed = await runOxlint(opts);
    if (!passed) {
      process.exit(1);
    }
    return;
  }

  const eslintMod = await import('./eslint');
  const runEslint =
    resolveDefaultExport<(opts: PackageLintOptions) => Promise<void>>(
      eslintMod,
    );
  await runEslint(opts);
};
