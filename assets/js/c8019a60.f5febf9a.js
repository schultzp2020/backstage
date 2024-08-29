/*! For license information please see c8019a60.f5febf9a.js.LICENSE.txt */
"use strict";(self.webpackChunkbackstage_microsite=self.webpackChunkbackstage_microsite||[]).push([[50467],{726652:(e,o,r)=>{r.r(o),r.d(o,{assets:()=>a,contentTitle:()=>c,default:()=>d,frontMatter:()=>s,metadata:()=>i,toc:()=>g});var t=r(785893),n=r(511151);const s={id:"root-logger",title:"Root Logger Service",sidebar_label:"Root Logger",description:"Documentation for the Root Logger service"},c=void 0,i={id:"backend-system/core-services/root-logger",title:"Root Logger Service",description:"Documentation for the Root Logger service",source:"@site/../docs/backend-system/core-services/root-logger.md",sourceDirName:"backend-system/core-services",slug:"/backend-system/core-services/root-logger",permalink:"/docs/backend-system/core-services/root-logger",draft:!1,unlisted:!1,editUrl:"https://github.com/backstage/backstage/edit/master/docs/../docs/backend-system/core-services/root-logger.md",tags:[],version:"current",frontMatter:{id:"root-logger",title:"Root Logger Service",sidebar_label:"Root Logger",description:"Documentation for the Root Logger service"},sidebar:"docs",previous:{title:"Root Lifecycle",permalink:"/docs/backend-system/core-services/root-lifecycle"},next:{title:"Scheduler",permalink:"/docs/backend-system/core-services/scheduler"}},a={},g=[{value:"Root Logger",id:"root-logger",level:2},{value:"Configuring the service",id:"configuring-the-service",level:2}];function l(e){const o={code:"code",h2:"h2",p:"p",pre:"pre",...(0,n.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(o.h2,{id:"root-logger",children:"Root Logger"}),"\n",(0,t.jsx)(o.p,{children:"The root logger is the logger that is used by other root services. It's where the implementation lies for creating child loggers around the backstage ecosystem including child loggers for plugins with the correct metadata and annotations."}),"\n",(0,t.jsx)(o.p,{children:"If you want to override the implementation for logging across all of the backend, this is the service that you should override."}),"\n",(0,t.jsx)(o.h2,{id:"configuring-the-service",children:"Configuring the service"}),"\n",(0,t.jsx)(o.p,{children:"The following example is how you can override the root logger service to add additional metadata to all log lines."}),"\n",(0,t.jsx)(o.pre,{children:(0,t.jsx)(o.code,{className:"language-ts",children:"import { coreServices } from '@backstage/backend-plugin-api';\nimport { WinstonLogger } from '@backstage/backend-defaults/rootLogger';\nimport { createConfigSecretEnumerator } from '@backstage/backend-defaults/rootConfig';\n\nconst backend = createBackend();\n\nbackend.add(\n  createServiceFactory({\n    service: coreServices.rootLogger,\n    deps: {\n      config: coreServices.rootConfig,\n    },\n    async factory({ config }) {\n      const logger = WinstonLogger.create({\n        meta: {\n          service: 'backstage',\n          // here's some additional information that is not part of the\n          // original implementation\n          podName: 'myk8spod',\n        },\n        level: process.env.LOG_LEVEL || 'info',\n        format:\n          process.env.NODE_ENV === 'production'\n            ? format.json()\n            : WinstonLogger.colorFormat(),\n        transports: [new transports.Console()],\n      });\n\n      const secretEnumerator = await createConfigSecretEnumerator({\n        logger,\n      });\n      logger.addRedactions(secretEnumerator(config));\n      config.subscribe?.(() => logger.addRedactions(secretEnumerator(config)));\n\n      return logger;\n    },\n  }),\n);\n"})})]})}function d(e={}){const{wrapper:o}={...(0,n.a)(),...e.components};return o?(0,t.jsx)(o,{...e,children:(0,t.jsx)(l,{...e})}):l(e)}},675251:(e,o,r)=>{var t=r(667294),n=Symbol.for("react.element"),s=Symbol.for("react.fragment"),c=Object.prototype.hasOwnProperty,i=t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,a={key:!0,ref:!0,__self:!0,__source:!0};function g(e,o,r){var t,s={},g=null,l=null;for(t in void 0!==r&&(g=""+r),void 0!==o.key&&(g=""+o.key),void 0!==o.ref&&(l=o.ref),o)c.call(o,t)&&!a.hasOwnProperty(t)&&(s[t]=o[t]);if(e&&e.defaultProps)for(t in o=e.defaultProps)void 0===s[t]&&(s[t]=o[t]);return{$$typeof:n,type:e,key:g,ref:l,props:s,_owner:i.current}}o.Fragment=s,o.jsx=g,o.jsxs=g},785893:(e,o,r)=>{e.exports=r(675251)},511151:(e,o,r)=>{r.d(o,{Z:()=>i,a:()=>c});var t=r(667294);const n={},s=t.createContext(n);function c(e){const o=t.useContext(s);return t.useMemo((function(){return"function"==typeof e?e(o):{...o,...e}}),[o,e])}function i(e){let o;return o=e.disableParentContext?"function"==typeof e.components?e.components(n):e.components||n:c(e.components),t.createElement(s.Provider,{value:o},e.children)}}}]);