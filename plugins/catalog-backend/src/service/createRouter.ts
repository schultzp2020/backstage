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

import { errorHandler } from '@backstage/backend-common';
import {
  AuditorService,
  AuthService,
  HttpAuthService,
  LoggerService,
  PermissionsService,
  SchedulerService,
} from '@backstage/backend-plugin-api';
import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  Entity,
  parseLocationRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import { InputError, NotFoundError, serializeError } from '@backstage/errors';
import { LocationAnalyzer } from '@backstage/plugin-catalog-node';
import express from 'express';
import yn from 'yn';
import { z } from 'zod';
import { EntitiesCatalog } from '../catalog/types';
import { CatalogProcessingOrchestrator } from '../processing/types';
import { validateEntityEnvelope } from '../processing/util';
import { createOpenApiRouter } from '../schema/openapi.generated';
import { AuthorizedValidationService } from './AuthorizedValidationService';
import {
  basicEntityFilter,
  entitiesBatchRequest,
  parseEntityFilterParams,
  parseEntityTransformParams,
  parseQueryEntitiesParams,
} from './request';
import { parseEntityFacetParams } from './request/parseEntityFacetParams';
import { parseEntityOrderParams } from './request/parseEntityOrderParams';
import { parseEntityPaginationParams } from './request/parseEntityPaginationParams';
import { LocationService, RefreshService } from './types';
import {
  disallowReadonlyMode,
  encodeCursor,
  locationInput,
  validateRequestBody,
} from './util';

/**
 * Options used by {@link createRouter}.
 *
 * @public
 * @deprecated Please migrate to the new backend system as this will be removed in the future.
 */
export interface RouterOptions {
  entitiesCatalog?: EntitiesCatalog;
  locationAnalyzer?: LocationAnalyzer;
  locationService: LocationService;
  orchestrator?: CatalogProcessingOrchestrator;
  refreshService?: RefreshService;
  scheduler?: SchedulerService;
  logger: LoggerService;
  config: Config;
  permissionIntegrationRouter?: express.Router;
  auth: AuthService;
  httpAuth: HttpAuthService;
  permissionsService: PermissionsService;
  // TODO: Require AuditorService once `backend-legacy` is removed
  auditor?: AuditorService;
}

