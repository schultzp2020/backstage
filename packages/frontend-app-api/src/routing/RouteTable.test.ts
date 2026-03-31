/*
 * Copyright 2026 The Backstage Authors
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

import { RouteTable } from './RouteTable';

describe('RouteTable', () => {
  it('should match a simple path', () => {
    const table = new RouteTable(['/catalog']);
    expect(table.match('/catalog/foo')).toBe('/catalog');
  });

  it('should perform longest-prefix match', () => {
    const table = new RouteTable(['/', '/catalog']);
    expect(table.match('/catalog/foo')).toBe('/catalog');
  });

  it('should return undefined for unmatched paths', () => {
    const table = new RouteTable(['/catalog']);
    expect(table.match('/unknown')).toBeUndefined();
  });

  it('should match exact paths', () => {
    const table = new RouteTable(['/catalog']);
    expect(table.match('/catalog')).toBe('/catalog');
  });

  it('should handle root path /', () => {
    const table = new RouteTable(['/', '/catalog']);
    expect(table.match('/catalog/foo')).toBe('/catalog');
    expect(table.match('/unknown')).toBe('/');
  });

  it('should not match partial prefixes without separator', () => {
    const table = new RouteTable(['/cat', '/catalog']);
    expect(table.match('/catalog/foo')).toBe('/catalog');
    expect(table.match('/cat/foo')).toBe('/cat');
    expect(table.match('/category')).toBeUndefined();
  });

  it('should handle trailing slashes', () => {
    const table = new RouteTable(['/catalog']);
    expect(table.match('/catalog/')).toBe('/catalog');
  });
});
