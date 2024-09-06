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

import { MockRootAuditorService } from './MockRootAuditorService';

describe('MockRootAuditorService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be silent by default', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});

    const auditor = MockRootAuditorService.create();
    await auditor.error({
      message: 'error',
      eventName: '',
      stage: '',
      status: 'unknown',
    });
    await auditor.warn({
      message: 'warn',
      eventName: '',
      stage: '',
      status: 'unknown',
    });
    await auditor.info({
      message: 'info',
      eventName: '',
      stage: '',
      status: 'unknown',
    });
    await auditor.debug({
      message: 'debug',
      eventName: '',
      stage: '',
      status: 'unknown',
    });

    expect(console.error).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.debug).not.toHaveBeenCalled();
  });

  it('should be able to set none level', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});

    const auditor = MockRootAuditorService.create({ level: 'none' });
    await auditor.error({
      message: 'error',
      eventName: '',
      stage: '',
      status: 'unknown',
    });
    await auditor.warn({
      message: 'warn',
      eventName: '',
      stage: '',
      status: 'unknown',
    });
    await auditor.info({
      message: 'info',
      eventName: '',
      stage: '',
      status: 'unknown',
    });
    await auditor.debug({
      message: 'debug',
      eventName: '',
      stage: '',
      status: 'unknown',
    });

    expect(console.error).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.debug).not.toHaveBeenCalled();
  });

  it('should be able to set error level', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});

    const auditor = MockRootAuditorService.create({ level: 'error' });
    await auditor.error({
      message: 'error',
      eventName: '',
      stage: '',
      status: 'unknown',
    });
    await auditor.warn({
      message: 'warn',
      eventName: '',
      stage: '',
      status: 'unknown',
    });
    await auditor.info({
      message: 'info',
      eventName: '',
      stage: '',
      status: 'unknown',
    });
    await auditor.debug({
      message: 'debug',
      eventName: '',
      stage: '',
      status: 'unknown',
    });

    expect(console.error).toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.debug).not.toHaveBeenCalled();
  });

  it('should be able to set warn level', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});

    const auditor = MockRootAuditorService.create({ level: 'warn' });
    await auditor.error({
      message: 'error',
      eventName: '',
      stage: '',
      status: 'unknown',
    });
    await auditor.warn({
      message: 'warn',
      eventName: '',
      stage: '',
      status: 'unknown',
    });
    await auditor.info({
      message: 'info',
      eventName: '',
      stage: '',
      status: 'unknown',
    });
    await auditor.debug({
      message: 'debug',
      eventName: '',
      stage: '',
      status: 'unknown',
    });

    expect(console.error).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.debug).not.toHaveBeenCalled();
  });

  it('should be able to set info level', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});

    const auditor = MockRootAuditorService.create({ level: 'info' });
    await auditor.error({
      message: 'error',
      eventName: '',
      stage: '',
      status: 'unknown',
    });
    await auditor.warn({
      message: 'warn',
      eventName: '',
      stage: '',
      status: 'unknown',
    });
    await auditor.info({
      message: 'info',
      eventName: '',
      stage: '',
      status: 'unknown',
    });
    await auditor.debug({
      message: 'debug',
      eventName: '',
      stage: '',
      status: 'unknown',
    });

    expect(console.error).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    expect(console.info).toHaveBeenCalled();
    expect(console.debug).not.toHaveBeenCalled();
  });

  it('should be able to set debug level', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});

    const auditor = MockRootAuditorService.create({ level: 'debug' });
    await auditor.error({
      message: 'error',
      eventName: '',
      stage: '',
      status: 'unknown',
    });
    await auditor.warn({
      message: 'warn',
      eventName: '',
      stage: '',
      status: 'unknown',
    });
    await auditor.info({
      message: 'info',
      eventName: '',
      stage: '',
      status: 'unknown',
    });
    await auditor.debug({
      message: 'debug',
      eventName: '',
      stage: '',
      status: 'unknown',
    });

    expect(console.error).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    expect(console.info).toHaveBeenCalled();
    expect(console.debug).toHaveBeenCalled();
  });
});
