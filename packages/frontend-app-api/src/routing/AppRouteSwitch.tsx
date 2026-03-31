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

import {
  type ComponentType,
  type ReactElement,
  useCallback,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import {
  RoutingContractContext,
  type RoutingContract,
  type RoutingLocation,
} from '@backstage/frontend-plugin-api';
import { NavigationController } from './NavigationController';
import { RouteTable } from './RouteTable';

/** @internal */
export interface AppRouteSwitchProps {
  controller: NavigationController;
  routeTable: RouteTable;
  pages: Map<string, ComponentType>;
  contracts?: Map<string, RoutingContract>;
  fallback: ReactElement;
}

function readLocationSnapshot(): RoutingLocation {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  };
}

/**
 * Subscribes to NavigationController.location$, matches the current pathname
 * via RouteTable, and renders the matched page extension with a scoped
 * RoutingContract provided via context.
 *
 * @internal
 */
export function AppRouteSwitch(props: AppRouteSwitchProps) {
  const { controller, routeTable, pages, contracts, fallback } = props;

  // Cache the snapshot to satisfy useSyncExternalStore's requirement that
  // getSnapshot returns referentially stable values when nothing changed.
  const cachedLocation = useRef<RoutingLocation>(readLocationSnapshot());

  const getSnapshot = useCallback((): RoutingLocation => {
    const current = readLocationSnapshot();
    const cached = cachedLocation.current;
    if (
      cached.pathname === current.pathname &&
      cached.search === current.search &&
      cached.hash === current.hash
    ) {
      return cached;
    }
    cachedLocation.current = current;
    return current;
  }, []);

  const subscribe = useCallback(
    (callback: () => void) => {
      // NavigationController.location$.subscribe emits synchronously on
      // subscribe. useSyncExternalStore does not expect the subscribe
      // function to call the callback synchronously, so we skip the
      // initial emission.
      let initialized = false;
      const sub = controller.location$.subscribe(() => {
        if (initialized) {
          callback();
        }
      });
      initialized = true;
      return () => sub.unsubscribe();
    },
    [controller],
  );

  const location = useSyncExternalStore<RoutingLocation>(
    subscribe,
    getSnapshot,
  );

  const matchedBasePath = routeTable.match(location.pathname);

  // Memoize contract creation per basePath to avoid re-creating on every render
  const contract = useMemo(() => {
    if (!matchedBasePath) {
      return undefined;
    }
    // Use pre-created contract if available
    if (contracts?.has(matchedBasePath)) {
      return contracts.get(matchedBasePath)!;
    }
    return controller.createContract(matchedBasePath);
  }, [matchedBasePath, controller, contracts]);

  if (!matchedBasePath || !contract) {
    return fallback;
  }

  const PageComponent = pages.get(matchedBasePath);
  if (!PageComponent) {
    return fallback;
  }

  return (
    <RoutingContractContext.Provider value={contract}>
      <PageComponent />
    </RoutingContractContext.Provider>
  );
}
