/*
 * Copyright 2020 The Backstage Authors
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

import type { CommonSignInResolver } from '@backstage/plugin-auth-node';

import type { GCPIapSignInResolver } from './src/resolvers';

export interface Config {
  auth?: {
    providers?: {
      /**
       * Configuration for the Google Cloud Platform Identity-Aware Proxy (IAP) auth provider.
       */
      gcpIap?: {
        /**
         * The audience to use when validating incoming JWT tokens.
         * See https://backstage.io/docs/auth/google/gcp-iap-auth
         */
        audience: string;

        /**
         * The name of the header to read the JWT token from, defaults to `'x-goog-iap-jwt-assertion'`.
         */
        jwtHeader?: string;

        signIn?: {
          resolvers: Array<GCPIapSignInResolver | CommonSignInResolver>;
        };
      };
    };
  };
}
