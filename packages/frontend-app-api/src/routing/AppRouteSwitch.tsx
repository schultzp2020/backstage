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
  useState,
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

/**
 * Subscribes to NavigationController.location$, matches the current pathname
 * via RouteTable, and renders the matched page extension with a scoped
 * RoutingContract provided via context.
 *
 * Reads from NavigationController.location$ (basename-stripped) rather than
 * window.location directly, ensuring correct behavior with app basename.
 *
 * @internal
 */
export function AppRouteSwitch(props: AppRouteSwitchProps) {
  const { controller, routeTable, pages, contracts, fallback } = props;

  // Get initial location synchronously from the controller's observable.
  // NavigationController.location$ emits synchronously on subscribe.
  const [initialLocation] = useState(() => {
    let initial: RoutingLocation = { pathname: '/', search: '', hash: '' };
    const sub = controller.location$.subscribe(loc => {
      initial = loc;
    });
    sub.unsubscribe();
    return initial;
  });

  // Cache the snapshot to satisfy useSyncExternalStore's requirement that
  // getSnapshot returns referentially stable values when nothing changed.
  const locationRef = useRef<RoutingLocation>(initialLocation);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const sub = controller.location$.subscribe(loc => {
        const prev = locationRef.current;
        if (
          prev.pathname !== loc.pathname ||
          prev.search !== loc.search ||
          prev.hash !== loc.hash
        ) {
          locationRef.current = loc;
          onStoreChange();
        }
      });
      return () => sub.unsubscribe();
    },
    [controller],
  );

  const getSnapshot = useCallback(() => locationRef.current, []);

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