/**
 * Creates a catalog router.
 */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const router = await createOpenApiRouter({
    validatorOptions: {
      // We want the spec to be up to date with the expected value, but the return type needs
      //  to be controlled by the router implementation not the request validator.
      ignorePaths: /^\/validate-entity\/?$/,
    },
  });
  const {
    entitiesCatalog,
    locationAnalyzer,
    locationService,
    orchestrator,
    refreshService,
    config,
    logger,
    permissionIntegrationRouter,
    permissionsService,
    auth,
    httpAuth,
    auditor,
  } = options;

  const readonlyEnabled =
    config.getOptionalBoolean('catalog.readonly') || false;
  if (readonlyEnabled) {
    logger.info('Catalog is running in readonly mode');
  }

  if (refreshService) {
    // TODO: Potentially find a way to track the ancestor that gets refreshed to refresh this entity (as well as the child of that ancestor?)
    router.post('/refresh', async (req, res) => {
      const { authorizationToken, ...restBody } = req.body;

      try {
        await auditor?.info({
          eventId: 'CatalogEntityRefresh',
          status: 'initiated',
          meta: {
            entityRef: restBody.entityRef,
          },
          request: req,
        });

        const credentials = authorizationToken
          ? await auth.authenticate(authorizationToken)
          : await httpAuth.credentials(req);

        await refreshService.refresh({
          ...restBody,
          credentials,
        });

        await auditor?.info({
          eventId: 'CatalogEntityRefresh',
          status: 'succeeded',
          meta: {
            entityRef: restBody.entityRef,
          },
          request: req,
        });
        res.status(200).end();
      } catch (err) {
        await auditor?.error({
          eventId: 'CatalogEntityRefresh',
          status: 'failed',
          error: err,
          meta: {
            entityRef: restBody.entityRef,
          },
          request: req,
        });
        throw err;
      }
    });
  }

  if (permissionIntegrationRouter) {
    router.use(permissionIntegrationRouter);
  }

  if (entitiesCatalog) {
    router
      .get('/entities', async (req, res) => {
        try {
          await auditor?.info({
            eventId: 'CatalogEntityFetch',
            status: 'initiated',
            request: req,
          });

          const { entities, pageInfo } = await entitiesCatalog.entities({
            filter: parseEntityFilterParams(req.query),
            fields: parseEntityTransformParams(req.query),
            order: parseEntityOrderParams(req.query),
            pagination: parseEntityPaginationParams(req.query),
            credentials: await httpAuth.credentials(req),
          });

          // Add a Link header to the next page
          if (pageInfo.hasNextPage) {
            const url = new URL(`http://ignored${req.url}`);
            url.searchParams.delete('offset');
            url.searchParams.set('after', pageInfo.endCursor);
            res.setHeader('link', `<${url.pathname}${url.search}>; rel="next"`);
          }

          await auditor?.info({
            eventId: 'CatalogEntityFetch',
            status: 'succeeded',
            request: req,
            // Let's not log out the entities since this can make the log very big due to it not being paged
          });

          // TODO(freben): encode the pageInfo in the response
          res.json(entities);
        } catch (err) {
          await auditor?.error({
            eventId: 'CatalogEntityFetch',
            status: 'failed',
            request: req,
            error: err,
          });
          throw err;
        }
      })
      .get('/entities/by-query', async (req, res) => {
        try {
          await auditor?.info({
            eventId: 'CatalogEntityFetchByQuery',
            status: 'initiated',
            request: req,
          });

          const { items, pageInfo, totalItems } =
            await entitiesCatalog.queryEntities({
              limit: req.query.limit,
              offset: req.query.offset,
              ...parseQueryEntitiesParams(req.query),
              credentials: await httpAuth.credentials(req),
            });

          await auditor?.info({
            eventId: 'CatalogEntityFetchByQuery',
            status: 'succeeded',
            request: req,
            meta: {
              totalEntities: totalItems,
              pageInfo: {
                ...(pageInfo.nextCursor && {
                  nextCursor: encodeCursor(pageInfo.nextCursor),
                }),
                ...(pageInfo.prevCursor && {
                  prevCursor: encodeCursor(pageInfo.prevCursor),
                }),
              },
            },
            // Let's not log out the entities since this can make the log very big
          });

          res.json({
            items,
            totalItems,
            pageInfo: {
              ...(pageInfo.nextCursor && {
                nextCursor: encodeCursor(pageInfo.nextCursor),
              }),
              ...(pageInfo.prevCursor && {
                prevCursor: encodeCursor(pageInfo.prevCursor),
              }),
            },
          });
        } catch (err) {
          await auditor?.error({
            eventId: 'CatalogEntityFetchByQuery',
            status: 'failed',
            request: req,
            error: err,
          });
          throw err;
        }
      })
      .get('/entities/by-uid/:uid', async (req, res) => {
        const { uid } = req.params;

        try {
          await auditor?.info({
            eventId: 'CatalogEntityFetchByUid',
            status: 'initiated',
            request: req,
            meta: {
              uid: uid,
            },
          });

          const { entities } = await entitiesCatalog.entities({
            filter: basicEntityFilter({ 'metadata.uid': uid }),
            credentials: await httpAuth.credentials(req),
          });
          if (!entities.length) {
            throw new NotFoundError(`No entity with uid ${uid}`);
          }

          await auditor?.info({
            eventId: 'CatalogEntityFetchByUid',
            status: 'succeeded',
            request: req,
            meta: {
              uid: uid,
              entityRef: entities.map(stringifyEntityRef).at(0),
            },
          });

          res.status(200).json(entities.at(0));
        } catch (err) {
          await auditor?.error({
            eventId: 'CatalogEntityFetchByUid',
            status: 'failed',
            request: req,
            meta: {
              uid: uid,
            },
            error: err,
          });
          throw err;
        }
      })
      .delete('/entities/by-uid/:uid', async (req, res) => {
        const { uid } = req.params;

        try {
          await auditor?.info({
            eventId: 'CatalogEntityDelete',
            status: 'initiated',
            request: req,
            meta: {
              uid: uid,
            },
          });

          await entitiesCatalog.removeEntityByUid(uid, {
            credentials: await httpAuth.credentials(req),
          });

          await auditor?.info({
            eventId: 'CatalogEntityDelete',
            status: 'succeeded',
            request: req,
            meta: {
              uid: uid,
            },
          });

          res.status(204).end();
        } catch (err) {
          await auditor?.error({
            eventId: 'CatalogEntityDelete',
            status: 'failed',
            request: req,
            error: err,
            meta: {
              uid: uid,
            },
          });
          throw err;
        }
      })
      .get('/entities/by-name/:kind/:namespace/:name', async (req, res) => {
        const { kind, namespace, name } = req.params;
        const entityRef = stringifyEntityRef({ kind, namespace, name });

        try {
          await auditor?.info({
            eventId: 'CatalogEntityFetchByName',
            status: 'initiated',
            request: req,
            meta: {
              entityRef: entityRef,
            },
          });

          const { entities } = await entitiesCatalog.entities({
            filter: basicEntityFilter({
              kind: kind,
              'metadata.namespace': namespace,
              'metadata.name': name,
            }),
            credentials: await httpAuth.credentials(req),
          });
          if (!entities.length) {
            throw new NotFoundError(
              `No entity named '${name}' found, with kind '${kind}' in namespace '${namespace}'`,
            );
          }

          await auditor?.info({
            eventId: 'CatalogEntityFetchByName',
            status: 'succeeded',
            request: req,
            meta: {
              entityRef: entityRef,
            },
          });

          res.status(200).json(entities.at(0));
        } catch (err) {
          await auditor?.error({
            eventId: 'CatalogEntityFetchByName',
            status: 'failed',
            request: req,
            meta: {
              entityRef: entityRef,
            },
            error: err,
          });
          throw err;
        }
      })
      .get(
        '/entities/by-name/:kind/:namespace/:name/ancestry',
        async (req, res) => {
          const { kind, namespace, name } = req.params;
          const entityRef = stringifyEntityRef({ kind, namespace, name });

          try {
            await auditor?.info({
              eventId: 'CatalogEntityAncestryFetch',
              status: 'initiated',
              request: req,
              meta: {
                entityRef: entityRef,
              },
            });

            const response = await entitiesCatalog.entityAncestry(entityRef, {
              credentials: await httpAuth.credentials(req),
            });

            await auditor?.info({
              eventId: 'CatalogEntityAncestryFetch',
              status: 'succeeded',
              request: req,
              meta: {
                rootEntityRef: response.rootEntityRef,
                ancestry: response.items.map(ancestryLink => {
                  return {
                    entityRef: stringifyEntityRef(ancestryLink.entity),
                    parentEntityRefs: ancestryLink.parentEntityRefs,
                  };
                }),
              },
            });

            res.status(200).json(response);
          } catch (err) {
            await auditor?.error({
              eventId: 'CatalogEntityAncestryFetch',
              status: 'failed',
              request: req,
              meta: {
                entityRef: entityRef,
              },
              error: err,
            });
            throw err;
          }
        },
      )
      .post('/entities/by-refs', async (req, res) => {
        try {
          await auditor?.info({
            eventId: 'CatalogEntityBatchFetch',
            status: 'initiated',
            request: req,
          });

          const request = entitiesBatchRequest(req);
          const response = await entitiesCatalog.entitiesBatch({
            entityRefs: request.entityRefs,
            filter: parseEntityFilterParams(req.query),
            fields: parseEntityTransformParams(req.query, request.fields),
            credentials: await httpAuth.credentials(req),
          });

          await auditor?.info({
            eventId: 'CatalogEntityBatchFetch',
            status: 'succeeded',
            request: req,
            meta: {
              ...request,
            },
          });

          res.status(200).json(response);
        } catch (err) {
          await auditor?.error({
            eventId: 'CatalogEntityBatchFetch',
            status: 'failed',
            request: req,
            error: err,
          });
          throw err;
        }
      })
      .get('/entity-facets', async (req, res) => {
        try {
          await auditor?.info({
            eventId: 'CatalogEntityFacetFetch',
            status: 'initiated',
            request: req,
          });

          const response = await entitiesCatalog.facets({
            filter: parseEntityFilterParams(req.query),
            facets: parseEntityFacetParams(req.query),
            credentials: await httpAuth.credentials(req),
          });

          await auditor?.info({
            eventId: 'CatalogEntityFacetFetch',
            status: 'succeeded',
            request: req,
          });

          res.status(200).json(response);
        } catch (err) {
          await auditor?.error({
            eventId: 'CatalogEntityFacetFetch',
            status: 'failed',
            request: req,
            error: err,
          });
          throw err;
        }
      });
  }

  if (locationService) {
    router
      .post('/locations', async (req, res) => {
        const location = await validateRequestBody(req, locationInput);
        const dryRun = yn(req.query.dryRun, { default: false });

        try {
          await auditor?.info({
            eventId: 'CatalogLocationCreate',
            status: 'initiated',
            meta: {
              location: location,
              isDryRun: dryRun,
            },
            request: req,
          });

          // when in dryRun addLocation is effectively a read operation so we don't
          // need to disallow readonly
          if (!dryRun) {
            disallowReadonlyMode(readonlyEnabled);
          }

          const output = await locationService.createLocation(
            location,
            dryRun,
            {
              credentials: await httpAuth.credentials(req),
            },
          );

          await auditor?.info({
            eventId: 'CatalogLocationCreate',
            status: 'succeeded',
            meta: {
              location: output.location,
              isDryRun: dryRun,
            },
            request: req,
          });

          res.status(201).json(output);
        } catch (err) {
          await auditor?.error({
            eventId: 'CatalogLocationCreate',
            status: 'failed',
            meta: {
              location: location,
              isDryRun: dryRun,
            },
            error: err,
            request: req,
          });
          throw err;
        }
      })
      .get('/locations', async (req, res) => {
        try {
          await auditor?.info({
            eventId: 'CatalogLocationFetch',
            status: 'initiated',
            request: req,
          });

          const locations = await locationService.listLocations({
            credentials: await httpAuth.credentials(req),
          });

          await auditor?.info({
            eventId: 'CatalogLocationFetch',
            status: 'succeeded',
            request: req,
          });

          res.status(200).json(locations.map(l => ({ data: l })));
        } catch (err) {
          await auditor?.error({
            eventId: 'CatalogLocationFetch',
            status: 'failed',
            request: req,
            error: err,
          });
          throw err;
        }
      })

      .get('/locations/:id', async (req, res) => {
        const { id } = req.params;

        try {
          await auditor?.info({
            eventId: 'CatalogLocationFetchById',
            status: 'initiated',
            meta: {
              id: id,
            },
            request: req,
          });

          const output = await locationService.getLocation(id, {
            credentials: await httpAuth.credentials(req),
          });

          await auditor?.info({
            eventId: 'CatalogLocationFetchById',
            status: 'succeeded',
            meta: {
              id: id,
              output: output,
            },
            request: req,
          });

          res.status(200).json(output);
        } catch (err) {
          await auditor?.error({
            eventId: 'CatalogLocationFetchById',
            status: 'failed',
            meta: {
              id: id,
            },
            error: err,
            request: req,
          });
          throw err;
        }
      })
      .delete('/locations/:id', async (req, res) => {
        const { id } = req.params;

        try {
          await auditor?.info({
            eventId: 'CatalogLocationDelete',
            status: 'initiated',
            meta: {
              id: id,
            },
            request: req,
          });

          disallowReadonlyMode(readonlyEnabled);

          await locationService.deleteLocation(id, {
            credentials: await httpAuth.credentials(req),
          });

          await auditor?.info({
            eventId: 'CatalogLocationDelete',
            status: 'succeeded',
            meta: {
              id: id,
            },
            request: req,
          });

          res.status(204).end();
        } catch (err) {
          await auditor?.error({
            eventId: 'CatalogLocationDelete',
            status: 'failed',
            meta: {
              id: id,
            },
            error: err,
            request: req,
          });
          throw err;
        }
      })
      .get('/locations/by-entity/:kind/:namespace/:name', async (req, res) => {
        const { kind, namespace, name } = req.params;
        const locationRef = `${kind}:${namespace}/${name}`;

        try {
          await auditor?.info({
            eventId: 'CatalogLocationFetchByEntityRef',
            status: 'initiated',
            meta: {
              locationRef: locationRef,
            },
            request: req,
          });

          const output = await locationService.getLocationByEntity(
            { kind, namespace, name },
            { credentials: await httpAuth.credentials(req) },
          );

          await auditor?.info({
            eventId: 'CatalogLocationFetchByEntityRef',
            status: 'succeeded',
            meta: {
              locationRef: locationRef,
              output: output,
            },
            request: req,
          });

          res.status(200).json(output);
        } catch (err) {
          await auditor?.error({
            eventId: 'CatalogLocationFetchByEntityRef',
            status: 'failed',
            meta: {
              locationRef: locationRef,
            },
            error: err,
            request: req,
          });
          throw err;
        }
      });
  }

  if (locationAnalyzer) {
    router.post('/analyze-location', async (req, res) => {
      try {
        await auditor?.info({
          eventId: 'CatalogLocationAnalyze',
          status: 'initiated',
          request: req,
        });

        const body = await validateRequestBody(
          req,
          z.object({
            location: locationInput,
            catalogFilename: z.string().optional(),
          }),
        );
        const schema = z.object({
          location: locationInput,
          catalogFilename: z.string().optional(),
        });
        const credentials = await httpAuth.credentials(req);
        const parsedBody = schema.parse(body);
        try {
          const output = await locationAnalyzer.analyzeLocation(
            parsedBody,
            credentials,
          );

          await auditor?.info({
            eventId: 'CatalogLocationAnalyze',
            status: 'succeeded',
            request: req,
            meta: {
              output: output,
            },
          });

          res.status(200).json(output);
        } catch (err) {
          if (
            // Catch errors from parse-url library.
            err.name === 'Error' &&
            'subject_url' in err
          ) {
            throw new InputError('The given location.target is not a URL');
          }
          throw err;
        }
      } catch (err) {
        await auditor?.error({
          eventId: 'CatalogLocationAnalyze',
          status: 'failed',
          error: err,
          request: req,
        });
        throw err;
      }
    });
  }

  if (orchestrator) {
    router.post('/validate-entity', async (req, res) => {
      try {
        await auditor?.info({
          eventId: 'CatalogEntityValidate',
          status: 'initiated',
          request: req,
        });

        const bodySchema = z.object({
          entity: z.unknown(),
          location: z.string(),
        });

        let body: z.infer<typeof bodySchema>;
        let entity: Entity;
        let location: { type: string; target: string };
        try {
          body = await validateRequestBody(req, bodySchema);
          entity = validateEntityEnvelope(body.entity);
          location = parseLocationRef(body.location);
          if (location.type !== 'url')
            throw new TypeError(
              `Invalid location ref ${body.location}, only 'url:<target>' is supported, e.g. url:https://host/path`,
            );
        } catch (err) {
          await auditor?.error({
            eventId: 'CatalogEntityValidate',
            status: 'failed',
            error: err,
            request: req,
          });

          return res.status(400).json({
            errors: [serializeError(err)],
          });
        }

        const credentials = await httpAuth.credentials(req);
        const authorizedValidationService = new AuthorizedValidationService(
          orchestrator,
          permissionsService,
        );
        const processingResult = await authorizedValidationService.process(
          {
            entity: {
              ...entity,
              metadata: {
                ...entity.metadata,
                annotations: {
                  [ANNOTATION_LOCATION]: body.location,
                  [ANNOTATION_ORIGIN_LOCATION]: body.location,
                  ...entity.metadata.annotations,
                },
              },
            },
          },
          credentials,
        );

        if (!processingResult.ok) {
          const errors = processingResult.errors.map(e => serializeError(e));

          await auditor?.error({
            eventId: 'CatalogEntityValidate',
            status: 'failed',
            errors: errors,
            request: req,
          });

          res.status(400).json({
            errors,
          });
        }

        await auditor?.info({
          eventId: 'CatalogEntityValidate',
          status: 'succeeded',
          request: req,
        });

        return res.status(200).end();
      } catch (err) {
        await auditor?.error({
          eventId: 'CatalogEntityValidate',
          status: 'failed',
          error: err,
          request: req,
        });
        throw err;
      }
    });
  }

  router.use(errorHandler());
  return router;
}
