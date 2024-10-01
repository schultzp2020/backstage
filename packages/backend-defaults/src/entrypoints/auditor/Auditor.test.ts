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
    const auditor = Auditor.create({
      auth: mockServices.auth.mock(),
      httpAuth: mockServices.httpAuth.mock(),
    });
    expect(auditor).toBeInstanceOf(Auditor);
  });

  it('creates a child logger', () => {
    const auditor = Auditor.create({
      auth: mockServices.auth.mock(),
      httpAuth: mockServices.httpAuth.mock(),
    });
    const childLogger = auditor.child({ plugin: 'test-plugin' });
    expect(childLogger).toBeInstanceOf(Auditor);
  });

  it('should redact and escape regex', async () => {
    const mockTransport = new Transport({
      log: jest.fn(),
      logv: jest.fn(),
    });

    const auditor = Auditor.create({
      auth: mockServices.auth.mock(),
      httpAuth: mockServices.httpAuth.mock(),
      format: format.json(),
      transports: [mockTransport],
    });

    auditor.addRedactions(['hello (world']);

    await auditor.error({
      message: 'hello (world) from this file',
      eventName: '',
      stage: '',
      status: 'unknown',
    });

    expect(mockTransport.log).toHaveBeenCalledWith(
      expect.objectContaining({
        [MESSAGE]: JSON.stringify({
          actor: {},
          eventName: '',
          isAuditorEvent: true,
          level: 'error',
          message: '***) from this file',
          stage: '',
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

    const auditor = Auditor.create({
      auth: mockServices.auth.mock(),
      httpAuth: mockServices.httpAuth.mock(),
      format: format.json(),
      transports: [mockTransport],
    });

    auditor.addRedactions(['hello']);

    await auditor.error({
      message: 'something went wrong',
      eventName: '',
      stage: '',
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
          eventName: '',
          isAuditorEvent: true,
          level: 'error',
          message: 'something went wrong',
          meta: {
            nested: '*** (world) from nested object',
            null: null,
            nullProto: {
              foo: '*** foo',
            },
          },
          stage: '',
          status: 'unknown',
        }),
      }),
      expect.any(Function),
    );
  });
});
