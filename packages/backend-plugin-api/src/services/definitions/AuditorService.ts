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
 * Utility type to expand object in intellisense
 *
 * @internal
 */
type Prettify<T> = {
  [K in keyof T]: T[K];
} & unknown;

/**
 * @public
 */
export type AuditorEventActorDetails = {
  actorId?: string;
  ip?: string;
  hostname?: string;
  userAgent?: string;
};

/**
 * @public
 */
export type AuditorEventRequest = {
  url: string;
  method: string;
};

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
 * Arguments for creating an audit event.
 *
 * @public
 */
export type AuditorEventArgs<T extends JsonObject> = {
  message: string;
  eventName: string;
  stage: string;
  request?: Request;
  actorId?: string;
  meta?: T;
} & AuditorEventStatus;

/**
 * Common fields of an audit event.
 *
 * @public
 */
export type AuditorEvent = [
  message: string,
  meta: Prettify<
    {
      actor: AuditorEventActorDetails;
      eventName: string;
      stage: string;
      meta?: JsonObject;
      request?: AuditorEventRequest;
    } & AuditorEventStatus
  >,
];

/**
 * A service that provides an auditor facility.
 *
 * See the {@link https://backstage.io/docs/backend-system/core-services/auditor | service documentation} for more details.
 *
 * @public
 */
export interface AuditorService {
  error<T extends JsonObject>(
    args: Prettify<AuditorEventArgs<T>>,
  ): Promise<void>;
  warn<T extends JsonObject>(
    args: Prettify<AuditorEventArgs<T>>,
  ): Promise<void>;
  info<T extends JsonObject>(
    args: Prettify<AuditorEventArgs<T>>,
  ): Promise<void>;
  debug<T extends JsonObject>(
    args: Prettify<AuditorEventArgs<T>>,
  ): Promise<void>;

  child(meta: JsonObject): AuditorService;

  getActorId(request: Request): Promise<string | undefined>;
}
