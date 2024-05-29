/*
 * Copyright 2022 The Backstage Authors
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

import { Base64Decode } from 'base64-stream';
import concatStream from 'concat-stream';
import fs from 'fs-extra';
import fetch, { Response } from 'node-fetch';
import os from 'os';
import { join as joinPath } from 'path';
import { Readable, pipeline as pipelineCb } from 'stream';
import tar from 'tar';
import { promisify } from 'util';
import {
  GerritIntegration,
  ScmIntegrations,
  buildGerritGitilesArchiveUrl,
  getGerritBranchApiUrl,
  getGerritCloneRepoUrl,
  getGerritFileContentsApiUrl,
  getGerritRequestOptions,
  parseGerritGitilesUrl,
  parseGerritJsonResponse,
} from '@backstage/integration';
import { NotFoundError, NotModifiedError } from '@backstage/errors';
import {
  ReadTreeOptions,
  ReadTreeResponse,
  ReadTreeResponseFactory,
  ReadUrlOptions,
  ReadUrlResponse,
  ReaderFactory,
  SearchResponse,
  UrlReader,
} from './types';
import { Git } from './git';

const pipeline = promisify(pipelineCb);

export const GITILES_BASE_URL_DEPRECATION_MESSSAGE = `A gitilesBaseUrl must be provided \
for the gerrit integration to work. You can disable this check by setting \
DISABLE_GERRIT_GITILES_REQUIREMENT=1 but this will be removed in a future release. If you \
are not able to use the gitiles gerrit plugin, please open an issue towards \
https://github.com/backstage/backstage`;

const createTemporaryDirectory = async (workDir: string): Promise<string> =>
  await fs.mkdtemp(joinPath(workDir, '/gerrit-clone-'));

/**
 * Implements a {@link @backstage/backend-plugin-api#UrlReaderService} for files in Gerrit.
 *
 * @remarks
 * To be able to link to Git contents for Gerrit providers in a user friendly
 * way we are depending on that there is a Gitiles installation somewhere
 * that we can link to. It is perfectly possible to integrate Gerrit with
 * Backstage without Gitiles since all API calls goes directly to Gerrit.
 * However if Gitiles is configured, readTree will use it to fetch
 * an archive instead of cloning the repository.
 *
 * The "host" variable in the config is the Gerrit host. The address where
 * Gitiles is installed may be on the same host but it could be on a
 * separate host. For example a Gerrit instance could be hosted on
 * "gerrit-review.company.com" but the repos could be browsable on a separate
 * host, e.g. "gerrit.company.com" and the human readable URL would then
 * not point to the API host.
 *
 * @public
 */
export class GerritUrlReader implements UrlReader {
  static factory: ReaderFactory = ({ config, treeResponseFactory }) => {
    const integrations = ScmIntegrations.fromConfig(config);
    if (!integrations.gerrit) {
      return [];
    }
    const workDir =
      config.getOptionalString('backend.workingDirectory') ?? os.tmpdir();
    return integrations.gerrit.list().map(integration => {
      if (
        integration.config.gitilesBaseUrl === integration.config.baseUrl &&
        process.env.DISABLE_GERRIT_GITILES_REQUIREMENT === undefined
      ) {
        throw new Error(GITILES_BASE_URL_DEPRECATION_MESSSAGE);
      }
      const reader = new GerritUrlReader(
        integration,
        { treeResponseFactory },
        workDir,
      );
      const predicate = (url: URL) => {
        const gitilesUrl = new URL(integration.config.gitilesBaseUrl!);
        // If gitilesUrl is not specified it will default to
        // "integration.config.host".
        return url.host === gitilesUrl.host;
      };
      return { reader, predicate };
    });
  };

  constructor(
    private readonly integration: GerritIntegration,
    private readonly deps: { treeResponseFactory: ReadTreeResponseFactory },
    private readonly workDir: string,
  ) {}

  async read(url: string): Promise<Buffer> {
    const response = await this.readUrl(url);
    return response.buffer();
  }

  async readUrl(
    url: string,
    options?: ReadUrlOptions,
  ): Promise<ReadUrlResponse> {
    const apiUrl = getGerritFileContentsApiUrl(this.integration.config, url);
    let response: Response;
    try {
      response = await fetch(apiUrl, {
        method: 'GET',
        ...getGerritRequestOptions(this.integration.config),
        // TODO(freben): The signal cast is there because pre-3.x versions of
        // node-fetch have a very slightly deviating AbortSignal type signature.
        // The difference does not affect us in practice however. The cast can
        // be removed after we support ESM for CLI dependencies and migrate to
        // version 3 of node-fetch.
        // https://github.com/backstage/backstage/issues/8242
        signal: options?.signal as any,
      });
    } catch (e) {
      throw new Error(`Unable to read gerrit file ${url}, ${e}`);
    }

    if (response.ok) {
      let responseBody: string;
      return {
        buffer: async () => {
          if (responseBody === undefined) {
            responseBody = await response.text();
          }
          return Buffer.from(responseBody, 'base64');
        },
        stream: () => {
          const readable = Readable.from(response.body);
          return readable.pipe(new Base64Decode());
        },
      };
    }
    if (response.status === 404) {
      throw new NotFoundError(`File ${url} not found.`);
    }
    throw new Error(
      `${url} could not be read as ${apiUrl}, ${response.status} ${response.statusText}`,
    );
  }

