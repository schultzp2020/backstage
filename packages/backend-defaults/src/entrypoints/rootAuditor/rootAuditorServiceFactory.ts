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

import {
  coreServices,
  createServiceFactory,
} from '@backstage/backend-plugin-api';
import type { Config } from '@backstage/config';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { Auditor, defaultFormat } from './Auditor';

const transports = {
  auditorConsole: (config?: Config) => {
    if (config?.getOptionalBoolean('console.enabled') === false) {
      return [];
    }
    return [
      new winston.transports.Console({
        format: defaultFormat,
      }),
    ];
  },
  auditorFile: (config?: Config) => {
    if (!config?.getOptionalBoolean('rotateFile.enabled')) {
      return [];
    }
    return [
      new winston.transports.DailyRotateFile({
        format: defaultFormat,
        dirname:
          config?.getOptionalString('rotateFile.logFileDirPath') ??
          '/var/log/backstage/audit',
        filename:
          config?.getOptionalString('rotateFile.logFileName') ??
          'backstage-audit-%DATE%.log',
        datePattern: config?.getOptionalString('rotateFile.dateFormat'),
        frequency: config?.getOptionalString('rotateFile.frequency'),
        zippedArchive: config?.getOptionalBoolean('rotateFile.zippedArchive'),
        utc: config?.getOptionalBoolean('rotateFile.utc'),
        maxSize: config?.getOptionalString('rotateFile.maxSize'),
        maxFiles: config?.getOptional('rotateFile.maxFilesOrDays'),
      }),
    ];
  },
};

/**
 * Root-level auditing.
 *
 * See {@link @backstage/code-plugin-api#RootAuditorService}
 * and {@link https://backstage.io/docs/backend-system/core-services/root-auditor | the service docs}
 * for more information.
 *
 * @public
 */
export const rootAuditorServiceFactory = createServiceFactory({
  service: coreServices.rootAuditor,
  deps: {
    config: coreServices.rootConfig,
    auth: coreServices.auth,
    httpAuth: coreServices.httpAuth,
  },
  async factory({ config, auth, httpAuth }) {
    const auditorConfig = config.getOptionalConfig('backend.rootAuditor');

    const auditor = Auditor.create({
      services: {
        auth,
        httpAuth,
      },
      meta: {
        service: 'backstage',
      },
      level: process.env.LOG_LEVEL ?? 'info',
      format: winston.format.combine(defaultFormat, winston.format.json()),
      transports: [
        ...transports.auditorConsole(auditorConfig),
        ...transports.auditorFile(auditorConfig),
      ],
    });

    return auditor;
  },
});
