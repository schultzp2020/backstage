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

import type { ErrorLike } from '@backstage/errors';
import { MockRootAuditorService } from './MockAuditorService';
import { MockAuthService } from './MockAuthService';
import { MockHttpAuthService } from './MockHttpAuthService';
import { mockCredentials } from './mockCredentials';

describe('MockAuditorService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should log', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const pluginId = 'test-plugin';

    const auditor = MockRootAuditorService.create().forPlugin({
      plugin: {
        getId: () => pluginId,
      },
      auth: new MockAuthService({
        pluginId,
        disableDefaultAuthPolicy: false,
      }),
      httpAuth: new MockHttpAuthService(pluginId, mockCredentials.user()),
    });

    await auditor.createEvent({
      eventId: 'test-event',
    });

    expect(console.log).toHaveBeenCalled();
  });

  it('should send initiated log with createEvent', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const pluginId = 'test-plugin';

    const auditor = MockRootAuditorService.create().forPlugin({
      plugin: {
        getId: () => pluginId,
      },
      auth: new MockAuthService({
        pluginId,
        disableDefaultAuthPolicy: false,
      }),
      httpAuth: new MockHttpAuthService(pluginId, mockCredentials.user()),
    });

    await auditor.createEvent({
      eventId: 'test-event',
    });

    expect(console.log).toHaveBeenCalled();
  });

  it('should send succeeded log with createEvent', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const pluginId = 'test-plugin';

    const auditor = MockRootAuditorService.create().forPlugin({
      plugin: {
        getId: () => pluginId,
      },
      auth: new MockAuthService({
        pluginId,
        disableDefaultAuthPolicy: false,
      }),
      httpAuth: new MockHttpAuthService(pluginId, mockCredentials.user()),
    });

    const auditorEvent = await auditor.createEvent({
      eventId: 'test-event',
    });

    await auditorEvent.success();

    expect(console.log).toHaveBeenCalledTimes(2);
  });

  it('should send failed log with createEvent', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const pluginId = 'test-plugin';

    const auditor = MockRootAuditorService.create().forPlugin({
      plugin: {
        getId: () => pluginId,
      },
      auth: new MockAuthService({
        pluginId,
        disableDefaultAuthPolicy: false,
      }),
      httpAuth: new MockHttpAuthService(pluginId, mockCredentials.user()),
    });

    const auditorEvent = await auditor.createEvent({
      eventId: 'test-event',
    });

    await auditorEvent.fail({ error: new Error('error') as ErrorLike });

    expect(console.log).toHaveBeenCalledTimes(2);
  });
});
