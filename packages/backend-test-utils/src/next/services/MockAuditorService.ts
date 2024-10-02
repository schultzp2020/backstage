/*
 * Copyright 2023 The Backstage Authors
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

import type { AuditorEvent } from '@backstage/backend-defaults/auditor';
import type {
  AuditorEventOptions,
  AuditorService,
  AuthService,
  BackstageCredentials,
  HttpAuthService,
} from '@backstage/backend-plugin-api';
import { AuthenticationError, ForwardedError } from '@backstage/errors';
import type { JsonObject } from '@backstage/types';
import type { Request } from 'express';
import type { mockServices } from './mockServices';

const LEVELS = {
  none: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
} as const;

export class MockAuditorService implements AuditorService {
  readonly #options: mockServices.auditor.Options;

  static create(options?: mockServices.auditor.Options): MockAuditorService {
    const level = options?.level ?? 'none';
    if (!(level in LEVELS)) {
      throw new Error(`Invalid log level '${level}'`);
    }

    return new MockAuditorService(options ? { ...options, level } : { level });
  }

  async error<T extends JsonObject>(
    options: AuditorEventOptions<T>,
  ): Promise<void> {
    const auditEvent = await this.createAuditorEvent(options);
    this.log('error', ...auditEvent);
  }

  async warn<T extends JsonObject>(
    options: AuditorEventOptions<T>,
  ): Promise<void> {
    const auditEvent = await this.createAuditorEvent(options);
    this.log('warn', ...auditEvent);
  }

  async info<T extends JsonObject>(
    options: AuditorEventOptions<T>,
  ): Promise<void> {
    const auditEvent = await this.createAuditorEvent(options);
    this.log('info', ...auditEvent);
  }

  child(
    meta: JsonObject,
    auth?: AuthService,
    httpAuth?: HttpAuthService,
  ): AuditorService {
    return new MockAuditorService({
      ...this.#options,
      auth: auth ?? this.#options.auth,
      httpAuth: httpAuth ?? this.#options.httpAuth,
      meta: {
        ...this.#options.meta,
        ...meta,
      },
    });
  }

  private async getActorId(
    request: Request<any, any, any, any, any>,
  ): Promise<string | undefined> {
    if (!this.#options.auth) {
      throw new AuthenticationError(
        `The core service 'auth' was not provided during the auditor's instantiation`,
      );
    }

    if (!this.#options.httpAuth) {
      throw new AuthenticationError(
        `The core service 'httpAuth' was not provided during the auditor's instantiation`,
      );
    }

    const { auth, httpAuth } = this.#options;
    let credentials: BackstageCredentials;

    try {
      credentials = await httpAuth.credentials(request);
    } catch (error) {
      throw new ForwardedError('Could not resolve credentials', error);
    }

    if (auth.isPrincipal(credentials, 'user')) {
      return credentials.principal.userEntityRef;
    }

    if (auth.isPrincipal(credentials, 'service')) {
      return credentials.principal.subject;
    }

    return undefined;
  }

  private async createAuditorEvent<T extends JsonObject>(
    options: AuditorEventOptions<T>,
  ): Promise<AuditorEvent> {
    const { eventId, actorId, request, ...rest } = options;

    const eventRequest = request
      ? {
          url: request?.originalUrl,
          method: request?.method,
        }
      : undefined;

    const eventActorId =
      actorId ?? (request ? await this.getActorId(request) : undefined);

    const auditEvent: AuditorEvent = [
      eventId,
      {
        actor: {
          actorId: eventActorId,
          ip: request?.ip,
          hostname: request?.hostname,
          userAgent: request?.get('user-agent'),
        },
        request: eventRequest,
        ...rest,
      },
    ];

    return auditEvent;
  }

  private constructor(options: mockServices.auditor.Options) {
    this.#options = options;
  }

  private log(
    level: Exclude<keyof typeof LEVELS, 'none'>,
    message: string,
    meta?: AuditorEvent[1],
  ) {
    const levelValue = LEVELS[level] ?? 0;
    const outputLevelValue = LEVELS[this.#options.level as keyof typeof LEVELS];
    if (levelValue <= outputLevelValue) {
      console[level](message, JSON.stringify(meta));
    }
  }
}
