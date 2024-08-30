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
import type { JsonObject, JsonValue } from '@backstage/types';
import type { Request } from 'express';

/**
 * @public
 */
export type AuditEventActorDetails = {
  actorId?: string;
  ip?: string;
  hostname?: string;
  userAgent?: string;
};

/**
 * @public
 */
export type AuditEventRequest = {
  url: string;
  method: string;
};

/**
 * Indicates the event was successful.
 *
 * @public
 */
export type AuditEventSuccessStatus = { status: 'succeeded' };

/**
 * Indicates the event failed and includes details about the encountered errors.
 *
 * @public
 */
export type AuditEventFailureStatus<E = ErrorLike> = {
  status: 'failed';
  errors: E[];
};

/**
 * Indicates the event is unknown.
 *
 * @public
 */
export type AuditEventUnknownStatus = { status: 'unknown' };

/**
 * @public
 */
export type AuditEventStatus =
  | AuditEventSuccessStatus
  | AuditEventFailureStatus
  | AuditEventUnknownStatus;

/**
 * Arguments for creating an audit event.
 *
 * @public
 */
export type AuditEventArgs = {
  message: string;
  eventName: string;
  stage: string;
  request?: Request;
  actorId?: string;
  meta?: JsonValue;
} & AuditEventStatus;

/**
 * Common fields of an audit event.
 *
 * @public
 */
export type AuditEvent = [
  message: string,
  meta: {
    actor: AuditEventActorDetails;
    eventName: string;
    stage: string;
    meta?: JsonValue;
    request?: AuditEventRequest;
  } & AuditEventStatus,
];

/**
 * A service that provides an event auditor facility.
 *
 * See the {@link https://backstage.io/docs/backend-system/core-services/event-auditor | service documentation} for more details.
 *
 * @public
 */
export interface EventAuditorService {
  error(args: AuditEventArgs): Promise<void>;
  warn(args: AuditEventArgs): Promise<void>;
  info(args: AuditEventArgs): Promise<void>;
  debug(args: AuditEventArgs): Promise<void>;

  child(meta: JsonObject): EventAuditorService;

  getActorId(request?: Request): Promise<string | undefined>;
}
