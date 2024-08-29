/*! For license information please see 5b3e98b5.4a2e9e51.js.LICENSE.txt */
"use strict";(self.webpackChunkbackstage_microsite=self.webpackChunkbackstage_microsite||[]).push([[180221],{379044:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>i,contentTitle:()=>s,default:()=>f,frontMatter:()=>o,metadata:()=>a,toc:()=>d});var n=t(785893),c=t(511151);const o={id:"plugin-scaffolder-backend-module-sentry.createsentrycreateprojectaction",title:"createSentryCreateProjectAction()",description:"API reference for createSentryCreateProjectAction()"},s=void 0,a={id:"reference/plugin-scaffolder-backend-module-sentry.createsentrycreateprojectaction",title:"createSentryCreateProjectAction()",description:"API reference for createSentryCreateProjectAction()",source:"@site/../docs/reference/plugin-scaffolder-backend-module-sentry.createsentrycreateprojectaction.md",sourceDirName:"reference",slug:"/reference/plugin-scaffolder-backend-module-sentry.createsentrycreateprojectaction",permalink:"/docs/reference/plugin-scaffolder-backend-module-sentry.createsentrycreateprojectaction",draft:!1,unlisted:!1,editUrl:"https://github.com/backstage/backstage/edit/master/docs/../docs/reference/plugin-scaffolder-backend-module-sentry.createsentrycreateprojectaction.md",tags:[],version:"current",frontMatter:{id:"plugin-scaffolder-backend-module-sentry.createsentrycreateprojectaction",title:"createSentryCreateProjectAction()",description:"API reference for createSentryCreateProjectAction()"}},i={},d=[{value:"Parameters",id:"parameters",level:2},{value:"Remarks",id:"remarks",level:2}];function l(e){const r={a:"a",code:"code",h2:"h2",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,c.a)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.a,{href:"/docs/reference/",children:"Home"})," > ",(0,n.jsx)(r.a,{href:"/docs/reference/plugin-scaffolder-backend-module-sentry",children:(0,n.jsx)(r.code,{children:"@backstage/plugin-scaffolder-backend-module-sentry"})})," > ",(0,n.jsx)(r.a,{href:"/docs/reference/plugin-scaffolder-backend-module-sentry.createsentrycreateprojectaction",children:(0,n.jsx)(r.code,{children:"createSentryCreateProjectAction"})})]}),"\n",(0,n.jsxs)(r.p,{children:["Creates the ",(0,n.jsx)(r.code,{children:"sentry:project:create"})," Scaffolder action."]}),"\n",(0,n.jsx)(r.p,{children:(0,n.jsx)(r.strong,{children:"Signature:"})}),"\n",(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-typescript",children:'function createSentryCreateProjectAction(options: {\n    config: Config;\n}): import("@backstage/plugin-scaffolder-node").TemplateAction<{\n    organizationSlug: string;\n    teamSlug: string;\n    name: string;\n    slug?: string | undefined;\n    authToken?: string | undefined;\n}, import("@backstage/types").JsonObject>;\n'})}),"\n",(0,n.jsx)(r.h2,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:"Parameter"}),(0,n.jsx)(r.th,{children:"Type"}),(0,n.jsx)(r.th,{children:"Description"})]})}),(0,n.jsx)(r.tbody,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"options"}),(0,n.jsxs)(r.td,{children:["{ config: ",(0,n.jsx)(r.a,{href:"/docs/reference/config.config",children:"Config"}),"; }"]}),(0,n.jsx)(r.td,{children:"Configuration of the Sentry API."})]})})]}),"\n",(0,n.jsx)(r.p,{children:(0,n.jsx)(r.strong,{children:"Returns:"})}),"\n",(0,n.jsxs)(r.p,{children:['import("@backstage/plugin-scaffolder-node").',(0,n.jsx)(r.a,{href:"/docs/reference/plugin-scaffolder-node.templateaction",children:"TemplateAction"}),'<{ organizationSlug: string; teamSlug: string; name: string; slug?: string | undefined; authToken?: string | undefined; }, import("@backstage/types").',(0,n.jsx)(r.a,{href:"/docs/reference/types.jsonobject",children:"JsonObject"}),">"]}),"\n",(0,n.jsx)(r.h2,{id:"remarks",children:"Remarks"}),"\n",(0,n.jsxs)(r.p,{children:["See ",(0,n.jsx)(r.a,{href:"https://backstage.io/docs/features/software-templates/writing-custom-actions",children:"https://backstage.io/docs/features/software-templates/writing-custom-actions"}),"."]})]})}function f(e={}){const{wrapper:r}={...(0,c.a)(),...e.components};return r?(0,n.jsx)(r,{...e,children:(0,n.jsx)(l,{...e})}):l(e)}},675251:(e,r,t)=>{var n=t(667294),c=Symbol.for("react.element"),o=Symbol.for("react.fragment"),s=Object.prototype.hasOwnProperty,a=n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,i={key:!0,ref:!0,__self:!0,__source:!0};function d(e,r,t){var n,o={},d=null,l=null;for(n in void 0!==t&&(d=""+t),void 0!==r.key&&(d=""+r.key),void 0!==r.ref&&(l=r.ref),r)s.call(r,n)&&!i.hasOwnProperty(n)&&(o[n]=r[n]);if(e&&e.defaultProps)for(n in r=e.defaultProps)void 0===o[n]&&(o[n]=r[n]);return{$$typeof:c,type:e,key:d,ref:l,props:o,_owner:a.current}}r.Fragment=o,r.jsx=d,r.jsxs=d},785893:(e,r,t)=>{e.exports=t(675251)},511151:(e,r,t)=>{t.d(r,{Z:()=>a,a:()=>s});var n=t(667294);const c={},o=n.createContext(c);function s(e){const r=n.useContext(o);return n.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function a(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(c):e.components||c:s(e.components),n.createElement(o.Provider,{value:r},e.children)}}}]);