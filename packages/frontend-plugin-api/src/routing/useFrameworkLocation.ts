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

import { useSyncExternalStore, useCallback, useRef, useState } from 'react';
import { useApi } from '../apis';
import { navigationControllerApiRef } from './NavigationControllerApi';
import type { RoutingLocation } from './RoutingContract';

/** @public */
export function useFrameworkLocation(): RoutingLocation {
  const nav = useApi(navigationControllerApiRef);
  // Initialize by synchronously subscribing to get the current value.
  // NOTE: useRef does NOT support lazy initializers in React 18 (that's React 19+).
  // Use useState with lazy init to compute the initial value once.
  const [initialLocation] = useState(() => {
    let initial: RoutingLocation = { pathname: '/', search: '', hash: '' };
    const sub = nav.location$.subscribe(loc => {
      initial = loc;
    });
    sub.unsubscribe();
    return initial;
  });
  const locationRef = useRef<RoutingLocation>(initialLocation);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const sub = nav.location$.subscribe(loc => {
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
    [nav],
  );

  const getSnapshot = useCallback(() => locationRef.current, []);

  return useSyncExternalStore(subscribe, getSnapshot);
}
