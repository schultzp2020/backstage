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

/**
 * Provides longest-prefix URL matching for top-level page routing.
 *
 * Routes are sorted by length (longest first) so that the most specific
 * prefix wins. The root path `/` acts as a catch-all.
 *
 * @internal
 */
export class RouteTable {
  private readonly paths: string[];

  constructor(basePaths: string[]) {
    this.paths = [...basePaths].sort((a, b) => b.length - a.length);
  }

  match(pathname: string): string | undefined {
    return this.paths.find(base =>
      base === '/'
        ? true // root catches everything
        : pathname === base || pathname.startsWith(`${base}/`),
    );
  }
}
