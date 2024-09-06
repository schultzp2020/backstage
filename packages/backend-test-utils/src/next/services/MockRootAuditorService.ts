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

import type {
  AuditorEvent,
  AuditorEventArgs,
  AuditorService,
  AuthService,
  HttpAuthService,
  RootAuditorService,
} from '@backstage/backend-plugin-api';
import type { JsonObject } from '@backstage/types';
import type { Request } from 'express';
import { MockAuthService } from './MockAuthService';
import { mockCredentials } from './mockCredentials';
import { MockHttpAuthService } from './MockHttpAuthService';
import { mockServices } from './mockServices';

const levels = {
  none: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

export class MockRootAuditorService implements RootAuditorService {
  #level: number;
  #meta: JsonObject;
  #services: {
    auth: AuthService;
    httpAuth: HttpAuthService;
  };

  static create(
    options?: mockServices.rootAuditor.Options,
  ): MockRootAuditorService {
    const level = options?.level ?? 'none';
    if (!(level in levels)) {
      throw new Error(`Invalid log level '${level}'`);
    }
    return new MockRootAuditorService(levels[level], {});
  }

  async error(args: AuditorEventArgs): Promise<void> {
    const auditEvent = await this.createAuditorEvent(args);
    this.#log('error', ...auditEvent);
  }

  async warn(args: AuditorEventArgs): Promise<void> {
    const auditEvent = await this.createAuditorEvent(args);
    this.#log('warn', ...auditEvent);
  }

  async info(args: AuditorEventArgs): Promise<void> {
    const auditEvent = await this.createAuditorEvent(args);
    this.#log('info', ...auditEvent);
  }

  async debug(args: AuditorEventArgs): Promise<void> {
    const auditEvent = await this.createAuditorEvent(args);
    this.#log('debug', ...auditEvent);
  }

  child(meta: JsonObject): AuditorService {
    return new MockRootAuditorService(this.#level, {
      ...this.#meta,
      ...meta,
    });
  }

  async getActorId(request?: Request): Promise<string | undefined> {
    const { auth, httpAuth } = this.#services;

    if (!(request && httpAuth && auth)) {
      return undefined;
    }
    try {
      const credentials = await httpAuth.credentials(request);
      const userEntityRef = auth.isPrincipal(credentials, 'user')
        ? credentials.principal.userEntityRef
        : undefined;

      const serviceEntityRef = auth.isPrincipal(credentials, 'service')
        ? credentials.principal.subject
        : undefined;

      return userEntityRef ?? serviceEntityRef;
    } catch {
      return undefined;
    }
  }

  private async createAuditorEvent(
    args: AuditorEventArgs,
  ): Promise<AuditorEvent> {
    const { message, actorId, request, ...rest } = args;

    const auditEvent: AuditorEvent = [
      message,
      {
        actor: {
          actorId: actorId ?? (await this.getActorId(request)),
          ip: request?.ip,
          hostname: request?.hostname,
          userAgent: request?.get('user-agent'),
        },
        request: request
          ? {
              url: request?.originalUrl,
              method: request?.method,
            }
          : undefined,
        ...rest,
      },
    ];

    return auditEvent;
  }

  private constructor(level: number, meta: JsonObject) {
    this.#level = level;
    this.#meta = meta;
    this.#services = {
      auth: new MockAuthService({
        pluginId: 'rootAuditor',
        disableDefaultAuthPolicy: false,
      }),
      httpAuth: new MockHttpAuthService('rootAuditor', mockCredentials.user()),
    };
  }

  #log(
    level: 'error' | 'warn' | 'info' | 'debug',
    message: string,
    meta?: AuditorEvent[1],
  ) {
    const levelValue = levels[level] ?? 0;
    if (levelValue <= this.#level) {
      console[level](message, JSON.stringify(meta));
    }
  }
}
