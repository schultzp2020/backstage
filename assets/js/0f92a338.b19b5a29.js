/*! For license information please see 0f92a338.b19b5a29.js.LICENSE.txt */
"use strict";(self.webpackChunkbackstage_microsite=self.webpackChunkbackstage_microsite||[]).push([[547559],{702664:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>c,contentTitle:()=>a,default:()=>h,frontMatter:()=>o,metadata:()=>r,toc:()=>l});var t=i(785893),s=i(511151);const o={id:"new-backend-system",title:"New Backend System",description:"Details of the new backend system"},a=void 0,r={id:"plugins/new-backend-system",title:"New Backend System",description:"Details of the new backend system",source:"@site/../docs/plugins/new-backend-system.md",sourceDirName:"plugins",slug:"/plugins/new-backend-system",permalink:"/docs/plugins/new-backend-system",draft:!1,unlisted:!1,editUrl:"https://github.com/backstage/backstage/edit/master/docs/../docs/plugins/new-backend-system.md",tags:[],version:"current",frontMatter:{id:"new-backend-system",title:"New Backend System",description:"Details of the new backend system"}},c={},l=[{value:"Status",id:"status",level:2},{value:"Overview",id:"overview",level:2},{value:"Building Blocks",id:"building-blocks",level:2},{value:"Backend",id:"backend",level:3},{value:"Plugins",id:"plugins",level:3},{value:"Services",id:"services",level:3},{value:"Extension Points",id:"extension-points",level:3},{value:"Modules",id:"modules",level:3},{value:"Creating Plugins",id:"creating-plugins",level:2},{value:"Creating Modules",id:"creating-modules",level:2},{value:"Extension Points",id:"extension-points-1",level:3},{value:"Defining an Extension Point",id:"defining-an-extension-point",level:4},{value:"Registering an Extension Point",id:"registering-an-extension-point",level:4},{value:"Backend Services",id:"backend-services",level:2},{value:"Service References",id:"service-references",level:3},{value:"Defining a Service",id:"defining-a-service",level:4},{value:"Overriding Services",id:"overriding-services",level:3},{value:"Testing",id:"testing",level:2},{value:"Package structure",id:"package-structure",level:2}];function d(e){const n={a:"a",code:"code",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",ul:"ul",...(0,s.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.h2,{id:"status",children:"Status"}),"\n",(0,t.jsx)(n.p,{children:"The new backend system is released and ready for production use, and many plugins and modules have already been migrated. We recommend all plugins and deployments to migrate to the new system."}),"\n",(0,t.jsxs)(n.p,{children:["You can find an example backend setup in ",(0,t.jsx)(n.a,{href:"https://github.com/backstage/backstage/tree/master/packages/backend",children:"the backend package"}),"."]}),"\n",(0,t.jsx)(n.h2,{id:"overview",children:"Overview"}),"\n",(0,t.jsxs)(n.p,{children:["The new Backstage backend system was built to help make it simpler to install backend plugins and to keep projects up to date. It also changed the foundation to one that makes it a lot easier to evolve plugins and the system itself with minimal disruption or cause for breaking changes. You can read more about the reasoning in the ",(0,t.jsx)(n.a,{href:"https://github.com/backstage/backstage/issues/11611",children:"original RFC"}),"."]}),"\n",(0,t.jsx)(n.p,{children:"One of the goals of the new system was to reduce the code needed for setting up a Backstage backend and installing plugins. This is an example of how you create, add features, and start up your backend in the new system:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"import { createBackend } from '@backstage/backend-defaults';\n\n// Create your backend instance\nconst backend = createBackend();\n\n// Install all desired features\nbackend.add(import('@backstage/plugin-catalog-backend'));\n\n// Start up the backend\nbackend.start();\n"})}),"\n",(0,t.jsx)(n.p,{children:"One notable change that helped achieve this much slimmer backend setup is the introduction of a system for dependency injection, which is very similar to the one in the Backstage frontend."}),"\n",(0,t.jsx)(n.h2,{id:"building-blocks",children:"Building Blocks"}),"\n",(0,t.jsx)(n.p,{children:"This section introduces the high-level building blocks upon which this new system is built. These are all concepts that exist in our current system in one way or another, but they have all been lifted up to be first class concerns in the new system."}),"\n",(0,t.jsx)(n.h3,{id:"backend",children:"Backend"}),"\n",(0,t.jsx)(n.p,{children:"This is the backend instance itself, which you can think of as the unit of deployment. It does not have any functionality in and of itself, but is simply responsible for wiring things together."}),"\n",(0,t.jsx)(n.p,{children:"It is up to you to decide how many different backends you want to deploy. You can have all features in a single one, or split things out into multiple smaller deployments. All depending on your need to scale and isolate individual features."}),"\n",(0,t.jsx)(n.h3,{id:"plugins",children:"Plugins"}),"\n",(0,t.jsx)(n.p,{children:"Plugins provide the actual features, just like in our existing system. They operate completely independently of each other. If plugins want to communicate with each other, they must do so over the wire. There can be no direct communication between plugins through code. Because of this constraint, each plugin can be considered to be its own microservice."}),"\n",(0,t.jsx)(n.h3,{id:"services",children:"Services"}),"\n",(0,t.jsx)(n.p,{children:"Services provide utilities to help make it simpler to implement plugins, so that each plugin doesn't need to implement everything from scratch. There are both many built-in services, like the ones for logging, database access, and reading configuration, but you can also import third-party services, or create your own."}),"\n",(0,t.jsx)(n.p,{children:"Services are also a customization point for individual backend installations. You can both override services with your own implementations, as well as make smaller customizations to existing services."}),"\n",(0,t.jsx)(n.h3,{id:"extension-points",children:"Extension Points"}),"\n",(0,t.jsx)(n.p,{children:"Many plugins have ways in which you can extend them, for example entity providers for the Catalog, or custom actions for the Scaffolder. These extension patterns are now encoded into Extension Points."}),"\n",(0,t.jsx)(n.p,{children:"Extension Points look a little bit like services, since you depended on them just like you would a service. A key difference is that extension points are registered and provided by plugins themselves, based on what customizations each individual plugin wants to expose."}),"\n",(0,t.jsx)(n.p,{children:"Extension Points are also exported separately from the plugin instance itself, and a single plugin can also expose multiple different extension points at once. This makes it easier to evolve and deprecated individual Extension Points over time, rather than dealing with a single large API surface."}),"\n",(0,t.jsx)(n.h3,{id:"modules",children:"Modules"}),"\n",(0,t.jsx)(n.p,{children:"Modules use the plugin Extension Points to add new features for plugins. They might for example add an individual Catalog Entity Provider, or one or more Scaffolder Actions. Modules are basically plugins for plugins."}),"\n",(0,t.jsx)(n.p,{children:"Each module may only extend a single plugin, and the module must be deployed together with that plugin in the same backend instance. Modules may however only communicate with their plugin through its registered extension points."}),"\n",(0,t.jsx)(n.p,{children:"Just like plugins, modules also have access to services and can depend on their own service implementations. They will however share services with the plugin that they extend, there are no module-specific service implementations."}),"\n",(0,t.jsx)(n.h2,{id:"creating-plugins",children:"Creating Plugins"}),"\n",(0,t.jsxs)(n.p,{children:["Plugins are created using the ",(0,t.jsx)(n.code,{children:"createBackendPlugin"})," function. All plugins must have an ID and a register method. Plugins may also accept an options object, which can be either optional or required. The options are passed to the second parameter of the register method, and the options type is inferred and forwarded to the returned plugin factory function."]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"import {\n  configServiceRef,\n  coreServices,\n  createBackendPlugin,\n} from '@backstage/backend-plugin-api';\n\n// export type ExamplePluginOptions = { exampleOption: boolean };\nexport const examplePlugin = createBackendPlugin({\n  // unique id for the plugin\n  pluginId: 'example',\n  // It's possible to provide options to the plugin\n  // register(env, options: ExamplePluginOptions) {\n  register(env) {\n    env.registerInit({\n      deps: {\n        logger: coreServices.logger,\n      },\n      // logger is provided by the backend based on the dependency on loggerServiceRef above.\n      async init({ logger }) {\n        logger.info('Hello from example plugin');\n      },\n    });\n  },\n});\n"})}),"\n",(0,t.jsx)(n.p,{children:"The plugin can then be installed in the backend using the returned plugin factory function:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"backend.add(examplePlugin());\n"})}),"\n",(0,t.jsx)(n.p,{children:"If we wanted our plugin to accept options as well, we'd accept the options as the second parameter of the register method:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"export const examplePlugin = createBackendPlugin({\n  pluginId: 'example',\n  register(env, options?: { silent?: boolean }) {\n    env.registerInit({\n      deps: { logger: coreServices.logger },\n      async init({ logger }) {\n        if (!options?.silent) {\n          logger.info('Hello from example plugin');\n        }\n      },\n    });\n  },\n});\n"})}),"\n",(0,t.jsx)(n.p,{children:"Passing the option to the plugin during installation looks like this:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"backend.add(examplePlugin({ silent: true }));\n"})}),"\n",(0,t.jsx)(n.h2,{id:"creating-modules",children:"Creating Modules"}),"\n",(0,t.jsx)(n.p,{children:"Some facts about modules"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:["A Module is able to extend a plugin with additional functionality using the ",(0,t.jsx)(n.code,{children:"ExtensionPoint"}),"s registered by the plugin."]}),"\n",(0,t.jsxs)(n.li,{children:["A module can only extend one plugin but can interact with multiple ",(0,t.jsx)(n.code,{children:"ExtensionPoint"}),"s registered by that plugin."]}),"\n",(0,t.jsx)(n.li,{children:"A module is always initialized before the plugin it extends."}),"\n"]}),"\n",(0,t.jsxs)(n.p,{children:["A module depends on the ",(0,t.jsx)(n.code,{children:"ExtensionPoint"}),"s exported by the target plugin's library package, for example ",(0,t.jsx)(n.code,{children:"@backstage/plugin-catalog-node"}),", and does not directly declare a dependency on the plugin package itself."]}),"\n",(0,t.jsxs)(n.p,{children:["Here's an example on how to create a module that adds a new processor using the ",(0,t.jsx)(n.code,{children:"catalogProcessingExtensionPoint"}),":"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"import { createBackendModule } from '@backstage/backend-plugin-api';\nimport { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';\nimport { MyCustomProcessor } from './processor';\n\nexport const exampleCustomProcessorCatalogModule = createBackendModule({\n  pluginId: 'catalog',\n  moduleId: 'example-custom-processor',\n  register(env) {\n    env.registerInit({\n      deps: {\n        catalog: catalogProcessingExtensionPoint,\n      },\n      async init({ catalog }) {\n        catalog.addProcessor(new MyCustomProcessor());\n      },\n    });\n  },\n});\n"})}),"\n",(0,t.jsx)(n.h3,{id:"extension-points-1",children:"Extension Points"}),"\n",(0,t.jsxs)(n.p,{children:["Modules depend on extension points just as a regular dependency by specifying it in the ",(0,t.jsx)(n.code,{children:"deps"})," section."]}),"\n",(0,t.jsx)(n.h4,{id:"defining-an-extension-point",children:"Defining an Extension Point"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"import { createExtensionPoint } from '@backstage/backend-plugin-api';\n\nexport interface ScaffolderActionsExtensionPoint {\n  addAction(action: ScaffolderAction): void;\n}\n\nexport const scaffolderActionsExtensionPoint =\n  createExtensionPoint<ScaffolderActionsExtensionPoint>({\n    id: 'scaffolder.actions',\n  });\n"})}),"\n",(0,t.jsx)(n.h4,{id:"registering-an-extension-point",children:"Registering an Extension Point"}),"\n",(0,t.jsx)(n.p,{children:"Extension points are registered by a plugin and extended by modules."}),"\n",(0,t.jsx)(n.h2,{id:"backend-services",children:"Backend Services"}),"\n",(0,t.jsxs)(n.p,{children:["The default backend provides several ",(0,t.jsx)(n.a,{href:"https://github.com/backstage/backstage/blob/master/packages/backend-plugin-api/src/services/definitions/coreServices.ts",children:"core services"})," out of the box which includes access to configuration, logging, databases and more.\nService dependencies are declared using their ",(0,t.jsx)(n.code,{children:"ServiceRef"}),"s in the ",(0,t.jsx)(n.code,{children:"deps"})," section of the plugin or module, and the implementations are then forwarded to the ",(0,t.jsx)(n.code,{children:"init"})," method of the plugin or module."]}),"\n",(0,t.jsx)(n.h3,{id:"service-references",children:"Service References"}),"\n",(0,t.jsxs)(n.p,{children:["A ",(0,t.jsx)(n.code,{children:"ServiceRef"})," is a named reference to an interface which are later used to resolve the concrete service implementation. Conceptually this is very similar to ",(0,t.jsx)(n.code,{children:"ApiRef"}),"s in the frontend.\nServices is what provides common utilities that previously resided in the ",(0,t.jsx)(n.code,{children:"PluginEnvironment"})," such as Config, Logging and Database."]}),"\n",(0,t.jsxs)(n.p,{children:["On startup the backend will make sure that the services are initialized before being passed to the plugin/module that depend on them.\nServiceRefs contain a scope which is used to determine if the serviceFactory creating the service will create a new instance scoped per plugin/module or if it will be shared. ",(0,t.jsx)(n.code,{children:"plugin"})," scoped services will be created once per plugin/module and ",(0,t.jsx)(n.code,{children:"root"})," scoped services will be created once per backend instance."]}),"\n",(0,t.jsx)(n.h4,{id:"defining-a-service",children:"Defining a Service"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"import {\n  createServiceFactory,\n  coreServices,\n} from '@backstage/backend-plugin-api';\nimport { ExampleImpl } from './ExampleImpl';\n\nexport interface ExampleApi {\n  doSomething(): Promise<void>;\n}\n\nexport const exampleServiceRef = createServiceRef<ExampleApi>({\n  id: 'example',\n  scope: 'plugin', // can be 'root' or 'plugin'\n\n  // The defaultFactory is optional to implement but it will be used if no other factory is provided to the backend.\n  // This is allows for the backend to provide a default implementation of the service without having to wire it beforehand.\n  defaultFactory: async service =>\n    createServiceFactory({\n      service,\n      deps: {\n        logger: coreServices.logger,\n        plugin: coreServices.pluginMetadata,\n      },\n      // Logger is available directly in the factory as it's a root scoped service and will be created once per backend instance.\n      async factory({ logger, plugin }) {\n        // plugin is available as it's a plugin scoped service and will be created once per plugin.\n        return async ({ plugin }) => {\n          // This block will be executed once for every plugin that depends on this service\n          logger.info('Initializing example service plugin instance');\n          return new ExampleImpl({ logger, plugin });\n        };\n      },\n    }),\n});\n"})}),"\n",(0,t.jsx)(n.h3,{id:"overriding-services",children:"Overriding Services"}),"\n",(0,t.jsxs)(n.p,{children:["In this example we replace the default root logger service implementation with a custom one that streams logs to GCP. The ",(0,t.jsx)(n.code,{children:"rootLoggerServiceRef"})," has a ",(0,t.jsx)(n.code,{children:"'root'"})," scope, meaning there are no plugin-specific instances of this service."]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"import {\n  createServiceFactory,\n  rootLoggerServiceRef,\n  LoggerService,\n} from '@backstage/backend-plugin-api';\n\n// This custom implementation would typically live separately from\n// the backend setup code, either nearby such as in\n//   packages/backend/src/services/logger/GoogleCloudLogger.ts\n// Or you can let it live in its own library package.\nclass GoogleCloudLogger implements LoggerService {\n  static factory = createServiceFactory({\n    service: rootLoggerServiceRef,\n    deps: {},\n    async factory() {\n      return new GoogleCloudLogger();\n    },\n  });\n  // custom implementation here ...\n}\n\n// packages/backend/src/index.ts\nconst backend = createBackend();\n\n// supplies additional or replacement services to the backend\nbackend.add(GoogleCloudLogger.factory());\n"})}),"\n",(0,t.jsx)(n.h2,{id:"testing",children:"Testing"}),"\n",(0,t.jsxs)(n.p,{children:["Utilities for testing backend plugins and modules are available in ",(0,t.jsx)(n.code,{children:"@backstage/backend-test-utils"}),".\n",(0,t.jsx)(n.code,{children:"startTestBackend"})," returns the HTTP which can be used together with ",(0,t.jsx)(n.code,{children:"supertest"})," to test the plugin."]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"import { startTestBackend } from '@backstage/backend-test-utils';\nimport request from 'supertest';\n\ndescribe('My plugin tests', () => {\n  it('should return 200', async () => {\n    const { server } = await startTestBackend({\n      features: [myPlugin()],\n    });\n\n    const response = await request(server).get('/api/example/hello');\n    expect(response.status).toBe(200);\n  });\n});\n"})}),"\n",(0,t.jsx)(n.h2,{id:"package-structure",children:"Package structure"}),"\n",(0,t.jsxs)(n.p,{children:["A detailed explanation of the package architecture can be found in the ",(0,t.jsx)(n.a,{href:"/docs/overview/architecture-overview#package-architecture",children:"Backstage Architecture Overview"}),". The most important packages to consider for this system are ",(0,t.jsx)(n.code,{children:"backend"}),", ",(0,t.jsx)(n.code,{children:"plugin-<pluginId>-backend"}),", ",(0,t.jsx)(n.code,{children:"plugin-<pluginId>-node"}),", and ",(0,t.jsx)(n.code,{children:"plugin-<pluginId>-backend-module-<moduleId>"}),"."]}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"plugin-<pluginId>-backend"})," houses the implementation of the plugins themselves."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"plugin-<pluginId>-node"})," houses the extension points and any other utilities that modules or other plugins might need."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"plugin-<pluginId>-backend-module-<moduleId>"})," houses the modules that extend the plugins via the extension points."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"backend"})," is the backend itself that wires everything together to something that you can deploy."]}),"\n"]})]})}function h(e={}){const{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(d,{...e})}):d(e)}},675251:(e,n,i)=>{var t=i(667294),s=Symbol.for("react.element"),o=Symbol.for("react.fragment"),a=Object.prototype.hasOwnProperty,r=t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,c={key:!0,ref:!0,__self:!0,__source:!0};function l(e,n,i){var t,o={},l=null,d=null;for(t in void 0!==i&&(l=""+i),void 0!==n.key&&(l=""+n.key),void 0!==n.ref&&(d=n.ref),n)a.call(n,t)&&!c.hasOwnProperty(t)&&(o[t]=n[t]);if(e&&e.defaultProps)for(t in n=e.defaultProps)void 0===o[t]&&(o[t]=n[t]);return{$$typeof:s,type:e,key:l,ref:d,props:o,_owner:r.current}}n.Fragment=o,n.jsx=l,n.jsxs=l},785893:(e,n,i)=>{e.exports=i(675251)},511151:(e,n,i)=>{i.d(n,{Z:()=>r,a:()=>a});var t=i(667294);const s={},o=t.createContext(s);function a(e){const n=t.useContext(o);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:a(e.components),t.createElement(o.Provider,{value:n},e.children)}}}]);