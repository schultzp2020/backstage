/*
 * Copyright 2024 The Backstage Authors
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
  AuthService,
  HttpAuthService,
  RootAuditorService,
} from '@backstage/backend-plugin-api';
import type { JsonObject } from '@backstage/types';
import type { Request } from 'express';
import type { Format } from 'logform';
import * as winston from 'winston';
import { redacterFormat } from '../../lib/redacterFormat';

export const defaultFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  redacterFormat().format,
);

/**
 * @public
 */
export interface AuditorOptions {
  services: {
    auth: AuthService;
    httpAuth: HttpAuthService;
  };
  meta?: JsonObject;
  level?: string;
  format?: Format;
  transports?: winston.transport[];
}

/**
 * A {@link @backstage/backend-plugin-api#RootAuditorService} implementation based on winston.
 *
 * @public
 */
export class Auditor implements RootAuditorService {
  #winstonLogger: winston.Logger;
  #services: {
    auth: AuthService;
    httpAuth: HttpAuthService;
  };
  #addRedactions?: (redactions: Iterable<string>) => void;

  /**
   * Creates a {@link Auditor} instance.
   */
  static create(options: AuditorOptions): Auditor {
    const redacter = Auditor.redacter();

    let auditor = winston.createLogger({
      level: process.env.LOG_LEVEL ?? options.level ?? 'info',
      format: options?.format
        ? winston.format.combine(options.format, redacter.format)
        : defaultFormat,
      transports: options.transports ?? new winston.transports.Console(),
    });

    if (options.meta) {
      auditor = auditor.child(options.meta);
    }

    return new Auditor(auditor, options.services, redacter.add);
  }

  /**
   * Creates a winston log formatter for redacting secrets.
   */
  static redacter(): {
    format: Format;
    add: (redactions: Iterable<string>) => void;
  } {
    return redacterFormat();
  }

  private constructor(
    winstonLogger: winston.Logger,
    services: {
      auth: AuthService;
      httpAuth: HttpAuthService;
    },
    addRedactions?: (redactions: Iterable<string>) => void,
  ) {
    this.#winstonLogger = winstonLogger;
    this.#services = services;
    this.#addRedactions = addRedactions;
  }

  async error(args: AuditorEventArgs): Promise<void> {
    const auditEvent = await this.createAuditorEvent(args);
    console.log(auditEvent);
    this.#winstonLogger.error(...auditEvent);
  }

  async warn(args: AuditorEventArgs): Promise<void> {
    const auditEvent = await this.createAuditorEvent(args);
    this.#winstonLogger.warn(...auditEvent);
  }

  async info(args: AuditorEventArgs): Promise<void> {
    const auditEvent = await this.createAuditorEvent(args);
    this.#winstonLogger.info(...auditEvent);
  }

  async debug(args: AuditorEventArgs): Promise<void> {
    const auditEvent = await this.createAuditorEvent(args);
    this.#winstonLogger.debug(...auditEvent);
  }

  child(meta: JsonObject): Auditor {
    return new Auditor(this.#winstonLogger.child(meta), this.#services);
  }

  addRedactions(redactions: Iterable<string>) {
    this.#addRedactions?.(redactions);
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
}
