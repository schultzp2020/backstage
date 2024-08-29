/*! For license information please see 7d796f4f.113a13ee.js.LICENSE.txt */
"use strict";(self.webpackChunkbackstage_microsite=self.webpackChunkbackstage_microsite||[]).push([[120820],{671054:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>l,contentTitle:()=>r,default:()=>u,frontMatter:()=>n,metadata:()=>i,toc:()=>c});var s=a(785893),o=a(511151);const n={title:"Starting Phase 2: The Service Catalog",author:"Stefan \xc5lund, Spotify",authorURL:"http://twitter.com/stalund",authorImageURL:"https://pbs.twimg.com/profile_images/121166861/6919c047c0d0edaace78c3009b28e917-user-full-200-130.generated_400x400.jpg"},r=void 0,i={permalink:"/blog/2020/05/22/phase-2-service-catalog",source:"@site/blog/2020-05-22-phase-2-service-catalog.mdx",title:"Starting Phase 2: The Service Catalog",description:"TL;DR Thanks to the help from the Backstage community, we\u2019ve made excellent progress and are now moving into Phase 2 of Backstage \u2014 building out a Service Catalog and the surrounding systems that will help unify the tools you use to manage your software.",date:"2020-05-22T00:00:00.000Z",tags:[],readingTime:3.625,hasTruncateMarker:!0,authors:[{name:"Stefan \xc5lund, Spotify",url:"http://twitter.com/stalund",imageURL:"https://pbs.twimg.com/profile_images/121166861/6919c047c0d0edaace78c3009b28e917-user-full-200-130.generated_400x400.jpg",key:null,page:null}],frontMatter:{title:"Starting Phase 2: The Service Catalog",author:"Stefan \xc5lund, Spotify",authorURL:"http://twitter.com/stalund",authorImageURL:"https://pbs.twimg.com/profile_images/121166861/6919c047c0d0edaace78c3009b28e917-user-full-200-130.generated_400x400.jpg"},unlisted:!1,prevItem:{title:"Backstage Service Catalog released in alpha",permalink:"/blog/2020/06/22/backstage-service-catalog-alpha"},nextItem:{title:"Introducing Tech Radar for Backstage",permalink:"/blog/2020/05/14/tech-radar-plugin"}},l={authorsImageUrls:[void 0]},c=[{value:"Progress so far",id:"progress-so-far",level:2},{value:"So what is Phase 2?",id:"so-what-is-phase-2",level:2},{value:"Timeline",id:"timeline",level:2},{value:"Long-term vision",id:"long-term-vision",level:2}];function h(e){const t={a:"a",blockquote:"blockquote",em:"em",h2:"h2",img:"img",p:"p",strong:"strong",...(0,o.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(t.p,{children:[(0,s.jsx)(t.strong,{children:"TL;DR"})," Thanks to the help from the Backstage community, we\u2019ve made excellent progress and are now moving into Phase 2 of Backstage \u2014 building out a Service Catalog and the surrounding systems that will help unify the tools you use to manage your software."]}),"\n",(0,s.jsxs)(t.p,{children:["We released the open source version of Backstage a little less than two months ago, and have been thrilled to see so many people jumping in and contributing to the project in its early stages. We\u2019re excited to see what the community can build together as we progress through ",(0,s.jsx)(t.a,{href:"https://github.com/backstage/backstage#project-roadmap",children:"each phase of Backstage"}),"."]}),"\n",(0,s.jsx)(t.p,{children:(0,s.jsx)(t.img,{alt:"img",src:a(490670).Z+"",width:"1440",height:"900"})}),"\n","\n",(0,s.jsx)(t.h2,{id:"progress-so-far",children:"Progress so far"}),"\n",(0,s.jsxs)(t.p,{children:["Phase 1 was all about building an extensible frontend platform, enabling teams to start creating a single, consistent UI layer for your internal infrastructure and tools in the form of ",(0,s.jsx)(t.a,{href:"https://github.com/backstage/backstage/labels/plugin",children:"plugins"}),". In fact, thanks to our amazing (30+) ",(0,s.jsx)(t.a,{href:"https://github.com/backstage/backstage/graphs/contributors",children:"contributors"}),", we were able to complete most of Phase 1 earlier than expected. \ud83c\udf89"]}),"\n",(0,s.jsx)(t.p,{children:"Today, we are happy to announce that we are shifting our focus to Phase 2!"}),"\n",(0,s.jsx)(t.h2,{id:"so-what-is-phase-2",children:"So what is Phase 2?"}),"\n",(0,s.jsxs)(t.blockquote,{children:["\n",(0,s.jsx)(t.p,{children:(0,s.jsx)(t.em,{children:'The core of building Platforms rests in versatile entity management. Entities represent the nouns or the "truths" of our world.'})}),"\n"]}),"\n",(0,s.jsxs)(t.p,{children:["Quote from ",(0,s.jsx)(t.a,{href:"https://www.kislayverma.com/post/platform-nuts-bolts-extendable-data-models",children:"Platform Nuts & Bolts: Extendable Data Models"})]}),"\n",(0,s.jsx)(t.p,{children:"Entities, or what we refer to as \u201ccomponents\u201d in Backstage, represent all software, including services, websites, libraries, data pipelines, and so forth. The focus of Phase 2 will be on adding an entity model in Backstage that makes it easy for engineers to create and manage the software components they own."}),"\n",(0,s.jsxs)(t.p,{children:["With the ability to create a plethora of components in Backstage, how does one keep track of all the software in the ecosystem? Therein lies the highlight feature of Phase 2: the ",(0,s.jsx)(t.a,{href:"https://github.com/backstage/backstage/milestone/4",children:"Service Catalog"}),". The service catalog \u2014 or software catalog \u2014 is a centralized system that keeps track of ownership and metadata about all software in your ecosystem. The catalog is built around the concept of ",(0,s.jsx)(t.a,{href:"/docs/architecture-decisions/adrs-adr002",children:"metadata yaml files"})," stored together with the code, which are then harvested and visualized in Backstage."]}),"\n",(0,s.jsx)(t.p,{children:(0,s.jsx)(t.img,{alt:"img",src:a(490670).Z+"",width:"1440",height:"900"})}),"\n",(0,s.jsx)(t.p,{children:(0,s.jsx)(t.img,{alt:"img",src:a(344817).Z+"",width:"1440",height:"900"})}),"\n",(0,s.jsx)(t.p,{children:"With a single catalog, Backstage makes it easy for a team to manage ten services \u2014 and makes it possible for your company to manage thousands of them. Because the system is practically self-organizing, it requires hardly any oversight from a governing or centralized team. Developers can get a uniform overview of all their software and related resources (such as server utilisation, data pipelines, pull request status), regardless of how and where they are running, as well as an easy way to onboard and manage those resources."}),"\n",(0,s.jsx)(t.p,{children:"On top of that, we have found that the service catalog is a great way to organise the infrastructure tools you use to manage the software as well. This is how Backstage creates one developer portal for all your tools. Rather than asking teams to jump between different infrastructure UI\u2019s (and incurring additional cognitive overhead each time they make a context switch), most of these tools can be organised around the entities in the catalog:"}),"\n",(0,s.jsx)(t.p,{children:(0,s.jsx)(t.img,{alt:"img",src:a(219367).Z+"",width:"959",height:"276"})}),"\n",(0,s.jsxs)(t.p,{children:["More concretely, having this structure in place will allow plugins such as ",(0,s.jsx)(t.a,{href:"https://github.com/backstage/backstage/tree/master/plugins/circleci",children:"CircleCI"})," to show only the builds for the specific service you are viewing, or a ",(0,s.jsx)(t.a,{href:"https://github.com/backstage/backstage/issues/631",children:"Spinnaker"})," plugin to show running deployments, or an Open API plugin to ",(0,s.jsx)(t.a,{href:"https://github.com/backstage/backstage/issues/627",children:"show documentation"})," for endpoints exposed by the service, or the ",(0,s.jsx)(t.a,{href:"https://github.com/backstage/community-plugins/tree/main/workspaces/lighthouse/plugins/lighthouse",children:"Lighthouse"})," plugin to show audit reports for your website. You get the point."]}),"\n",(0,s.jsx)(t.h2,{id:"timeline",children:"Timeline"}),"\n",(0,s.jsx)(t.p,{children:"Our estimated timeline has us delivering these pieces in increments leading up to June 22. But with the support of the community we wouldn\u2019t be surprised if things land earlier than that. \ud83d\ude4f"}),"\n",(0,s.jsxs)(t.p,{children:["If you are interested in joining us, check out our ",(0,s.jsx)(t.a,{href:"https://github.com/backstage/backstage/milestones",children:"Milestones"})," and connected Issues."]}),"\n",(0,s.jsx)(t.h2,{id:"long-term-vision",children:"Long-term vision"}),"\n",(0,s.jsx)(t.p,{children:"Our vision for Backstage is for it to become the trusted, standard toolbox (read: UX layer) for the open source infrastructure landscape. Imagine a future where regardless of what infrastructure you use inside your company, there is an open source plugin available that you can pick up and add to your deployment of Backstage."}),"\n",(0,s.jsxs)(t.p,{children:["Spotify will continue to release more of our ",(0,s.jsx)(t.a,{href:"https://backstage.io/blog/2020/04/06/lighthouse-plugin",children:"internal"})," ",(0,s.jsx)(t.a,{href:"https://backstage.io/blog/2020/05/14/tech-radar-plugin",children:"plugins"}),", but participation from developers and companies can help us build a healthy community. We are excited to see how Backstage has helped many of you, and look forward to seeing all the new plugins you and your teams will build!"]})]})}function u(e={}){const{wrapper:t}={...(0,o.a)(),...e.components};return t?(0,s.jsx)(t,{...e,children:(0,s.jsx)(h,{...e})}):h(e)}},675251:(e,t,a)=>{var s=a(667294),o=Symbol.for("react.element"),n=Symbol.for("react.fragment"),r=Object.prototype.hasOwnProperty,i=s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,l={key:!0,ref:!0,__self:!0,__source:!0};function c(e,t,a){var s,n={},c=null,h=null;for(s in void 0!==a&&(c=""+a),void 0!==t.key&&(c=""+t.key),void 0!==t.ref&&(h=t.ref),t)r.call(t,s)&&!l.hasOwnProperty(s)&&(n[s]=t[s]);if(e&&e.defaultProps)for(s in t=e.defaultProps)void 0===n[s]&&(n[s]=t[s]);return{$$typeof:o,type:e,key:c,ref:h,props:n,_owner:i.current}}t.Fragment=n,t.jsx=c,t.jsxs=c},785893:(e,t,a)=>{e.exports=a(675251)},490670:(e,t,a)=>{a.d(t,{Z:()=>s});const s=a.p+"assets/images/Service_Catalog_MVP-80a59399ceab0bda37ef936166a77d60.png"},344817:(e,t,a)=>{a.d(t,{Z:()=>s});const s=a.p+"assets/images/Service_Catalog_MVP_service-57fed869455677e818de9a8d4757e401.png"},219367:(e,t,a)=>{a.d(t,{Z:()=>s});const s=a.p+"assets/images/tabs-abfdf72185d3ceb1d92c4237f7f78809.png"},511151:(e,t,a)=>{a.d(t,{Z:()=>i,a:()=>r});var s=a(667294);const o={},n=s.createContext(o);function r(e){const t=s.useContext(n);return s.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function i(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:r(e.components),s.createElement(n.Provider,{value:t},e.children)}}}]);