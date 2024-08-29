/*! For license information please see 841aea1d.fa2c653f.js.LICENSE.txt */
"use strict";(self.webpackChunkbackstage_microsite=self.webpackChunkbackstage_microsite||[]).push([[366048],{205896:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>c,contentTitle:()=>a,default:()=>h,frontMatter:()=>s,metadata:()=>d,toc:()=>l});var n=t(785893),i=t(511151);const s={id:"integration.defaultgithubcredentialsprovider.getcredentials",title:"DefaultGithubCredentialsProvider.getCredentials()",description:"API reference for DefaultGithubCredentialsProvider.getCredentials()"},a=void 0,d={id:"reference/integration.defaultgithubcredentialsprovider.getcredentials",title:"DefaultGithubCredentialsProvider.getCredentials()",description:"API reference for DefaultGithubCredentialsProvider.getCredentials()",source:"@site/../docs/reference/integration.defaultgithubcredentialsprovider.getcredentials.md",sourceDirName:"reference",slug:"/reference/integration.defaultgithubcredentialsprovider.getcredentials",permalink:"/docs/reference/integration.defaultgithubcredentialsprovider.getcredentials",draft:!1,unlisted:!1,editUrl:"https://github.com/backstage/backstage/edit/master/docs/../docs/reference/integration.defaultgithubcredentialsprovider.getcredentials.md",tags:[],version:"current",frontMatter:{id:"integration.defaultgithubcredentialsprovider.getcredentials",title:"DefaultGithubCredentialsProvider.getCredentials()",description:"API reference for DefaultGithubCredentialsProvider.getCredentials()"}},c={},l=[{value:"Parameters",id:"parameters",level:2},{value:"Remarks",id:"remarks",level:2},{value:"Example",id:"example",level:2}];function o(e){const r={a:"a",code:"code",h2:"h2",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,i.a)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.a,{href:"/docs/reference/",children:"Home"})," > ",(0,n.jsx)(r.a,{href:"/docs/reference/integration",children:(0,n.jsx)(r.code,{children:"@backstage/integration"})})," > ",(0,n.jsx)(r.a,{href:"/docs/reference/integration.defaultgithubcredentialsprovider",children:(0,n.jsx)(r.code,{children:"DefaultGithubCredentialsProvider"})})," > ",(0,n.jsx)(r.a,{href:"/docs/reference/integration.defaultgithubcredentialsprovider.getcredentials",children:(0,n.jsx)(r.code,{children:"getCredentials"})})]}),"\n",(0,n.jsxs)(r.p,{children:["Returns ",(0,n.jsx)(r.a,{href:"/docs/reference/integration.githubcredentials",children:"GithubCredentials"})," for a given URL."]}),"\n",(0,n.jsx)(r.p,{children:(0,n.jsx)(r.strong,{children:"Signature:"})}),"\n",(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-typescript",children:"getCredentials(opts: {\n        url: string;\n    }): Promise<GithubCredentials>;\n"})}),"\n",(0,n.jsx)(r.h2,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:"Parameter"}),(0,n.jsx)(r.th,{children:"Type"}),(0,n.jsx)(r.th,{children:"Description"})]})}),(0,n.jsx)(r.tbody,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"opts"}),(0,n.jsx)(r.td,{children:"{ url: string; }"}),(0,n.jsx)(r.td,{children:"The organization or repository URL"})]})})]}),"\n",(0,n.jsx)(r.p,{children:(0,n.jsx)(r.strong,{children:"Returns:"})}),"\n",(0,n.jsxs)(r.p,{children:["Promise<",(0,n.jsx)(r.a,{href:"/docs/reference/integration.githubcredentials",children:"GithubCredentials"}),">"]}),"\n",(0,n.jsxs)(r.p,{children:["A promise of ",(0,n.jsx)(r.a,{href:"/docs/reference/integration.githubcredentials",children:"GithubCredentials"}),"."]}),"\n",(0,n.jsx)(r.h2,{id:"remarks",children:"Remarks"}),"\n",(0,n.jsx)(r.p,{children:"Consecutive calls to this method with the same URL will return cached credentials."}),"\n",(0,n.jsx)(r.p,{children:"The shortest lifetime for a token returned is 10 minutes."}),"\n",(0,n.jsx)(r.h2,{id:"example",children:"Example"}),"\n",(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-ts",children:"const { token, headers } = await getCredentials({\n  url: 'https://github.com/backstage/foobar'\n})\n\nconst { token, headers } = await getCredentials({\n  url: 'https://github.com/backstage'\n})\n"})})]})}function h(e={}){const{wrapper:r}={...(0,i.a)(),...e.components};return r?(0,n.jsx)(r,{...e,children:(0,n.jsx)(o,{...e})}):o(e)}},675251:(e,r,t)=>{var n=t(667294),i=Symbol.for("react.element"),s=Symbol.for("react.fragment"),a=Object.prototype.hasOwnProperty,d=n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,c={key:!0,ref:!0,__self:!0,__source:!0};function l(e,r,t){var n,s={},l=null,o=null;for(n in void 0!==t&&(l=""+t),void 0!==r.key&&(l=""+r.key),void 0!==r.ref&&(o=r.ref),r)a.call(r,n)&&!c.hasOwnProperty(n)&&(s[n]=r[n]);if(e&&e.defaultProps)for(n in r=e.defaultProps)void 0===s[n]&&(s[n]=r[n]);return{$$typeof:i,type:e,key:l,ref:o,props:s,_owner:d.current}}r.Fragment=s,r.jsx=l,r.jsxs=l},785893:(e,r,t)=>{e.exports=t(675251)},511151:(e,r,t)=>{t.d(r,{Z:()=>d,a:()=>a});var n=t(667294);const i={},s=n.createContext(i);function a(e){const r=n.useContext(s);return n.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function d(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:a(e.components),n.createElement(s.Provider,{value:r},e.children)}}}]);