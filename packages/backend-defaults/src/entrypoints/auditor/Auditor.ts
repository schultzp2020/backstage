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
  AuditorCreateEvent,
  AuditorEventOptions,
  AuditorEventStatus,
  AuditorService,
  AuthService,
  BackstageCredentials,
  HttpAuthService,
} from '@backstage/backend-plugin-api';
import { AuthenticationError, ForwardedError } from '@backstage/errors';
import type { JsonObject } from '@backstage/types';
import type { Request } from 'express';
import type { Format } from 'logform';
import * as winston from 'winston';
import { colorFormat } from '../../lib/colorFormat';
import { defaultConsoleTransport } from '../../lib/defaultConsoleTransport';
import { redacterFormat } from '../../lib/redacterFormat';

/** @public */
export type AuditorEventActorDetails = {
  actorId?: string;
  ip?: string;
  hostname?: string;
  userAgent?: string;
};

/** @public */
export type AuditorEventRequest = {
  url: string;
  method: string;
};

/**
 * Common fields of an audit event.
 *
 * @public
 */
export type AuditorEvent = [
  eventId: string,
  meta: {
    actor: AuditorEventActorDetails;
    meta?: JsonObject;
    request?: AuditorEventRequest;
  } & AuditorEventStatus,
];

/** @public */
export const defaultProdFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  redacterFormat().format,
);

/**
 * Adds `isAuditorEvent` field
 *
 * @public
 */
export const auditorFieldFormat = winston.format(info => {
  return { ...info, isAuditorEvent: true };
})();

/** @public */
export interface AuditorOptions {
  auth?: AuthService;
  httpAuth?: HttpAuthService;
  meta?: JsonObject;
  level?: string;
  format?: Format;
  transports?: winston.transport[];
}

/**
 * A {@link @backstage/backend-plugin-api#AuditorService} implementation based on winston.
 *
 * @public
 */
export class Auditor implements AuditorService {
  readonly #winstonLogger: winston.Logger;
  readonly #auth?: AuthService;
  readonly #httpAuth?: HttpAuthService;
  readonly #addRedactions?: (redactions: Iterable<string>) => void;

  /**
   * Creates a {@link Auditor} instance.
   */
  static create(options: AuditorOptions): Auditor {
    const redacter = Auditor.redacter();
    const defaultFormatter =
      process.env.NODE_ENV === 'production'
        ? defaultProdFormat
        : Auditor.colorFormat();

    let auditor = winston.createLogger({
      level: process.env.LOG_LEVEL ?? options.level ?? 'info',
      format: winston.format.combine(
        auditorFieldFormat,
        options.format ?? defaultFormatter,
        redacter.format,
      ),
      transports: options.transports ?? defaultConsoleTransport,
    });

    if (options.meta) {
      auditor = auditor.child(options.meta);
    }

    return new Auditor(auditor, options.auth, options.httpAuth, redacter.add);
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

  /**
   * Creates a pretty printed winston log formatter.
   */
  static colorFormat(): Format {
    return colorFormat();
  }

  private constructor(
    winstonLogger: winston.Logger,
    auth?: AuthService,
    httpAuth?: HttpAuthService,
    addRedactions?: (redactions: Iterable<string>) => void,
  ) {
    this.#winstonLogger = winstonLogger;
    this.#auth = auth;
    this.#httpAuth = httpAuth;
    this.#addRedactions = addRedactions;
  }

  async error<T extends JsonObject>(
    options: AuditorEventOptions<T>,
  ): Promise<void> {
    const auditEvent = await this.reshapeAuditorEvent(options);
    this.#winstonLogger.error(...auditEvent);
  }

  async warn<T extends JsonObject>(
    options: AuditorEventOptions<T>,
  ): Promise<void> {
    const auditEvent = await this.reshapeAuditorEvent(options);
    this.#winstonLogger.warn(...auditEvent);
  }

  async info<T extends JsonObject>(
    options: AuditorEventOptions<T>,
  ): Promise<void> {
    const auditEvent = await this.reshapeAuditorEvent(options);
    this.#winstonLogger.info(...auditEvent);
  }

  async createEvent<T extends JsonObject>(
    options: Parameters<AuditorCreateEvent<T>>[0],
  ): ReturnType<AuditorCreateEvent<T>> {
    const { level = 'info', ...rest } = options;

    await this[level]({ ...rest, status: 'initiated' });

    return {
      success: async params => {
        await this[params?.level ?? level]({
          ...rest,
          meta: { ...options.meta, ...params?.meta },
          status: 'succeeded',
        });
      },
      fail: async params => {
        await this.error({
          ...rest,
          ...params,
          meta: { ...options.meta, ...params.meta },
          status: 'failed',
        });
      },
    };
  }

  child(
    meta: JsonObject,
    auth?: AuthService,
    httpAuth?: HttpAuthService,
  ): AuditorService {
    return new Auditor(
      this.#winstonLogger.child(meta),
      auth ?? this.#auth,
      httpAuth ?? this.#httpAuth,
    );
  }

  addRedactions(redactions: Iterable<string>) {
    this.#addRedactions?.(redactions);
  }

  private async getActorId(
    request: Request<any, any, any, any, any>,
  ): Promise<string | undefined> {
    if (!this.#auth) {
      throw new AuthenticationError(
        `The core service 'auth' was not provided during the auditor's instantiation`,
      );
    }

    if (!this.#httpAuth) {
      throw new AuthenticationError(
        `The core service 'httpAuth' was not provided during the auditor's instantiation`,
      );
    }

    let credentials: BackstageCredentials;

    try {
      credentials = await this.#httpAuth.credentials(request);
    } catch (error) {
      throw new ForwardedError('Could not resolve credentials', error);
    }

    if (this.#auth.isPrincipal(credentials, 'user')) {
      return credentials.principal.userEntityRef;
    }

    if (this.#auth.isPrincipal(credentials, 'service')) {
      return credentials.principal.subject;
    }

    return undefined;
  }

  private async reshapeAuditorEvent<T extends JsonObject>(
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
}
