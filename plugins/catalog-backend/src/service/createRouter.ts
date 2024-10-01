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
  auditor: AuditorService;
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
        await auditor.info({
          eventName: 'CatalogEntityRefresh',
          message: 'Refreshing entity with ref',
          status: 'unknown',
          stage: 'initiation',
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

        await auditor.info({
          eventName: 'CatalogEntityRefresh',
          message: 'Successfully refreshed entity with ref',
          status: 'succeeded',
          stage: 'completion',
          meta: {
            entityRef: restBody.entityRef,
          },
          request: req,
        });
        res.status(200).end();
      } catch (err) {
        await auditor.error({
          eventName: 'CatalogEntityRefresh',
          message: 'Failed to refresh entity with ref',
          status: 'failed',
          stage: 'completion',
          errors: [err],
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
          await auditor.info({
            eventName: 'CatalogEntityFetch',
            message: 'Fetching entities with query parameters',
            status: 'unknown',
            stage: 'initiation',
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

          await auditor.info({
            eventName: 'CatalogEntityFetch',
            message: `Successfully fetched entities with query parameters`,
            status: 'succeeded',
            stage: 'completion',
            request: req,
            // Let's not log out the entities since this can make the log very big due to it not being paged
          });

          // TODO(freben): encode the pageInfo in the response
          res.json(entities);
        } catch (err) {
          await auditor.error({
            eventName: 'CatalogEntityFetch',
            message: 'Failed to fetch entities with query parameters',
            status: 'failed',
            stage: 'completion',
            request: req,
            errors: [err],
          });
          throw err;
        }
      })
      .get('/entities/by-query', async (req, res) => {
        try {
          await auditor.info({
            eventName: 'CatalogEntityFetchByQuery',
            message: 'Fetching entities with query',
            status: 'unknown',
            stage: 'initiation',
            request: req,
          });

          const { items, pageInfo, totalItems } =
            await entitiesCatalog.queryEntities({
              limit: req.query.limit,
              offset: req.query.offset,
              ...parseQueryEntitiesParams(req.query),
              credentials: await httpAuth.credentials(req),
            });

          await auditor.info({
            eventName: 'CatalogEntityFetchByQuery',
            message: 'Successfully fetched entities with query',
            status: 'succeeded',
            stage: 'completion',
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
          await auditor.error({
            eventName: 'CatalogEntityFetchByQuery',
            message: 'Failed to fetch entities with query',
            status: 'failed',
            stage: 'completion',
            request: req,
            errors: [err],
          });
          throw err;
        }
      })
      .get('/entities/by-uid/:uid', async (req, res) => {
        const { uid } = req.params;

        try {
          await auditor.info({
            eventName: 'CatalogEntityFetchByUid',
            message: 'Fetching entity with uid',
            status: 'unknown',
            stage: 'initiation',
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

          await auditor.info({
            eventName: 'CatalogEntityFetchByUid',
            message: 'Successfully fetched entity with uid',
            status: 'succeeded',
            stage: 'completion',
            request: req,
            meta: {
              uid: uid,
              entityRef: entities.map(stringifyEntityRef).at(0),
            },
          });

          res.status(200).json(entities.at(0));
        } catch (err) {
          await auditor.error({
            eventName: 'CatalogEntityFetchByUid',
            message: 'Failed to fetch entity with uid',
            status: 'failed',
            stage: 'completion',
            request: req,
            meta: {
              uid: uid,
            },
            errors: [err],
          });
          throw err;
        }
      })
      .delete('/entities/by-uid/:uid', async (req, res) => {
        const { uid } = req.params;

        try {
          await auditor.info({
            eventName: 'CatalogEntityDelete',
            message: 'Deleting entity with uid',
            status: 'unknown',
            stage: 'initiation',
            request: req,
            meta: {
              uid: uid,
            },
          });

          await entitiesCatalog.removeEntityByUid(uid, {
            credentials: await httpAuth.credentials(req),
          });

          await auditor.info({
            eventName: 'CatalogEntityDelete',
            message: 'Successfully deleted entity with uid',
            status: 'succeeded',
            stage: 'completion',
            request: req,
            meta: {
              uid: uid,
            },
          });

          res.status(204).end();
        } catch (err) {
          await auditor.error({
            eventName: 'CatalogEntityDelete',
            message: 'Failed to delete entity with uid',
            status: 'failed',
            stage: 'completion',
            request: req,
            errors: [err],
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
          await auditor.info({
            eventName: 'CatalogEntityFetchByName',
            message: 'Fetching entity with ref',
            status: 'unknown',
            stage: 'initiation',
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

          await auditor.info({
            eventName: 'CatalogEntityFetchByName',
            message: 'Successfully fetched entity with ref',
            status: 'succeeded',
            stage: 'completion',
            request: req,
            meta: {
              entityRef: entityRef,
            },
          });

          res.status(200).json(entities.at(0));
        } catch (err) {
          await auditor.error({
            eventName: 'CatalogEntityFetchByName',
            message: 'Failed to fetch entity with ref',
            status: 'failed',
            stage: 'completion',
            request: req,
            meta: {
              entityRef: entityRef,
            },
            errors: [err],
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
            await auditor.info({
              eventName: 'CatalogEntityAncestryFetch',
              message: 'Fetching ancestry for entity with ref',
              status: 'unknown',
              stage: 'initiation',
              request: req,
              meta: {
                entityRef: entityRef,
              },
            });

            const response = await entitiesCatalog.entityAncestry(entityRef, {
              credentials: await httpAuth.credentials(req),
            });

            await auditor.info({
              eventName: 'CatalogEntityAncestryFetch',
              message: 'Successfully fetched ancestry for entity with ref',
              status: 'succeeded',
              stage: 'completion',
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
            await auditor.error({
              eventName: 'CatalogEntityAncestryFetch',
              message: 'Failed to fetch ancestry for entity with ref',
              status: 'failed',
              stage: 'completion',
              request: req,
              meta: {
                entityRef: entityRef,
              },
              errors: [err],
            });
            throw err;
          }
        },
      )
      .post('/entities/by-refs', async (req, res) => {
        try {
          await auditor.info({
            eventName: 'CatalogEntityBatchFetch',
            message: 'Fetching batch of entities with refs',
            status: 'unknown',
            stage: 'initiation',
            request: req,
          });

          const request = entitiesBatchRequest(req);
          const response = await entitiesCatalog.entitiesBatch({
            entityRefs: request.entityRefs,
            filter: parseEntityFilterParams(req.query),
            fields: parseEntityTransformParams(req.query, request.fields),
            credentials: await httpAuth.credentials(req),
          });

          await auditor.info({
            eventName: 'CatalogEntityBatchFetch',
            message: 'Successfully fetched batch of entities with refs',
            status: 'succeeded',
            stage: 'completion',
            request: req,
            meta: {
              ...request,
            },
          });

          res.status(200).json(response);
        } catch (err) {
          await auditor.error({
            eventName: 'CatalogEntityBatchFetch',
            message: 'Failed to fetch batch of entities with refs',
            status: 'failed',
            stage: 'completion',
            request: req,
            errors: [err],
          });
          throw err;
        }
      })
      .get('/entity-facets', async (req, res) => {
        try {
          await auditor.info({
            eventName: 'CatalogEntityFacetFetch',
            message: 'Fetching facets for entity with ref',
            status: 'unknown',
            stage: 'initiation',
            request: req,
          });

          const response = await entitiesCatalog.facets({
            filter: parseEntityFilterParams(req.query),
            facets: parseEntityFacetParams(req.query),
            credentials: await httpAuth.credentials(req),
          });

          await auditor.info({
            eventName: 'CatalogEntityFacetFetch',
            message: 'Successfully fetched facets for entity with ref',
            status: 'succeeded',
            stage: 'completion',
            request: req,
          });

          res.status(200).json(response);
        } catch (err) {
          await auditor.error({
            eventName: 'CatalogEntityFacetFetch',
            message: 'Failed to fetch facets for entity with ref',
            status: 'failed',
            stage: 'completion',
            request: req,
            errors: [err],
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
          await auditor.info({
            eventName: 'CatalogLocationCreate',
            message: 'Creating location with payload',
            status: 'unknown',
            stage: 'initiation',
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

          await auditor.info({
            eventName: 'CatalogLocationCreate',
            message: 'Successfully created location with payload',
            status: 'succeeded',
            stage: 'completion',
            meta: {
              location: output.location,
              isDryRun: dryRun,
            },
            request: req,
          });

          res.status(201).json(output);
        } catch (err) {
          await auditor.error({
            eventName: 'CatalogLocationCreate',
            message: 'Failed to create location with payload',
            status: 'failed',
            stage: 'completion',
            meta: {
              location: location,
              isDryRun: dryRun,
            },
            errors: [err],
            request: req,
          });
          throw err;
        }
      })
      .get('/locations', async (req, res) => {
        try {
          await auditor.info({
            eventName: 'CatalogLocationFetch',
            message: 'Fetching locations with query parameters',
            status: 'unknown',
            stage: 'initiation',
            request: req,
          });

          const locations = await locationService.listLocations({
            credentials: await httpAuth.credentials(req),
          });

          await auditor.info({
            eventName: 'CatalogLocationFetch',
            message: 'Successfully fetched locations with query parameters',
            status: 'succeeded',
            stage: 'completion',
            request: req,
          });

          res.status(200).json(locations.map(l => ({ data: l })));
        } catch (err) {
          await auditor.error({
            eventName: 'CatalogLocationFetch',
            message: 'Failed to fetch locations with query parameters',
            status: 'failed',
            stage: 'completion',
            request: req,
            errors: [err],
          });
          throw err;
        }
      })

      .get('/locations/:id', async (req, res) => {
        const { id } = req.params;

        try {
          await auditor.info({
            eventName: 'CatalogLocationFetchById',
            message: 'Fetching location with id',
            status: 'unknown',
            stage: 'initiation',
            meta: {
              id: id,
            },
            request: req,
          });

          const output = await locationService.getLocation(id, {
            credentials: await httpAuth.credentials(req),
          });

          await auditor.info({
            eventName: 'CatalogLocationFetchById',
            message: 'Successfully fetched location with id',
            status: 'succeeded',
            stage: 'completion',
            meta: {
              id: id,
              output: output,
            },
            request: req,
          });

          res.status(200).json(output);
        } catch (err) {
          await auditor.error({
            eventName: 'CatalogLocationFetchById',
            message: 'Failed to fetch location with id',
            status: 'failed',
            stage: 'completion',
            meta: {
              id: id,
            },
            errors: [err],
            request: req,
          });
          throw err;
        }
      })
      .delete('/locations/:id', async (req, res) => {
        const { id } = req.params;

        try {
          await auditor.info({
            eventName: 'CatalogLocationDelete',
            message: 'Deleting location with id',
            status: 'unknown',
            stage: 'initiation',
            meta: {
              id: id,
            },
            request: req,
          });

          disallowReadonlyMode(readonlyEnabled);

          await locationService.deleteLocation(id, {
            credentials: await httpAuth.credentials(req),
          });

          await auditor.info({
            eventName: 'CatalogLocationDelete',
            message: 'Successfully deleted location with id',
            status: 'succeeded',
            stage: 'completion',
            meta: {
              id: id,
            },
            request: req,
          });

          res.status(204).end();
        } catch (err) {
          await auditor.error({
            eventName: 'CatalogLocationDelete',
            message: 'Failed to delete location with id',
            status: 'failed',
            stage: 'completion',
            meta: {
              id: id,
            },
            errors: [err],
            request: req,
          });
          throw err;
        }
      })
      .get('/locations/by-entity/:kind/:namespace/:name', async (req, res) => {
        const { kind, namespace, name } = req.params;
        const locationRef = `${kind}:${namespace}/${name}`;

        try {
          await auditor.info({
            eventName: 'CatalogLocationFetchByEntityRef',
            message: 'Fetching locations associated with entity with ref',
            status: 'unknown',
            stage: 'initiation',
            meta: {
              locationRef: locationRef,
            },
            request: req,
          });

          const output = await locationService.getLocationByEntity(
            { kind, namespace, name },
            { credentials: await httpAuth.credentials(req) },
          );

          await auditor.info({
            eventName: 'CatalogLocationFetchByEntityRef',
            message:
              'Successfully fetched locations associated with entity with ref',
            status: 'succeeded',
            stage: 'completion',
            meta: {
              locationRef: locationRef,
              output: output,
            },
            request: req,
          });

          res.status(200).json(output);
        } catch (err) {
          await auditor.error({
            eventName: 'CatalogLocationFetchByEntityRef',
            message:
              'Failed to fetch locations associated with entity with ref',
            status: 'failed',
            stage: 'completion',
            meta: {
              locationRef: locationRef,
            },
            errors: [err],
            request: req,
          });
          throw err;
        }
      });
  }

  if (locationAnalyzer) {
    router.post('/analyze-location', async (req, res) => {
      try {
        await auditor.info({
          eventName: 'CatalogLocationAnalyze',
          message: 'Analyzing location with payload',
          status: 'unknown',
          stage: 'initiation',
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

          await auditor.info({
            eventName: 'CatalogLocationAnalyze',
            message: 'Successfully analyzed location with payload',
            status: 'succeeded',
            stage: 'completion',
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
        await auditor.error({
          eventName: 'CatalogLocationAnalyze',
          message: 'Failed to analyze location with payload',
          status: 'failed',
          stage: 'completion',
          errors: [err],
          request: req,
        });
        throw err;
      }
    });
  }

  if (orchestrator) {
    router.post('/validate-entity', async (req, res) => {
      try {
        await auditor.info({
          eventName: 'CatalogEntityValidate',
          message: 'Validating entity with payload',
          status: 'unknown',
          stage: 'initiation',
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
          await auditor.error({
            eventName: 'CatalogEntityValidate',
            message: 'Failed to validate entity with payload',
            status: 'failed',
            stage: 'completion',
            errors: [err],
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

          await auditor.error({
            eventName: 'CatalogEntityValidate',
            message: 'Failed to validate entity with payload',
            status: 'failed',
            stage: 'completion',
            errors: errors,
            request: req,
          });

          res.status(400).json({
            errors,
          });
        }

        await auditor.info({
          eventName: 'CatalogEntityValidate',
          message: 'Successfully validated entity with payload',
          status: 'succeeded',
          stage: 'completion',
          request: req,
        });

        return res.status(200).end();
      } catch (err) {
        await auditor.error({
          eventName: 'CatalogEntityValidate',
          message: 'Failed to validate entity with payload',
          status: 'failed',
          stage: 'completion',
          errors: [err],
          request: req,
        });
        throw err;
      }
    });
  }

  router.use(errorHandler());
  return router;
}
