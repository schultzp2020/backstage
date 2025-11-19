/*
 * Copyright 2024 The Backstage Authors
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

import { createContext, ReactNode } from 'react';
import { AppNode } from '../apis';
import { RouteRef } from './RouteRef';
import { AnyRouteRefParams } from './types';

/** @public */
export interface RouteObject {
  caseSensitive?: boolean;
  children?: RouteObject[];
  element?: ReactNode;
  path?: string;
  routeRefs?: Set<RouteRef<AnyRouteRefParams>>;
  appNode?: AppNode;
  [key: string]: unknown;
}

/** @public */
export interface RouteMatch<T extends RouteObject = RouteObject> {
  route: T;
  pathname: string;
  params: Record<string, string | undefined>;
}

/** @public */
export interface RoutingContextType {
  location: {
    pathname: string;
    search: string;
    hash: string;
  };
  params: Record<string, string | undefined>;
  navigate: (to: string) => void;
  matchRoutes: <T extends RouteObject = RouteObject>(
    routes: T[],
    location: { pathname: string },
  ) => RouteMatch<T>[] | null;
  generatePath: (
    path: string,
    params?: Record<string, string | undefined>,
  ) => string;
  Routes: React.ComponentType<{ children?: ReactNode }>;
  Route: React.ComponentType<{
    path?: string;
    element?: ReactNode;
    children?: ReactNode;
  }>;
  Link: React.ComponentType<{
    to: string;
    children?: ReactNode;
    className?: string;
  }>;
  Outlet: React.ComponentType<{}>;
}

/** @public */
export const RoutingContext = createContext<RoutingContextType | undefined>(
  undefined,
);

/** @public */
export const RoutingProvider = RoutingContext.Provider;
