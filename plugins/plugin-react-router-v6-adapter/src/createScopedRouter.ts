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

import React, { useSyncExternalStore } from 'react';
import type { RoutingContract } from '@backstage/frontend-plugin-api';
import {
  UNSAFE_LocationContext,
  UNSAFE_NavigationContext,
  NavigationType,
} from 'react-router';
import type { Navigator } from 'react-router';
import {
  useLocation as useRRLocation,
  useNavigate as useRRNavigate,
  useParams as useRRParams,
  useSearchParams as useRRSearchParams,
} from 'react-router-dom';
import type { Location, NavigateFunction, To } from 'react-router-dom';

/** @public */
export interface ScopedRouterResult {
  Router: React.ComponentType<{ children: React.ReactNode }>;
  useLocation: () => Location;
  useNavigate: () => NavigateFunction;
  useParams: <T extends Record<string, string | undefined>>() => T;
  useSearchParams: (
    ...args: Parameters<typeof useRRSearchParams>
  ) => ReturnType<typeof useRRSearchParams>;
}

/** @public */
export function createScopedRouter(
  contract: RoutingContract,
): ScopedRouterResult {
  // Store for useSyncExternalStore — keeps the latest location from the contract
  let latestLocation: Location = {
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  };

  // Set of listener callbacks for useSyncExternalStore
  const listeners = new Set<() => void>();

  // Subscribe to the contract's location$ eagerly so we capture the initial value
  contract.location$.subscribe(routingLocation => {
    latestLocation = {
      pathname: routingLocation.pathname,
      search: routingLocation.search,
      hash: routingLocation.hash,
      state: null,
      key: 'default',
    };
    for (const listener of listeners) {
      listener();
    }
  });

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function getSnapshot(): Location {
    return latestLocation;
  }

  function ScopedRouter({ children }: { children: React.ReactNode }) {
    const location = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    const locationContextValue = React.useMemo(
      () => ({
        location,
        navigationType: NavigationType.Pop,
      }),
      [location],
    );

    const navigator: Navigator = React.useMemo(
      () => ({
        createHref(to: To): string {
          if (typeof to === 'string') {
            return to;
          }
          const { pathname = '/', search = '', hash = '' } = to;
          return `${pathname}${search}${hash}`;
        },
        go(delta: number): void {
          // Intentional: delegate to window.history.go()
          // popstate fires and NavigationController catches it
          window.history.go(delta);
        },
        push(to: To, _state?: any, _opts?: any): void {
          const path = typeof to === 'string' ? to : createPath(to);
          contract.navigate(path, { replace: false });
        },
        replace(to: To, _state?: any, _opts?: any): void {
          const path = typeof to === 'string' ? to : createPath(to);
          contract.navigate(path, { replace: true });
        },
      }),
      [],
    );

    const navigationContextValue = React.useMemo(
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

    return React.createElement(
      UNSAFE_NavigationContext.Provider,
      { value: navigationContextValue },
      React.createElement(
        UNSAFE_LocationContext.Provider,
        { value: locationContextValue },
        children,
      ),
    );
  }

  return {
    Router: ScopedRouter,
    useLocation: (): Location => useRRLocation(),
    useNavigate: (): NavigateFunction => useRRNavigate(),
    useParams: <T extends Record<string, string | undefined>>(): T =>
      useRRParams() as T,
    useSearchParams: (...args: Parameters<typeof useRRSearchParams>) =>
      useRRSearchParams(...args),
  };
}

function createPath(
  to: Partial<{ pathname: string; search: string; hash: string }>,
): string {
  const { pathname = '/', search = '', hash = '' } = to;
  return `${pathname}${search}${hash}`;
}
