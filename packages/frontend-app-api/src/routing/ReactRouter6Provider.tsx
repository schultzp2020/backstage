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

import { ReactNode, useContext, useMemo } from 'react';
import {
  BrowserRouter,
  Route,
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  matchRoutes,
  generatePath,
  createRoutesFromChildren,
  useRoutes,
  RouteObject,
} from 'react-router-dom';
import {
  RoutingProvider,
  RoutingContextType,
  RoutingContext,
  useApi,
  configApiRef,
} from '@backstage/frontend-plugin-api';
import { getBasePath } from './getBasePath';

/**
 * A helper component that provides the current route parameters to the RoutingContext.
 */
const ParamsProvider = ({ children }: { children: ReactNode }) => {
  const params = useParams();
  const parentRouting = useContext(RoutingContext);

  const value = useMemo(() => {
    if (!parentRouting) {
      return parentRouting;
    }
    return {
      ...parentRouting,
      params: params as Record<string, string | undefined>,
    };
  }, [parentRouting, params]);

  if (!value) {
    return <>{children}</>;
  }

  return <RoutingProvider value={value}>{children}</RoutingProvider>;
};

/**
 * Recursively wraps route elements with ParamsProvider to ensure params are available
 * in the routing context for all routes.
 */
const collectRoutes = (routes: RouteObject[]): RouteObject[] => {
  return routes.map(route => {
    const newRoute: RouteObject = { ...route };
    if (newRoute.element) {
      newRoute.element = <ParamsProvider>{newRoute.element}</ParamsProvider>;
    }
    if (newRoute.children) {
      newRoute.children = collectRoutes(newRoute.children);
    }
    return newRoute;
  });
};

/**
 * A wrapper around useRoutes that ensures the routing context is updated with params
 * from the current route match.
 */
const WrappedRoutes = ({ children }: { children?: ReactNode }) => {
  const routes = createRoutesFromChildren(children);
  const wrappedRoutes = useMemo(() => collectRoutes(routes), [routes]);
  return useRoutes(wrappedRoutes);
};

/**
 * Adapts the React Router v6 context to the Backstage RoutingContext.
 *
 * @public
 */
export const ReactRouter6Provider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const value: RoutingContextType = useMemo(
    () => ({
      location: {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      },
      params: params as Record<string, string | undefined>,
      navigate: (to: string) => navigate(to),
      matchRoutes: (routes, loc) => matchRoutes(routes, loc),
      generatePath: (path: string, p?: Record<string, string | undefined>) =>
        generatePath(path, p),
      Routes: WrappedRoutes,
      Route,
      Link: Link as any,
      Outlet,
    }),
    [location, navigate, params],
  );

  return <RoutingProvider value={value}>{children}</RoutingProvider>;
};

/**
 * A Backstage router that uses React Router v6 to handle navigation and routing.
 *
 * @public
 */
export const ReactRouter6Router = ({ children }: { children: ReactNode }) => {
  const configApi = useApi(configApiRef);
  const basePath = getBasePath(configApi);

  return (
    <BrowserRouter basename={basePath}>
      <ReactRouter6Provider>{children}</ReactRouter6Provider>
    </BrowserRouter>
  );
};
