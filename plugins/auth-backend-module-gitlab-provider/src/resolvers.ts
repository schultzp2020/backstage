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

import {
  createSignInResolverFactory,
  GetSignInResolver,
  OAuthAuthenticatorResult,
  PassportProfile,
  SignInInfo,
} from '@backstage/plugin-auth-node';

export type GitlabSignInResolver = GetSignInResolver<
  typeof gitlabSignInResolvers
>;

/**
 * Available sign-in resolvers for the GitLab auth provider.
 *
 * @public
 */
export namespace gitlabSignInResolvers {
  /**
   * Looks up the user by matching their GitLab username to the entity name.
   */
  export const usernameMatchingUserEntityName = createSignInResolverFactory({
    create() {
      return async (
        info: SignInInfo<OAuthAuthenticatorResult<PassportProfile>>,
        ctx,
      ) => {
        const { result } = info;

        const id = result.fullProfile.username;
        if (!id) {
          throw new Error(`GitLab user profile does not contain a username`);
        }

        return ctx.signInWithCatalogUser({ entityRef: { name: id } });
      };
    },
  });
}
