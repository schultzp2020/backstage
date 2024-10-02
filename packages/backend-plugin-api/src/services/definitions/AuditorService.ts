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

import type { ErrorLike } from '@backstage/errors';
import type { JsonObject } from '@backstage/types';
import type { Request } from 'express';

/** @public */
export type AuditorEventStatus<E = ErrorLike> =
  | { status: 'unknown' }
  | { status: 'initiated' }
  | { status: 'succeeded' }
  | ({
      status: 'failed';
    } & ({ error: E } | { errors: E[] }));

/**
 * Options for creating an auditor event.
 *
 * @public
 */
export type AuditorEventOptions<T extends JsonObject> = {
  /**
   * Use kebab-case to name audit events (e.g., "user-login", "file-download").
   *
   * The `pluginId` already provides plugin/module context, so avoid redundant prefixes in the `eventId`.
   */
  eventId: string;

  /** (Optional) The associated HTTP request, if applicable. */
  request?: Request<any, any, any, any, any>;

  /** (Optional) An identifier for the entity or user who triggered the event. */
  actorId?: string;

  /** (Optional) Additional metadata relevant to the event, structured as a JSON object. */
  meta?: T;
} & AuditorEventStatus;

/** @public */
export type AuditorEventLevels = keyof Omit<
  AuditorService,
  'createAuditorEvent'
>;

/** @public */
export type AuditorCreateEvent<
  T extends JsonObject,
  E = ErrorLike,
> = (options: {
  /**
   * Use kebab-case to name audit events (e.g., "user-login", "file-download").
   *
   * The `pluginId` already provides plugin/module context, so avoid redundant prefixes in the `eventId`.
   */
  eventId: string;

  level?: Exclude<AuditorEventLevels, 'error'>;

  /** (Optional) The associated HTTP request, if applicable. */
  request?: Request<any, any, any, any, any>;

  /** (Optional) An identifier for the entity or user who triggered the event. */
  actorId?: string;

  /** (Optional) Additional metadata relevant to the event, structured as a JSON object. */
  meta?: T;
}) => Promise<{
  success<K extends T>(options?: {
    level?: Exclude<AuditorEventLevels, 'error'>;
    meta?: K;
  }): Promise<void>;
  fail<K extends T>(
    options: {
      meta?: K;
    } & ({ error: E } | { errors: E[] }),
  ): Promise<void>;
}>;

/**
 * A service that provides an auditor facility.
 *
 * See the {@link https://backstage.io/docs/backend-system/core-services/auditor | service documentation} for more details.
 *
 * @public
 */
export interface AuditorService {
  createEvent<T extends JsonObject>(
    options: Parameters<AuditorCreateEvent<T>>[0],
  ): ReturnType<AuditorCreateEvent<T>>;
  /**
   * Records critical failures that affect system integrity, like failed transactions or security breaches, essential for incident response.
   */
  error<T extends JsonObject>(options: AuditorEventOptions<T>): Promise<void>;
  /**
   * Highlights non-critical issues, such as blocked access attempts or slow performance, which may indicate potential risks.
   */
  warn<T extends JsonObject>(options: AuditorEventOptions<T>): Promise<void>;
  /**
   * Logs high-level, significant events such as successful logins or configuration changes, which are key for compliance and routine audits.
   */
  info<T extends JsonObject>(options: AuditorEventOptions<T>): Promise<void>;
}
