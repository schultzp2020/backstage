/*! For license information please see c3b0fdc9.8a5b79bf.js.LICENSE.txt */
"use strict";(self.webpackChunkbackstage_microsite=self.webpackChunkbackstage_microsite||[]).push([[30084],{130918:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>a,contentTitle:()=>i,default:()=>f,frontMatter:()=>c,metadata:()=>s,toc:()=>u});var n=t(824246),o=t(511151);const c={id:"core-app-api.fetchmiddlewares.resolvepluginprotocol",title:"FetchMiddlewares.resolvePluginProtocol()",description:"API reference for FetchMiddlewares.resolvePluginProtocol()"},i=void 0,s={id:"reference/core-app-api.fetchmiddlewares.resolvepluginprotocol",title:"FetchMiddlewares.resolvePluginProtocol()",description:"API reference for FetchMiddlewares.resolvePluginProtocol()",source:"@site/../docs/reference/core-app-api.fetchmiddlewares.resolvepluginprotocol.md",sourceDirName:"reference",slug:"/reference/core-app-api.fetchmiddlewares.resolvepluginprotocol",permalink:"/docs/reference/core-app-api.fetchmiddlewares.resolvepluginprotocol",draft:!1,unlisted:!1,editUrl:"https://github.com/backstage/backstage/edit/master/docs/../docs/reference/core-app-api.fetchmiddlewares.resolvepluginprotocol.md",tags:[],version:"current",frontMatter:{id:"core-app-api.fetchmiddlewares.resolvepluginprotocol",title:"FetchMiddlewares.resolvePluginProtocol()",description:"API reference for FetchMiddlewares.resolvePluginProtocol()"}},a={},u=[{value:"Parameters",id:"parameters",level:2},{value:"Remarks",id:"remarks",level:2}];function l(e){const r={a:"a",code:"code",h2:"h2",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,o.a)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.a,{href:"/docs/reference/",children:"Home"})," > ",(0,n.jsx)(r.a,{href:"/docs/reference/core-app-api",children:(0,n.jsx)(r.code,{children:"@backstage/core-app-api"})})," > ",(0,n.jsx)(r.a,{href:"/docs/reference/core-app-api.fetchmiddlewares",children:(0,n.jsx)(r.code,{children:"FetchMiddlewares"})})," > ",(0,n.jsx)(r.a,{href:"/docs/reference/core-app-api.fetchmiddlewares.resolvepluginprotocol",children:(0,n.jsx)(r.code,{children:"resolvePluginProtocol"})})]}),"\n",(0,n.jsxs)(r.p,{children:["Handles translation from ",(0,n.jsx)(r.code,{children:"plugin://"})," URLs to concrete http(s) URLs based on the discovery API."]}),"\n",(0,n.jsx)(r.p,{children:(0,n.jsx)(r.strong,{children:"Signature:"})}),"\n",(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-typescript",children:"static resolvePluginProtocol(options: {\n        discoveryApi: DiscoveryApi;\n    }): FetchMiddleware;\n"})}),"\n",(0,n.jsx)(r.h2,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:"Parameter"}),(0,n.jsx)(r.th,{children:"Type"}),(0,n.jsx)(r.th,{children:"Description"})]})}),(0,n.jsx)(r.tbody,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"options"}),(0,n.jsxs)(r.td,{children:["{ discoveryApi: ",(0,n.jsx)(r.a,{href:"/docs/reference/core-plugin-api.discoveryapi",children:"DiscoveryApi"}),"; }"]}),(0,n.jsx)(r.td,{})]})})]}),"\n",(0,n.jsx)(r.p,{children:(0,n.jsx)(r.strong,{children:"Returns:"})}),"\n",(0,n.jsx)(r.p,{children:(0,n.jsx)(r.a,{href:"/docs/reference/core-app-api.fetchmiddleware",children:"FetchMiddleware"})}),"\n",(0,n.jsx)(r.h2,{id:"remarks",children:"Remarks"}),"\n",(0,n.jsxs)(r.p,{children:["If the request is for ",(0,n.jsx)(r.code,{children:"plugin://catalog/entities?filter=x=y"}),", the discovery API will be queried for ",(0,n.jsx)(r.code,{children:"'catalog'"}),". If it returned ",(0,n.jsx)(r.code,{children:"https://backstage.example.net/api/catalog"}),", the resulting query would be ",(0,n.jsx)(r.code,{children:"https://backstage.example.net/api/catalog/entities?filter=x=y"}),"."]}),"\n",(0,n.jsxs)(r.p,{children:["If the incoming URL protocol was not ",(0,n.jsx)(r.code,{children:"plugin"}),", the request is just passed through verbatim to the underlying implementation."]})]})}function f(e={}){const{wrapper:r}={...(0,o.a)(),...e.components};return r?(0,n.jsx)(r,{...e,children:(0,n.jsx)(l,{...e})}):l(e)}},371426:(e,r,t)=>{var n=t(827378),o=Symbol.for("react.element"),c=Symbol.for("react.fragment"),i=Object.prototype.hasOwnProperty,s=n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,a={key:!0,ref:!0,__self:!0,__source:!0};function u(e,r,t){var n,c={},u=null,l=null;for(n in void 0!==t&&(u=""+t),void 0!==r.key&&(u=""+r.key),void 0!==r.ref&&(l=r.ref),r)i.call(r,n)&&!a.hasOwnProperty(n)&&(c[n]=r[n]);if(e&&e.defaultProps)for(n in r=e.defaultProps)void 0===c[n]&&(c[n]=r[n]);return{$$typeof:o,type:e,key:u,ref:l,props:c,_owner:s.current}}r.Fragment=c,r.jsx=u,r.jsxs=u},541535:(e,r)=>{var t=Symbol.for("react.element"),n=Symbol.for("react.portal"),o=Symbol.for("react.fragment"),c=Symbol.for("react.strict_mode"),i=Symbol.for("react.profiler"),s=Symbol.for("react.provider"),a=Symbol.for("react.context"),u=Symbol.for("react.forward_ref"),l=Symbol.for("react.suspense"),f=Symbol.for("react.memo"),p=Symbol.for("react.lazy"),d=Symbol.iterator;var h={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},y=Object.assign,m={};function v(e,r,t){this.props=e,this.context=r,this.refs=m,this.updater=t||h}function _(){}function b(e,r,t){this.props=e,this.context=r,this.refs=m,this.updater=t||h}v.prototype.isReactComponent={},v.prototype.setState=function(e,r){if("object"!=typeof e&&"function"!=typeof e&&null!=e)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,r,"setState")},v.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")},_.prototype=v.prototype;var g=b.prototype=new _;g.constructor=b,y(g,v.prototype),g.isPureReactComponent=!0;var x=Array.isArray,j=Object.prototype.hasOwnProperty,w={current:null},P={key:!0,ref:!0,__self:!0,__source:!0};function k(e,r,n){var o,c={},i=null,s=null;if(null!=r)for(o in void 0!==r.ref&&(s=r.ref),void 0!==r.key&&(i=""+r.key),r)j.call(r,o)&&!P.hasOwnProperty(o)&&(c[o]=r[o]);var a=arguments.length-2;if(1===a)c.children=n;else if(1<a){for(var u=Array(a),l=0;l<a;l++)u[l]=arguments[l+2];c.children=u}if(e&&e.defaultProps)for(o in a=e.defaultProps)void 0===c[o]&&(c[o]=a[o]);return{$$typeof:t,type:e,key:i,ref:s,props:c,_owner:w.current}}function S(e){return"object"==typeof e&&null!==e&&e.$$typeof===t}var R=/\/+/g;function E(e,r){return"object"==typeof e&&null!==e&&null!=e.key?function(e){var r={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,(function(e){return r[e]}))}(""+e.key):r.toString(36)}function C(e,r,o,c,i){var s=typeof e;"undefined"!==s&&"boolean"!==s||(e=null);var a=!1;if(null===e)a=!0;else switch(s){case"string":case"number":a=!0;break;case"object":switch(e.$$typeof){case t:case n:a=!0}}if(a)return i=i(a=e),e=""===c?"."+E(a,0):c,x(i)?(o="",null!=e&&(o=e.replace(R,"$&/")+"/"),C(i,r,o,"",(function(e){return e}))):null!=i&&(S(i)&&(i=function(e,r){return{$$typeof:t,type:e.type,key:r,ref:e.ref,props:e.props,_owner:e._owner}}(i,o+(!i.key||a&&a.key===i.key?"":(""+i.key).replace(R,"$&/")+"/")+e)),r.push(i)),1;if(a=0,c=""===c?".":c+":",x(e))for(var u=0;u<e.length;u++){var l=c+E(s=e[u],u);a+=C(s,r,o,l,i)}else if(l=function(e){return null===e||"object"!=typeof e?null:"function"==typeof(e=d&&e[d]||e["@@iterator"])?e:null}(e),"function"==typeof l)for(e=l.call(e),u=0;!(s=e.next()).done;)a+=C(s=s.value,r,o,l=c+E(s,u++),i);else if("object"===s)throw r=String(e),Error("Objects are not valid as a React child (found: "+("[object Object]"===r?"object with keys {"+Object.keys(e).join(", ")+"}":r)+"). If you meant to render a collection of children, use an array instead.");return a}function $(e,r,t){if(null==e)return e;var n=[],o=0;return C(e,n,"","",(function(e){return r.call(t,e,o++)})),n}function I(e){if(-1===e._status){var r=e._result;(r=r()).then((function(r){0!==e._status&&-1!==e._status||(e._status=1,e._result=r)}),(function(r){0!==e._status&&-1!==e._status||(e._status=2,e._result=r)})),-1===e._status&&(e._status=0,e._result=r)}if(1===e._status)return e._result.default;throw e._result}var O={current:null},F={transition:null},A={ReactCurrentDispatcher:O,ReactCurrentBatchConfig:F,ReactCurrentOwner:w};r.Children={map:$,forEach:function(e,r,t){$(e,(function(){r.apply(this,arguments)}),t)},count:function(e){var r=0;return $(e,(function(){r++})),r},toArray:function(e){return $(e,(function(e){return e}))||[]},only:function(e){if(!S(e))throw Error("React.Children.only expected to receive a single React element child.");return e}},r.Component=v,r.Fragment=o,r.Profiler=i,r.PureComponent=b,r.StrictMode=c,r.Suspense=l,r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=A,r.cloneElement=function(e,r,n){if(null==e)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var o=y({},e.props),c=e.key,i=e.ref,s=e._owner;if(null!=r){if(void 0!==r.ref&&(i=r.ref,s=w.current),void 0!==r.key&&(c=""+r.key),e.type&&e.type.defaultProps)var a=e.type.defaultProps;for(u in r)j.call(r,u)&&!P.hasOwnProperty(u)&&(o[u]=void 0===r[u]&&void 0!==a?a[u]:r[u])}var u=arguments.length-2;if(1===u)o.children=n;else if(1<u){a=Array(u);for(var l=0;l<u;l++)a[l]=arguments[l+2];o.children=a}return{$$typeof:t,type:e.type,key:c,ref:i,props:o,_owner:s}},r.createContext=function(e){return(e={$$typeof:a,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null}).Provider={$$typeof:s,_context:e},e.Consumer=e},r.createElement=k,r.createFactory=function(e){var r=k.bind(null,e);return r.type=e,r},r.createRef=function(){return{current:null}},r.forwardRef=function(e){return{$$typeof:u,render:e}},r.isValidElement=S,r.lazy=function(e){return{$$typeof:p,_payload:{_status:-1,_result:e},_init:I}},r.memo=function(e,r){return{$$typeof:f,type:e,compare:void 0===r?null:r}},r.startTransition=function(e){var r=F.transition;F.transition={};try{e()}finally{F.transition=r}},r.unstable_act=function(){throw Error("act(...) is not supported in production builds of React.")},r.useCallback=function(e,r){return O.current.useCallback(e,r)},r.useContext=function(e){return O.current.useContext(e)},r.useDebugValue=function(){},r.useDeferredValue=function(e){return O.current.useDeferredValue(e)},r.useEffect=function(e,r){return O.current.useEffect(e,r)},r.useId=function(){return O.current.useId()},r.useImperativeHandle=function(e,r,t){return O.current.useImperativeHandle(e,r,t)},r.useInsertionEffect=function(e,r){return O.current.useInsertionEffect(e,r)},r.useLayoutEffect=function(e,r){return O.current.useLayoutEffect(e,r)},r.useMemo=function(e,r){return O.current.useMemo(e,r)},r.useReducer=function(e,r,t){return O.current.useReducer(e,r,t)},r.useRef=function(e){return O.current.useRef(e)},r.useState=function(e){return O.current.useState(e)},r.useSyncExternalStore=function(e,r,t){return O.current.useSyncExternalStore(e,r,t)},r.useTransition=function(){return O.current.useTransition()},r.version="18.2.0"},827378:(e,r,t)=>{e.exports=t(541535)},824246:(e,r,t)=>{e.exports=t(371426)},511151:(e,r,t)=>{t.d(r,{Z:()=>s,a:()=>i});var n=t(667294);const o={},c=n.createContext(o);function i(e){const r=n.useContext(c);return n.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function s(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:i(e.components),n.createElement(c.Provider,{value:r},e.children)}}}]);