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

/**
 * Indicates the event was successful.
 *
 * @public
 */
export type AuditorEventSuccessStatus = { status: 'succeeded' };

/**
 * Indicates the event failed and includes details about the encountered errors.
 *
 * @public
 */
export type AuditorEventFailureStatus<E = ErrorLike> = {
  status: 'failed';
  errors: E[];
};

/**
 * Indicates the event is unknown.
 *
 * @public
 */
export type AuditorEventUnknownStatus = { status: 'unknown' };

/**
 * @public
 */
export type AuditorEventStatus =
  | AuditorEventSuccessStatus
  | AuditorEventFailureStatus
  | AuditorEventUnknownStatus;

/**
 * Options for creating an auditor event.
 *
 * @public
 */
export type AuditorEventOptions<T extends JsonObject> = {
  /**
   * The name of the audit event, formatted in PascalCase (e.g., "UserLogin", "FileDownload").
   *
   * If applicable, it's required to prefix the `eventName` with the name of the component
   * responsible for the event (e.g., "ScaffolderTaskRead", "CatalogEntityFetch").
   * This improves searchability within the central log collector.
   */
  eventName: string;

  /** A descriptive message about the event. */
  message: string;

  /** The current stage or phase of the process where the event occurred. */
  stage: string;

  /** (Optional) The associated HTTP request, if applicable. */
  request?: Request<any, any, any, any, any>;

  /** (Optional) An identifier for the entity or user who triggered the event. */
  actorId?: string;

  /** (Optional) Additional metadata relevant to the event, structured as a JSON object. */
  meta?: T;
} & AuditorEventStatus;

/**
 * A service that provides an auditor facility.
 *
 * See the {@link https://backstage.io/docs/backend-system/core-services/auditor | service documentation} for more details.
 *
 * @public
 */
export interface AuditorService {
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