  async readTree(
    url: string,
    options?: ReadTreeOptions,
  ): Promise<ReadTreeResponse> {
    const apiUrl = getGerritBranchApiUrl(this.integration.config, url);
    let response: Response;
    try {
      response = await fetch(apiUrl, {
        method: 'GET',
        ...getGerritRequestOptions(this.integration.config),
      });
    } catch (e) {
      throw new Error(`Unable to read branch state ${url}, ${e}`);
    }

    if (response.status === 404) {
      throw new NotFoundError(`Not found: ${url}`);
    }

    if (!response.ok) {
      throw new Error(
        `${url} could not be read as ${apiUrl}, ${response.status} ${response.statusText}`,
      );
    }
    const branchInfo = (await parseGerritJsonResponse(response as any)) as {
      revision: string;
    };
    if (options?.etag === branchInfo.revision) {
      throw new NotModifiedError();
    }

    if (
      this.integration.config.gitilesBaseUrl !== this.integration.config.baseUrl
    ) {
      return this.readTreeFromGitiles(url, branchInfo.revision, options);
    }
    return this.readTreeFromGitClone(url, branchInfo.revision, options);
  }

  async search(): Promise<SearchResponse> {
    throw new Error('GerritReader does not implement search');
  }

  toString() {
    const { host, password } = this.integration.config;
    return `gerrit{host=${host},authed=${Boolean(password)}}`;
  }

  private async readTreeFromGitClone(
    url: string,
    revision: string,
    options?: ReadTreeOptions,
  ) {
    const { filePath } = parseGerritGitilesUrl(this.integration.config, url);

    const git = Git.fromAuth({
      username: this.integration.config.username,
      password: this.integration.config.password,
    });
    const tempDir = await createTemporaryDirectory(this.workDir);
    const cloneUrl = getGerritCloneRepoUrl(this.integration.config, url);
    try {
      // The "fromTarArchive" function will strip the top level directory so
      // an additional directory level is created when we clone.
      await git.clone({
        url: cloneUrl,
        dir: joinPath(tempDir, 'repo'),
        ref: revision,
        depth: 1,
      });

      const data = await new Promise<Buffer>(async resolve => {
        await pipeline(
          tar.create({ cwd: tempDir }, ['']),
          concatStream(resolve),
        );
      });
      const tarArchive = Readable.from(data);
      return await this.deps.treeResponseFactory.fromTarArchive({
        stream: tarArchive,
        subpath: filePath === '/' ? undefined : filePath,
        etag: revision,
        filter: options?.filter,
      });
    } catch (error) {
      throw new Error(`Could not clone ${cloneUrl}: ${error}`);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  private async readTreeFromGitiles(
    url: string,
    revision: string,
    options?: ReadTreeOptions,
  ) {
    const { branch, filePath, project } = parseGerritGitilesUrl(
      this.integration.config,
      url,
    );
    const archiveUrl = buildGerritGitilesArchiveUrl(
      this.integration.config,
      project,
      branch,
      filePath,
    );
    const archiveResponse = await fetch(archiveUrl, {
      ...getGerritRequestOptions(this.integration.config),
      // TODO(freben): The signal cast is there because pre-3.x versions of
      // node-fetch have a very slightly deviating AbortSignal type signature.
      // The difference does not affect us in practice however. The cast can
      // be removed after we support ESM for CLI dependencies and migrate to
      // version 3 of node-fetch.
      // https://github.com/backstage/backstage/issues/8242
      signal: options?.signal as any,
    });

    if (archiveResponse.status === 404) {
      throw new NotFoundError(`Not found: ${archiveUrl}`);
    }

    if (!archiveResponse.ok) {
      throw new Error(
        `${url} could not be read as ${archiveUrl}, ${archiveResponse.status} ${archiveResponse.statusText}`,
      );
    }

    return await this.deps.treeResponseFactory.fromTarArchive({
      stream: archiveResponse.body as unknown as Readable,
      etag: revision,
      filter: options?.filter,
      stripFirstDirectory: false,
    });
  }
}
