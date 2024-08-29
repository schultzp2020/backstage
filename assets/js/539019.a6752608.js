"use strict";(self.webpackChunkbackstage_microsite=self.webpackChunkbackstage_microsite||[]).push([[539019],{712305:(e,t,n)=>{n.d(t,{Z:()=>g});var r=n(667294),l=n(490512),i=n(592210),o=n(171098);function c(){return r.createElement(i.Z,{id:"theme.contentVisibility.unlistedBanner.title",description:"The unlisted content banner title"},"Unlisted page")}function a(){return r.createElement(i.Z,{id:"theme.contentVisibility.unlistedBanner.message",description:"The unlisted content banner message"},"This page is unlisted. Search engines will not index it, and only users having a direct link can access it.")}function s(){return r.createElement(o.Z,null,r.createElement("meta",{name:"robots",content:"noindex, nofollow"}))}function u(){return r.createElement(i.Z,{id:"theme.contentVisibility.draftBanner.title",description:"The draft content banner title"},"Draft page")}function f(){return r.createElement(i.Z,{id:"theme.contentVisibility.draftBanner.message",description:"The draft content banner message"},"This page is a draft. It will only be visible in dev and be excluded from the production build.")}var m=n(565319),d=n(668398);function b({className:e}){return r.createElement(d.Z,{type:"caution",title:r.createElement(u,null),className:(0,l.Z)(e,m.k.common.draftBanner)},r.createElement(f,null))}function p({className:e}){return r.createElement(d.Z,{type:"caution",title:r.createElement(c,null),className:(0,l.Z)(e,m.k.common.unlistedBanner)},r.createElement(a,null))}function O(e){return r.createElement(r.Fragment,null,r.createElement(s,null),r.createElement(p,e))}function g({metadata:e}){const{unlisted:t,frontMatter:n}=e;return r.createElement(r.Fragment,null,(t||n.unlisted)&&r.createElement(O,null),n.draft&&r.createElement(b,null))}},148704:(e,t,n)=>{n.d(t,{Z:()=>m});var r=n(667294),l=n(490512),i=n(415574);const o={tableOfContents:"tableOfContents_bqdL",docItemContainer:"docItemContainer_F8PC"};function c(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){return t=null!=t?t:{},Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):function(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))})),e}function s(e,t){if(null==e)return{};var n,r,l=function(e,t){if(null==e)return{};var n,r,l={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(l[n]=e[n]);return l}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(l[n]=e[n])}return l}const u="table-of-contents__link toc-highlight",f="table-of-contents__link--active";function m(e){var{className:t}=e,n=s(e,["className"]);return r.createElement("div",{className:(0,l.Z)(o.tableOfContents,"thin-scrollbar",t)},r.createElement(i.Z,a(function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{},r=Object.keys(n);"function"==typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(n).filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable})))),r.forEach((function(t){c(e,t,n[t])}))}return e}({},n),{linkClassName:u,linkActiveClassName:f})))}},415574:(e,t,n)=>{n.d(t,{Z:()=>h});var r=n(667294),l=n(986016);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{},r=Object.keys(n);"function"==typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(n).filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable})))),r.forEach((function(t){i(e,t,n[t])}))}return e}function c(e,t){return t=null!=t?t:{},Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):function(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))})),e}function a(e,t){if(null==e)return{};var n,r,l=function(e,t){if(null==e)return{};var n,r,l={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(l[n]=e[n]);return l}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(l[n]=e[n])}return l}function s(e){const t=e.map((e=>c(o({},e),{parentIndex:-1,children:[]}))),n=Array(7).fill(-1);t.forEach(((e,t)=>{const r=n.slice(2,e.level);e.parentIndex=Math.max(...r),n[e.level]=t}));const r=[];return t.forEach((e=>{const{parentIndex:n}=e,l=a(e,["parentIndex"]);n>=0?t[n].children.push(l):r.push(l)})),r}function u({toc:e,minHeadingLevel:t,maxHeadingLevel:n}){return e.flatMap((e=>{const r=u({toc:e.children,minHeadingLevel:t,maxHeadingLevel:n});return function(e){return e.level>=t&&e.level<=n}(e)?[c(o({},e),{children:r})]:r}))}function f(e){const t=e.getBoundingClientRect();return t.top===t.bottom?f(e.parentNode):t}function m(e,{anchorTopOffset:t}){const n=e.find((e=>f(e).top>=t));if(n){return function(e){return e.top>0&&e.bottom<window.innerHeight/2}(f(n))?n:null!==(r=e[e.indexOf(n)-1])&&void 0!==r?r:null;var r}var l;return null!==(l=e[e.length-1])&&void 0!==l?l:null}function d(){const e=(0,r.useRef)(0),{navbar:{hideOnScroll:t}}=(0,l.L)();return(0,r.useEffect)((()=>{e.current=t?0:document.querySelector(".navbar").clientHeight}),[t]),e}function b(e){const t=(0,r.useRef)(void 0),n=d();(0,r.useEffect)((()=>{if(!e)return()=>{};const{linkClassName:r,linkActiveClassName:l,minHeadingLevel:i,maxHeadingLevel:o}=e;function c(){const e=function(e){return Array.from(document.getElementsByClassName(e))}(r),c=function({minHeadingLevel:e,maxHeadingLevel:t}){const n=[];for(let r=e;r<=t;r+=1)n.push(`h${r}.anchor`);return Array.from(document.querySelectorAll(n.join()))}({minHeadingLevel:i,maxHeadingLevel:o}),a=m(c,{anchorTopOffset:n.current}),s=e.find((e=>a&&a.id===function(e){return decodeURIComponent(e.href.substring(e.href.indexOf("#")+1))}(e)));e.forEach((e=>{!function(e,n){n?(t.current&&t.current!==e&&t.current.classList.remove(l),e.classList.add(l),t.current=e):e.classList.remove(l)}(e,e===s)}))}return document.addEventListener("scroll",c),document.addEventListener("resize",c),c(),()=>{document.removeEventListener("scroll",c),document.removeEventListener("resize",c)}}),[e,n])}var p=n(377657);function O({toc:e,className:t,linkClassName:n,isChild:l}){return e.length?r.createElement("ul",{className:l?void 0:t},e.map((e=>r.createElement("li",{key:e.id},r.createElement(p.Z,{to:`#${e.id}`,className:null!=n?n:void 0,dangerouslySetInnerHTML:{__html:e.value}}),r.createElement(O,{isChild:!0,toc:e.children,className:t,linkClassName:n}))))):null}const g=r.memo(O);function v(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function y(e,t){if(null==e)return{};var n,r,l=function(e,t){if(null==e)return{};var n,r,l={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(l[n]=e[n]);return l}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(l[n]=e[n])}return l}function h(e){var{toc:t,className:n="table-of-contents table-of-contents__left-border",linkClassName:i="table-of-contents__link",linkActiveClassName:o,minHeadingLevel:c,maxHeadingLevel:a}=e,f=y(e,["toc","className","linkClassName","linkActiveClassName","minHeadingLevel","maxHeadingLevel"]);const m=(0,l.L)(),d=null!=c?c:m.tableOfContents.minHeadingLevel,p=null!=a?a:m.tableOfContents.maxHeadingLevel,O=function({toc:e,minHeadingLevel:t,maxHeadingLevel:n}){return(0,r.useMemo)((()=>u({toc:s(e),minHeadingLevel:t,maxHeadingLevel:n})),[e,t,n])}({toc:t,minHeadingLevel:d,maxHeadingLevel:p});return b((0,r.useMemo)((()=>{if(i&&o)return{linkClassName:i,linkActiveClassName:o,minHeadingLevel:d,maxHeadingLevel:p}}),[i,o,d,p])),r.createElement(g,function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{},r=Object.keys(n);"function"==typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(n).filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable})))),r.forEach((function(t){v(e,t,n[t])}))}return e}({toc:O,className:n,linkClassName:i},f))}}}]);