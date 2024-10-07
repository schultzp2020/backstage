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

import { mockServices } from '@backstage/backend-test-utils';
import { format } from 'logform';
import { MESSAGE } from 'triple-beam';
import Transport from 'winston-transport';
import { Auditor } from './Auditor';

describe('Auditor', () => {
  it('creates a auditor instance with default options', () => {
    const auditor = Auditor.create();
    expect(auditor).toBeInstanceOf(Auditor);
  });

  it('creates a child logger', () => {
    const auditor = Auditor.create();
    const childLogger = auditor.child({ plugin: 'test-plugin' });
    expect(childLogger).toBeInstanceOf(Auditor);
  });

  it('should error without plugin service', async () => {
    const auditor = Auditor.create();
    await expect(
      auditor.log({
        eventId: 'test-event',
        status: 'unknown',
      }),
    ).rejects.toThrow(
      `The core service 'plugin' was not provided during the auditor's instantiation`,
    );
  });

  it('should error without auth service', async () => {
    const pluginId = 'test-plugin';

    const auditor = Auditor.create({
      plugin: {
        getId: () => pluginId,
      },
    });

    await expect(
      auditor.log({
        eventId: 'test-event',
        status: 'unknown',
      }),
    ).rejects.toThrow(
      `The core service 'auth' was not provided during the auditor's instantiation`,
    );
  });

  it('should error without httpAuth service', async () => {
    const pluginId = 'test-plugin';

    const auditor = Auditor.create({
      plugin: {
        getId: () => pluginId,
      },
      auth: mockServices.auth.mock(),
    });

    await expect(
      auditor.log({
        eventId: 'test-event',
        status: 'unknown',
      }),
    ).rejects.toThrow(
      `The core service 'httpAuth' was not provided during the auditor's instantiation`,
    );
  });

  it('should log', async () => {
    const mockTransport = new Transport({
      log: jest.fn(),
      logv: jest.fn(),
    });

    const pluginId = 'test-plugin';

    const auditor = Auditor.create({
      auth: mockServices.auth.mock(),
      httpAuth: mockServices.httpAuth.mock(),
      plugin: {
        getId: () => pluginId,
      },
      format: format.json(),
      transports: [mockTransport],
    });

    await auditor.log({
      eventId: 'something-went-wrong',
      status: 'unknown',
    });

    expect(mockTransport.log).toHaveBeenCalledWith(
      expect.objectContaining({
        [MESSAGE]: JSON.stringify({
          actor: {},
          isAuditorEvent: true,
          level: 'info',
          message: 'test-plugin.something-went-wrong',
          status: 'unknown',
        }),
      }),
      expect.any(Function),
    );
  });

  it('should redact nested object', async () => {
    const mockTransport = new Transport({
      log: jest.fn(),
      logv: jest.fn(),
    });

    const pluginId = 'test-plugin';

    const auditor = Auditor.create({
      auth: mockServices.auth.mock(),
      httpAuth: mockServices.httpAuth.mock(),
      plugin: {
        getId: () => pluginId,
      },
      format: format.json(),
      transports: [mockTransport],
    });

    auditor.addRedactions(['hello']);

    await auditor.log({
      eventId: 'something-went-wrong',
      status: 'unknown',
      meta: {
        null: null,
        nested: 'hello (world) from nested object',
        nullProto: Object.create(null, {
          foo: { value: 'hello foo', enumerable: true },
        }),
      },
    });

    expect(mockTransport.log).toHaveBeenCalledWith(
      expect.objectContaining({
        [MESSAGE]: JSON.stringify({
          actor: {},
          isAuditorEvent: true,
          level: 'info',
          message: 'test-plugin.something-went-wrong',
          meta: {
            nested: '*** (world) from nested object',
            null: null,
            nullProto: {
              foo: '*** foo',
            },
          },
          status: 'unknown',
        }),
      }),
      expect.any(Function),
    );
  });

  it('should log when creating event', async () => {
    const mockTransport = new Transport({
      log: jest.fn(),
      logv: jest.fn(),
    });

    const pluginId = 'test-plugin';

    const auditor = Auditor.create({
      auth: mockServices.auth.mock(),
      httpAuth: mockServices.httpAuth.mock(),
      plugin: {
        getId: () => pluginId,
      },
      format: format.json(),
      transports: [mockTransport],
    });

    await auditor.createEvent({
      eventId: 'something-went-wrong',
    });

    expect(mockTransport.log).toHaveBeenCalledWith(
      expect.objectContaining({
        [MESSAGE]: JSON.stringify({
          actor: {},
          isAuditorEvent: true,
          level: 'info',
          message: 'test-plugin.something-went-wrong',
          status: 'initiated',
        }),
      }),
      expect.any(Function),
    );
  });
});
