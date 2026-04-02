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

import React, { type ComponentType } from 'react';
import type { RoutingContract } from '@backstage/frontend-plugin-api';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider as TanStackRouterProvider,
  type AnyRouter,
} from '@tanstack/react-router';

/** @public */
export interface TanStackScopedRouterResult {
  RouterProvider: ComponentType;
  router: AnyRouter;
  dispose: () => void;
}

/** @public */
export function createScopedRouter(
  contract: RoutingContract,
): TanStackScopedRouterResult {
  if (!contract) {
    throw new Error(
      'createScopedRouter requires a RoutingContract. Ensure this component is rendered inside a PageBlueprint.',
    );
  }

  // Instance-scoped guard flags to prevent circular updates
  let isUpdatingFromContract = false;
  let isUpdatingFromRouter = false;
  // Track the last path forwarded to contract to avoid redundant navigations
  let lastForwardedPath = '';

  // Create memory history with initial location from contract.
  // The contract emits synchronously on subscribe, so we capture it.
  let initialPathname = '/';
  let initialSearch = '';
  const initialSub = contract.location$.subscribe(loc => {
    initialPathname = loc.pathname;
    initialSearch = loc.search;
  });
  initialSub.unsubscribe();
  lastForwardedPath = `${initialPathname}${initialSearch}`;

  const memoryHistory = createMemoryHistory({
    initialEntries: [`${initialPathname}${initialSearch}`],
  });

  // Catch-all root route
  const rootRoute = createRootRoute();

  const router = createRouter({
    routeTree: rootRoute,
    history: memoryHistory,
  });

  // Contract -> TanStack sync: when contract emits, update memory history
  const contractSubscription = contract.location$.subscribe(loc => {
    if (isUpdatingFromRouter) {
      return; // Skip - this emission was caused by our own navigate
    }
    const newPath = `${loc.pathname}${loc.search}${loc.hash}`;
    const currentPath = `${memoryHistory.location.pathname}${memoryHistory.location.search}${memoryHistory.location.hash}`;

    if (newPath !== currentPath) {
      isUpdatingFromContract = true;
      memoryHistory.push(newPath);
      router.load().catch(() => {
        // Route resolution errors are handled by TanStack Router's error boundary
      });
      isUpdatingFromContract = false;
    }
  });

  // TanStack -> Contract sync: when router navigates, forward to contract
  const historyUnsubscribe = memoryHistory.subscribe(() => {
    if (isUpdatingFromContract) {
      return; // Skip - this was caused by our own contract sync
    }
    const historyPath = `${memoryHistory.location.pathname}${memoryHistory.location.search}${memoryHistory.location.hash}`;
    if (historyPath === lastForwardedPath) {
      return; // Skip - path unchanged (e.g., URL normalization)
    }
    isUpdatingFromRouter = true;
    lastForwardedPath = historyPath;
    contract.navigate(historyPath, { replace: false });
    isUpdatingFromRouter = false;
  });

  function RouterProviderComponent() {
    return React.createElement(TanStackRouterProvider, { router });
  }

  return {
    RouterProvider: RouterProviderComponent,
    router,
    dispose: () => {
      contractSubscription.unsubscribe();
      historyUnsubscribe();
    },
  };
}
