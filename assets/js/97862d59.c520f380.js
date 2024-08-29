/*! For license information please see 97862d59.c520f380.js.LICENSE.txt */
"use strict";(self.webpackChunkbackstage_microsite=self.webpackChunkbackstage_microsite||[]).push([[902020],{38689:(e,n,o)=>{o.r(n),o.d(n,{assets:()=>a,contentTitle:()=>r,default:()=>f,frontMatter:()=>s,metadata:()=>c,toc:()=>p});var i=o(785893),t=o(511151);const s={id:"plugin-notifications-node.notificationprocessor.processoptions",title:"NotificationProcessor.processOptions()",description:"API reference for NotificationProcessor.processOptions()"},r=void 0,c={id:"reference/plugin-notifications-node.notificationprocessor.processoptions",title:"NotificationProcessor.processOptions()",description:"API reference for NotificationProcessor.processOptions()",source:"@site/../docs/reference/plugin-notifications-node.notificationprocessor.processoptions.md",sourceDirName:"reference",slug:"/reference/plugin-notifications-node.notificationprocessor.processoptions",permalink:"/docs/reference/plugin-notifications-node.notificationprocessor.processoptions",draft:!1,unlisted:!1,editUrl:"https://github.com/backstage/backstage/edit/master/docs/../docs/reference/plugin-notifications-node.notificationprocessor.processoptions.md",tags:[],version:"current",frontMatter:{id:"plugin-notifications-node.notificationprocessor.processoptions",title:"NotificationProcessor.processOptions()",description:"API reference for NotificationProcessor.processOptions()"}},a={},p=[{value:"Parameters",id:"parameters",level:2}];function d(e){const n={a:"a",code:"code",h2:"h2",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,t.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"/docs/reference/",children:"Home"})," > ",(0,i.jsx)(n.a,{href:"/docs/reference/plugin-notifications-node",children:(0,i.jsx)(n.code,{children:"@backstage/plugin-notifications-node"})})," > ",(0,i.jsx)(n.a,{href:"/docs/reference/plugin-notifications-node.notificationprocessor",children:(0,i.jsx)(n.code,{children:"NotificationProcessor"})})," > ",(0,i.jsx)(n.a,{href:"/docs/reference/plugin-notifications-node.notificationprocessor.processoptions",children:(0,i.jsx)(n.code,{children:"processOptions"})})]}),"\n",(0,i.jsx)(n.p,{children:"Process the notification options."}),"\n",(0,i.jsx)(n.p,{children:"Can be used to override the default recipient resolving, sending the notification to an external service or modify other notification options necessary."}),"\n",(0,i.jsx)(n.p,{children:"processOptions functions are called only once for each notification before the recipient resolving, pre-process, sending and post-process of the notification."}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"Signature:"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",children:"processOptions?(options: NotificationSendOptions): Promise<NotificationSendOptions>;\n"})}),"\n",(0,i.jsx)(n.h2,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Parameter"}),(0,i.jsx)(n.th,{children:"Type"}),(0,i.jsx)(n.th,{children:"Description"})]})}),(0,i.jsx)(n.tbody,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:"options"}),(0,i.jsx)(n.td,{children:(0,i.jsx)(n.a,{href:"/docs/reference/plugin-notifications-node.notificationsendoptions",children:"NotificationSendOptions"})}),(0,i.jsx)(n.td,{children:"The original options to send the notification"})]})})]}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"Returns:"})}),"\n",(0,i.jsxs)(n.p,{children:["Promise<",(0,i.jsx)(n.a,{href:"/docs/reference/plugin-notifications-node.notificationsendoptions",children:"NotificationSendOptions"}),">"]})]})}function f(e={}){const{wrapper:n}={...(0,t.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(d,{...e})}):d(e)}},675251:(e,n,o)=>{var i=o(667294),t=Symbol.for("react.element"),s=Symbol.for("react.fragment"),r=Object.prototype.hasOwnProperty,c=i.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,a={key:!0,ref:!0,__self:!0,__source:!0};function p(e,n,o){var i,s={},p=null,d=null;for(i in void 0!==o&&(p=""+o),void 0!==n.key&&(p=""+n.key),void 0!==n.ref&&(d=n.ref),n)r.call(n,i)&&!a.hasOwnProperty(i)&&(s[i]=n[i]);if(e&&e.defaultProps)for(i in n=e.defaultProps)void 0===s[i]&&(s[i]=n[i]);return{$$typeof:t,type:e,key:p,ref:d,props:s,_owner:c.current}}n.Fragment=s,n.jsx=p,n.jsxs=p},785893:(e,n,o)=>{e.exports=o(675251)},511151:(e,n,o)=>{o.d(n,{Z:()=>c,a:()=>r});var i=o(667294);const t={},s=i.createContext(t);function r(e){const n=i.useContext(s);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:r(e.components),i.createElement(s.Provider,{value:n},e.children)}}}]);