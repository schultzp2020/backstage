/*! For license information please see 3ce0646f.b1d78e90.js.LICENSE.txt */
"use strict";(self.webpackChunkbackstage_microsite=self.webpackChunkbackstage_microsite||[]).push([[531141],{918332:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>i,default:()=>u,frontMatter:()=>o,metadata:()=>p,toc:()=>d});var s=t(785893),r=t(511151);const o={id:"frontend-plugin-api.resolvedextensioninputs",title:"ResolvedExtensionInputs",description:"API reference for ResolvedExtensionInputs"},i=void 0,p={id:"reference/frontend-plugin-api.resolvedextensioninputs",title:"ResolvedExtensionInputs",description:"API reference for ResolvedExtensionInputs",source:"@site/../docs/reference/frontend-plugin-api.resolvedextensioninputs.md",sourceDirName:"reference",slug:"/reference/frontend-plugin-api.resolvedextensioninputs",permalink:"/docs/reference/frontend-plugin-api.resolvedextensioninputs",draft:!1,unlisted:!1,editUrl:"https://github.com/backstage/backstage/edit/master/docs/../docs/reference/frontend-plugin-api.resolvedextensioninputs.md",tags:[],version:"current",frontMatter:{id:"frontend-plugin-api.resolvedextensioninputs",title:"ResolvedExtensionInputs",description:"API reference for ResolvedExtensionInputs"}},c={},d=[];function a(e){const n={a:"a",code:"code",p:"p",pre:"pre",strong:"strong",...(0,r.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/docs/reference/",children:"Home"})," > ",(0,s.jsx)(n.a,{href:"/docs/reference/frontend-plugin-api",children:(0,s.jsx)(n.code,{children:"@backstage/frontend-plugin-api"})})," > ",(0,s.jsx)(n.a,{href:"/docs/reference/frontend-plugin-api.resolvedextensioninputs",children:(0,s.jsx)(n.code,{children:"ResolvedExtensionInputs"})})]}),"\n",(0,s.jsx)(n.p,{children:"Converts an extension input map into a matching collection of resolved inputs."}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Signature:"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"export type ResolvedExtensionInputs<TInputs extends {\n    [name in string]: ExtensionInput<any, any>;\n}> = {\n    [InputName in keyof TInputs]: false extends TInputs[InputName]['config']['singleton'] ? Array<Expand<ResolvedExtensionInput<TInputs[InputName]>>> : false extends TInputs[InputName]['config']['optional'] ? Expand<ResolvedExtensionInput<TInputs[InputName]>> : Expand<ResolvedExtensionInput<TInputs[InputName]> | undefined>;\n};\n"})}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"References:"})," ",(0,s.jsx)(n.a,{href:"/docs/reference/frontend-plugin-api.extensioninput",children:"ExtensionInput"}),", ",(0,s.jsx)(n.a,{href:"/docs/reference/frontend-plugin-api.resolvedextensioninput",children:"ResolvedExtensionInput"})]})]})}function u(e={}){const{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(a,{...e})}):a(e)}},675251:(e,n,t)=>{var s=t(667294),r=Symbol.for("react.element"),o=Symbol.for("react.fragment"),i=Object.prototype.hasOwnProperty,p=s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,c={key:!0,ref:!0,__self:!0,__source:!0};function d(e,n,t){var s,o={},d=null,a=null;for(s in void 0!==t&&(d=""+t),void 0!==n.key&&(d=""+n.key),void 0!==n.ref&&(a=n.ref),n)i.call(n,s)&&!c.hasOwnProperty(s)&&(o[s]=n[s]);if(e&&e.defaultProps)for(s in n=e.defaultProps)void 0===o[s]&&(o[s]=n[s]);return{$$typeof:r,type:e,key:d,ref:a,props:o,_owner:p.current}}n.Fragment=o,n.jsx=d,n.jsxs=d},785893:(e,n,t)=>{e.exports=t(675251)},511151:(e,n,t)=>{t.d(n,{Z:()=>p,a:()=>i});var s=t(667294);const r={},o=s.createContext(r);function i(e){const n=s.useContext(o);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function p(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:i(e.components),s.createElement(o.Provider,{value:n},e.children)}}}]);