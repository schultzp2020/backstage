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

import { useMemo, type ReactNode } from 'react';
import {
  UNSAFE_LocationContext,
  UNSAFE_NavigationContext,
  NavigationType,
} from 'react-router-dom';
import type { RoutingContract } from '../routing';
import {
  useObservableAsState,
  routingLocationEqual,
} from '../routing/useObservableAsState';

/**
 * Sets up a scoped React Router v6 context from a RoutingContract.
 *
 * This uses the UNSAFE_ context APIs from react-router directly
 * instead of `<Router>`, which would throw when nested inside the
 * global `<BrowserRouter>` during Phase A.
 *
 * @internal
 */
export function ScopedRouterProvider(props: {
  contract: RoutingContract | undefined;
  children: ReactNode;
}) {
  const { contract, children } = props;

  if (!contract) {
    return <>{children}</>;
  }

  return (
    <ScopedRouterProviderInner contract={contract}>
      {children}
    </ScopedRouterProviderInner>
  );
}

function toPath(
  to: string | { pathname?: string; search?: string; hash?: string },
): string {
  if (typeof to === 'string') {
    return to;
  }
  let path = to.pathname ?? '/';
  if (to.search) path += to.search;
  if (to.hash) path += to.hash;
  return path;
}

function ScopedRouterProviderInner(props: {
  contract: RoutingContract;
  children: ReactNode;
}) {
  const { contract, children } = props;

  const location = useObservableAsState(
    contract.location$,
    routingLocationEqual,
  );

  const routerLocation = useMemo(
    () => ({
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: null,
      key: 'default',
    }),
    [location.pathname, location.search, location.hash],
  );

  const navigator = useMemo(
    () => ({
      createHref(to: { pathname?: string; search?: string; hash?: string }) {
        let href = to.pathname ?? '';
        if (to.search) href += to.search;
        if (to.hash) href += to.hash;
        return href;
      },
      go(delta: number) {
        window.history.go(delta);
      },
      push(to: string | { pathname?: string; search?: string; hash?: string }) {
        contract.navigate(toPath(to));
      },
      replace(
        to: string | { pathname?: string; search?: string; hash?: string },
      ) {
        contract.navigate(toPath(to), { replace: true });
      },
    }),
    [contract],
  );

  const navigationContextValue = useMemo(
    () => ({
      basename: '',
      navigator,
      static: false,
      future: {
        v7_relativeSplatPath: false,
      },
    }),
    [navigator],
  );

  const locationContextValue = useMemo(
    () => ({
      location: routerLocation,
      navigationType: NavigationType.Pop,
    }),
    [routerLocation],
  );

  return (
    <UNSAFE_NavigationContext.Provider value={navigationContextValue}>
      <UNSAFE_LocationContext.Provider value={locationContextValue}>
        {children}
      </UNSAFE_LocationContext.Provider>
    </UNSAFE_NavigationContext.Provider>
  );
}
