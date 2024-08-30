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

/**
 * Plugin-level event auditing.
 *
 * See {@link @backstage/code-plugin-api#EventAuditorService}
 * and {@link https://backstage.io/docs/backend-system/core-services/event-auditor | the service docs}
 * for more information.
 *
 * @public
 */
export const eventAuditorServiceFactory = createServiceFactory({
  service: coreServices.eventAuditor,
  deps: {
    rootEventAuditor: coreServices.rootEventAuditor,
    plugin: coreServices.pluginMetadata,
  },
  factory({ rootEventAuditor, plugin }) {
    return rootEventAuditor.child({ plugin: plugin.getId() });
  },
});
