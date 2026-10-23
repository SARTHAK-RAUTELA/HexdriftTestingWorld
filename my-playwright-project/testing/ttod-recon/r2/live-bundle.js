
(function() {
  !function(){"use strict";function e(){return window&&window.performance&&window.performance.mark&&window.performance.measure&&window.performance.getEntriesByName}function t(...e){return window.performance.getEntriesByName(...e)}function n(...e){return window.performance.mark(...e)}function i(...e){return window.performance.measure(...e)}function r(){return window.performance.now()}var o={t:e,i:t,o:n,u:i,l:r};let s={};function a(e){return s[e]}function c(e,t){Object.assign(s,{[e]:t})}function u(){s={}}var d={get:a,set:c,reset:u};const l=(e,t)=>{for(var n in e)e.hasOwnProperty(n)&&t(e[n],n)},h=e=>"function"==typeof e,f=e=>!!e&&"object"==typeof e,_=e=>"string"==typeof e,p=e=>void 0===e,g=e=>Array.isArray(e);let w=0;const m=()=>w++;function v(e){let t=document.createElement("a");return t.href=e,t}function b(e){return new Function("return "+e)()}var y={h:e=>{var t=document.createElement("script");t.type="text/javascript",t.src=e;var n=document.querySelector("head");n.insertBefore(t,n.firstChild)},_:e=>{var t=document.createElement("link");t.href=e,t.as="script",t.rel="preload";var n=document.querySelector("head");n.insertBefore(t,n.firstChild)},p:e=>Array.prototype.slice.call(e.querySelectorAll("*")),g:b,m:h,k:f,A:_,I:g,O:p,C:l,T:()=>{w=0},D:m};function E(){O("debug",[].slice.call(arguments))}function k(){O("info",[].slice.call(arguments))}function A(){O("warn",[].slice.call(arguments))}function I(){O("error",[].slice.call(arguments))}const O=(e,t)=>{var n,i=console;switch(e){case"debug":n=i.debug;break;case"warn":n=i.warn;break;case"error":n=i.error;break;default:n=i.log,e="info"}n.apply(console,T(t))};function C(){if(!o.t())return null;let e=d.get("timeOrigin");if(!y.O(e))return e;const t=o.i("edge-begin")[0],n=t?t.startTime:null;return d.set("timeOrigin",n),n}function T(e){const t=C();if(!t)return[`Optly-μ / ${e[0]}`].concat(e.slice(1));return[`${("     "+Math.round(o.l()-t)).slice(-6)}| Optly-μ / ${e[0]}`].concat(e.slice(1))}var D={S:E,P:I,j:k,R:A};function S(e){window.optimizely.push({type:"clientMetadata",clientName:"edge",clientVersion:"v1_46_0_v1_46_0",forceVariationIds:e.forceVariationIds})}const P=e=>{var t=window.optimizely.push.bind(window.optimizely);e.errorData&&t({type:"microsnippetError",engine:"microsnippet",errorData:e.errorData}),e.logLevel&&t({type:"log",level:e.logLevel}),e.visitorId&&t({type:"user",visitorId:e.visitorId,IP:e.visitorIp,location:e.location,queryParams:e.queryParams,url:e.targetPageURL}),e.priorRedirectCookie&&t({type:"priorRedirectString",value:e.priorRedirectCookie}),e.decisions&&e.decisions.forEach((e=>{t({type:"event",eventType:"decision",eventData:{layerId:e.layerId,isLayerConcluded:e.isLayerConcluded||!1,isLayerHoldback:e.isLayerHoldback||!1,experimentId:e.experimentId,variationId:e.variationId}})})),e.activeViews&&e.activeViews.forEach((e=>{t({type:"event",eventType:"pageview",eventData:{id:e.id,apiName:e.apiName}})})),e.viewStates&&0!==Object.keys(e.viewStates).length&&t({type:"initialViewStates",states:e.viewStates})};function j(e){window.optimizely.push({type:"event",eventType:"click",eventData:{id:e.id,apiName:e.apiName,eventFilter:{selector:e.selector}}})}var R={N:S,M:P};function N(e,{message:t,err:n=null,args:i=[]},r=!0){let o=t,s=[o].concat(i);if(n&&(s=s.concat(n)),D.P.apply(this,s),r&&!d.get("disableTracking")){const e={errorData:{code:o,metadata:{},msVersion:d.get("msVersion"),requestId:d.get("requestId"),projectId:d.get("projectId")}};n&&(e.errorData.metadata.err=n),i.length&&(e.errorData.args=i),R.M(e)}}var M={$:{L:1e3,U:10},F:{V:"after",W:"append",G:"before",q:"prepend"},B:{H:"afterbegin",J:"afterend",X:"beforebegin",K:"beforeend"},Y:"optly_change_",Z:{attributes:!0,childList:!0,subtree:!0,characterData:!0},ee:{te:"class",ne:"href",ie:"html",re:"src",oe:"style",se:"text",ae:"remove",ce:"hide"}};const x="Observe Selector",$=document;let L,U;const F=()=>{L={},U=new MutationObserver((function(){this.disconnect(),Object.keys(L).forEach(W),this.observe($,M.Z)}))},z=()=>{U.observe($,M.Z)},V=(e,t)=>{U||F();const n=m();return L[n]={selector:e,callback:t},setTimeout(W.bind(null,n),0),z(),()=>{delete L[n],0===Object.keys(L).length&&U.disconnect()}},W=e=>{let t;try{if(t=L[e],!t||!t.selector)return void delete L[e];let n=[];n=document.querySelectorAll(t.selector),Array.prototype.forEach.call(n,(n=>{n.optimizelyEdgeObserveSelectorIds&&n.optimizelyEdgeObserveSelectorIds[e]||(n.optimizelyEdgeObserveSelectorIds=n.optimizelyEdgeObserveSelectorIds||{},n.optimizelyEdgeObserveSelectorIds[e]=!0,t.callback(n))}))}catch(n){N(x,{err:n,message:"3.0: Error using selector:",args:[t.selector]}),delete L[e]}};var G={ue:()=>{U&&(L=null,U.disconnect(),U=null)},de:F,le:V};const q=20,B=e=>new Promise((function(t){V(e,t)}));const H={utils:{observeSelector:V,waitUntil:e=>new Promise((function(t){if(e())return void t();const n=setInterval((function(){e()&&(clearInterval(n),t())}),q)})),waitForElement:B},state:{getActiveExperiments:()=>{let e,t;return window.optimizely.get?(e=window.optimizely.get("state").getExperimentStates({isActive:!0}),e=Object.keys(e).filter((t=>!e[t].isInExperimentHoldback)).map((t=>e[t])),t=e=>({id:e.id,name:e.experimentName,variation:{id:e.variation.id,name:e.variation.name}})):(e=d.get("data").decisions.filter((e=>e.variationId)),t=e=>({id:e.experimentId,name:e.experimentName,variation:{id:e.variationId,name:e.variationName}})),e.reduce(((e,n)=>{const i=t(n);return e[i.id]=i,e}),{})},getActivePages:()=>{let e;return window.optimizely.get?(e=window.optimizely.get("state").getPageStates({isActive:!0}),e=Object.keys(e).map((t=>e[t]))):e=d.get("data").activeViews,e.reduce(((e,t)=>(e[t.id]={id:t.id,apiName:t.apiName},e)),{})},getRedirectInfo:()=>d.get("data").redirectInfo||null}};function J(e){if(e in H)return H[e]}function X(e){window.optimizely.push(e)}var K={he:()=>{window.optimizely&&(D.R("DEPRECATION: window.optimizely is defined, but it ought not be used on pages running Performance Edge. window.optimizelyEdge is the object hosting the Performance Edge API; any push API calls should be made to it instead."),d.set("unsafeTrackingGlobalPushUsed",!0)),window.optimizely instanceof Array||(window.optimizely=[]),window.optimizelyEdge instanceof Array&&(window.optimizely=window.optimizely.concat(window.optimizelyEdge)),window.optimizelyEdge={get:J,push:X,fe:!0}}};const Y="Widget Change Applier";function Z(e,t){this._e={},Object.assign(this._e,e),Object.assign(this._e,t)}Z.prototype.pe=function(){try{this._e.showFn({data:this._e})}catch(e){N(Y,{message:"1.4: Apply WidgetChange Error",err:e})}},Z.prototype.ge=function(){try{this._e.hideFn({data:this._e})}catch(e){N(Y,{message:"1.4: Undo WidgetChange Error",err:e},!1)}};const Q="Plugin Manager";var ee=new(function(){var e=null,t={};function n(){return e||(e=this),e}return n.prototype.registerWidget=function(e){t[e.widgetId]=e},n.prototype.getPluginInfo=function(e){return t[e]},n.prototype.getPlugins=function(){const e=[];for(var n in t)e.push(t[n]);return e},n.prototype.clearPlugins=function(){t={}},n.prototype.newWidgetChange=function(e){var t=null;if(e&&e.widget_id){const n=this.getPluginInfo(e.widget_id);n?t=new Z(e,n):N(Q,{message:`1.4: Requested widget is not in PluginManager: ${e.widget_id}`})}else N(Q,{message:`1.4: New Widget Change requested with no change.widget_id defined: ${e}`});return t},n}());const te="ProjectJS";var ne={pe:e=>{try{h(e)?e():N(te,{message:"2.0: ProjectJS is not a function"})}catch(t){N(te,{message:"2.1: Error executing ProjectJS:",err:t},!1)}}};function ie(){let e,t,n=new Promise((function(n,i){e=n,t=i}));return n.resolve=function(){return e.apply(null,Array.from(arguments)),n},n.reject=function(){return t.apply(null,Array.from(arguments)),n},n}const re="optimizelyChangeData";function oe(e,t){return e[re]&&e[re][t]?e[re][t]:null}function se(e,t){e[re]&&delete e[re][t]}function ae(e,t,n){if("object"!=typeof n)throw new Error("setData expects an object");e[re]||(e[re]={}),e[re][t]=n}var ce={we:oe,me:se,ve:ae};function ue(){return window.location.hostname}function de(e,t){return window.setTimeout((function(){try{e()}catch(t){D.R("Deferred function threw error:",t)}}),t)}var le={be:ue,ye:de};function he(e){this.Ee=e,this.ke=0,this.Ae={},this.Ie=!1}he.prototype.Oe=function(){this.Ie||(this.Ie=!0,this.Ce(),le.ye((()=>{this.Ie=!1}),0))},he.prototype.Ce=function(){this.ke+=1;const e=this.Ae[String(this.ke)];e&&e.forEach((e=>{e()})),le.ye((()=>{this.Te()}),this.Ee)},he.prototype.Te=function(){this.ke-=1,this.ke<0&&(D.R("Decremented down to negative count: ",this.ke),this.ke=0)},he.prototype.De=function(e,t){this.Ae[e]||(this.Ae[e]=[]),this.Ae[e].push(t)};const fe="Append Change Applier";function _e(e){this._e=e,this.Se=new he(M.$.L),this.Se.De(M.$.U,(()=>{D.R(`${fe} / Change has overheated and will no longer apply or reapply`,this),this.Pe()}))}function pe(e){const t=document.createElement("div");return t.innerHTML=e,t.childNodes.length}function ge(e,t,n){let i=e;const r=[];for(let o=0;o<t;o++)n?(r.push(i.nextSibling),i=i.nextSibling):(r.push(i.previousSibling),i=i.previousSibling);return r}function we(e){let t=e.parentNode;for(;t.nodeType!==Node.ELEMENT_NODE;)t=t.parentNode;return t}function me(e,t,n){const i=ce.we(n,e)||[];Array.prototype.forEach.call(i,(e=>{e.parentNode.removeChild(e)})),n.removeAttribute(t),ce.me(n,e),y.p(n).forEach((e=>{e.removeAttribute(t)}))}_e.prototype.pe=function(){return this.je=ie(),this.Re=y.D(),this.Ne=G.le(this._e.selector,this.Me.bind(this,this._e,this.Re)),this.je},_e.prototype.Me=function(e,t,n){const i=M.Y+t;n.hasAttribute(i)||(this.Se.Oe(),this.xe(e,t,n,i)),this.je.resolve()},_e.prototype.xe=function(e,t,n,i){let r;switch(e.operator){case M.F.V:r=M.B.J;break;case M.F.W:r=M.B.K;break;case M.F.G:r=M.B.X;break;case M.F.q:r=M.B.H;break;default:r=M.B.K}n.insertAdjacentHTML(r,e.value);const o=pe(e.value)-1;let s,a;r===M.B.K?(s=n.lastChild,a=ge(s,o,!1)):r===M.B.H?(s=n.firstChild,a=ge(s,o,!0)):r===M.B.X?(s=n.previousSibling,a=ge(s,o,!1)):r===M.B.J&&(s=n.nextSibling,a=ge(s,o,!0)),a.unshift(s),Array.prototype.forEach.call(a,(e=>{const n=e.nodeType===Node.ELEMENT_NODE?e:we(e);n.setAttribute(i,"");const r=ce.we(n,t)||[];r.push(e),ce.ve(n,t,r),y.p(n).forEach((e=>{e.setAttribute(i,"")}))}))},_e.prototype.Pe=function(){this.Ne&&this.Ne()},_e.prototype.ge=function(){const e=M.Y+this.Re,t=document.querySelectorAll("["+e+"]");Array.prototype.forEach.call(t,me.bind(null,this.Re,e))};const ve=(e,t)=>{if(0===Object.keys(t.css))return t.attributes.style;var n="",i=t.attributes&&t.attributes.style||"";return l(t.css,((e,t)=>{new RegExp(t+"\\s?:").test(i)||(n+=t+":"+e+";")})),p(t.attributes.style)?(e||"")+n:n+i};var be={$e:e=>new MutationObserver(e),Le:(e,t)=>{e.observe(t,M.Z)}};const ye="Attribute Change Applier";function Ee(e){this._e=e,this.Ue=[],this.Se=new he(M.$.L),this.Se.De(M.$.U,(()=>{D.R(`${ye} / Change has overheated and will no longer apply or reapply`,this),this.Pe()})),this.Fe=!1}function ke(e,t){const n=ce.we(t,e);n&&y.C(n,(function(e,n){switch(n){case M.ee.te:t.className=e;break;case M.ee.ne:t.href=e;break;case M.ee.ie:t.innerHTML=e;break;case M.ee.re:t.src=e;break;case M.ee.oe:t.style.cssText=e;break;case M.ee.se:t.textContent=e;break;default:throw new Error("Unrecognized attribute: "+n)}})),t.removeAttribute(M.Y+e),ce.me(t,e)}Ee.prototype.pe=function(){this.Re=y.D(),this.je=ie();const e=this.Me.bind(this,this._e,this.Re);this.Ne=G.le(this._e.selector,e);const t=document.querySelectorAll(this._e.selector);return t?Array.prototype.forEach.call(t,e):this.je.resolve(`${ye} / AttributeChange not being applied. Element does not exist in DOM`),this.je},Ee.prototype.Me=function(e,t,n){const i=M.Y+t;if(n.hasAttribute(i))return void this.je.resolve();this.Se.Oe();const r=this.xe.bind(this,n,e,t,i);if(r(),d.get("dynamicWebsiteSupport")){const e=()=>{le.ye((()=>{this.Fe||be.Le(t,n)}))},t=be.$e((()=>{this.Se.Oe(),t.disconnect(),r(),e()}));e(),this.Ue.push(t.disconnect.bind(t))}this.je.resolve()},Ee.prototype.xe=function(e,t,n,i){const r={};y.C(t.attributes,((t,n)=>{switch(n){case M.ee.te:y.O(e.className)||(r[M.ee.te]=e.className,e.className=t);break;case M.ee.ne:y.O(e.href)||(r[M.ee.ne]=e.href,e.href=t);break;case M.ee.ie:y.O(e.innerHTML)||(r[M.ee.ie]=e.innerHTML,e.innerHTML=t,y.p(e).forEach((e=>{e.setAttribute(i,"")})));break;case M.ee.re:y.O(e.src)||(r[M.ee.re]=e.src,e.src=t);break;case M.ee.oe:break;case M.ee.se:y.O(e.textContent)||(r[M.ee.se]=e.textContent,e.textContent=t);break;default:N(ye,{message:"1.1: Unrecognized attribute:",args:[n]})}}));const o=ve(e.style.cssText,t);y.A(o)&&(r[M.ee.oe]=e.style.cssText,e.style.cssText=o),e.setAttribute(i,""),ce.ve(e,n,r)},Ee.prototype.Pe=function(){this.Ne&&this.Ne(),this.Ue.forEach((e=>{try{e()}catch(t){}})),this.Fe=!0},Ee.prototype.ge=function(){const e=document.querySelectorAll("["+M.Y+this.Re+"]");Array.prototype.forEach.call(e,ke.bind(null,this.Re))};const Ae="Custom Code Change Applier";function Ie(e){this._e=e}function Oe(e){this._e=e}function Ce(e,t){const n=ce.we(t,e),i=n.element.parentNode.removeChild(n.element),r=n.undoElement,o=r.parentNode;let s;switch(n.undoType){case M.F.V:o.insertBefore(i,r.nextSibling);break;case M.F.q:s=r.firstChild,r.insertBefore(i,s)}t.removeAttribute(M.Y+e),ce.me(t,e)}function Te(e){if(!e)return null;const t=document.createElement("a");return t.href=e,t}Ie.prototype.pe=function(){try{this._e.value()}catch(e){N(Ae,{message:"1.2: Apply Custom JS Error",err:e},!1)}},Oe.prototype.pe=function(){this.Re=y.D(),Promise.all([new Promise((e=>{this.Ne=G.le(this._e.selector,e)})),new Promise((e=>{this.ze=G.le(this._e.insertSelector,e)}))]).then(this.Me.bind(this,this._e))},Oe.prototype.Me=function(e){const t=document.querySelectorAll(e.selector);Array.prototype.forEach.call(t,(t=>{const n={undoElement:t.previousSibling,undoType:M.F.V};t.parentNode.firstChild===t&&(n.undoElement=t.parentNode,n.undoType=M.F.q);const i=t.parentNode.removeChild(t),r=document.querySelector(e.insertSelector),o=r.parentNode;let s;switch(n.element=i,e.operator){case M.F.G:o.insertBefore(i,r);break;case M.F.V:o.insertBefore(i,r.nextSibling);break;case M.F.q:s=r.firstChild,r.insertBefore(i,s);break;case M.F.W:r.appendChild(i)}i.setAttribute(M.Y+this.Re,""),ce.ve(i,this.Re,n)}))},Oe.prototype.Pe=function(){this.Ne&&this.Ne(),this.ze&&this.ze()},Oe.prototype.ge=function(){const e=document.querySelectorAll("["+M.Y+this.Re+"]");Array.prototype.forEach.call(e,Ce.bind(null,this.Re))};const De="Redirect Change Applier";function Se(e){this._e=e}Se.prototype.pe=function(){const e=this._e;h(e.dest)&&(e.dest=e.dest()),_(e.dest)?(document.cookie=e.cookie.replace(/(^|&)t=(&|$)/,`$1t=${Date.now()}$2`).replace(/(^|&)r=(&|$)/,`$1r=${encodeURIComponent(document.referrer)}$2`),this.Ve(e,this.We(e))):N(De,{message:"1.3.1 Redirect destination function did not evaluate to a string",args:[String(e.dest)]})},Se.prototype.We=function(e){const t=Te(e.dest);if(e.preserveParameters){const e=this.Ge();e&&(t.search?t.search+="&"+e.substr(1):t.search=e)}return t.toString()},Se.prototype.Ve=function(e,t){(!e.hasOwnProperty("hidePage")||e.hidePage)&&this.qe(),this.Be(t)},Se.prototype.qe=function(){const e=document.createElement("style");e.setAttribute("type","text/css"),e.innerHTML="body{display:none;visibility:hidden;}",document.head.appendChild(e)},Se.prototype.Be=function(e){window.location.replace(e)},Se.prototype.Ge=function(){return window.location.search};const Pe="Change Applier";function je(e){const t=new Ne(e);return t.pe(),t}function Re(e){window.optimizely.push({type:"addListener",filter:{type:"lifecycle",name:"pageDeactivated"},handler:function(t){const n=t.data.page,i=e[n.id];i&&n.deactivationEnabled&&(i.forEach((e=>e.Pe())),n.undoOnDeactivation&&i.forEach((e=>e.ge()))),delete e[n.id]}})}function Ne(e){this.He=[],e.forEach((e=>{let t;switch(e.type){case"attribute":t=new Ee(e);break;case"append":t=new _e(e);break;case"custom_code":t=new Ie(e);break;case"rearrange":t=new Oe(e);break;case"redirect":t=new Se(e);break;case"widget":t=ee.newWidgetChange(e);break;default:N(Pe,{message:"1.0: Unknown change type:",args:[e.type]})}t&&this.He.push(t)}))}Ne.prototype.pe=function(){this.He.forEach((e=>e.pe()))},Ne.prototype.Pe=function(){this.He.forEach((e=>{e.Pe&&e.Pe()}))},Ne.prototype.ge=function(){this.He.forEach((e=>{e.ge&&e.ge()}))};var Me={Je:je,Xe:Ne,Ke:Re};let xe;const $e="Click Tracking";function Le(){xe||(xe=new Ve((function(e){j(e)})))}function Ue(e){xe||Le(),xe.Ye()||xe.Ze(),xe.Qe(e)}function Fe(e){xe.et(e),xe.Ye()||xe.tt()}function ze(e){window.optimizely.push({type:"addListener",filter:{type:"lifecycle",name:"pageDeactivated"},handler:function(t){const n=t.data.page.id;e[n]&&e[n].forEach(Fe)}})}class Ve{constructor(e){this.nt=e,this.it=[],this.rt=null,this.ot=function(e){this.it.forEach(function(t){try{var n=t.selector;We(e,n)&&this.nt(t)}catch(i){N($e,{message:"Click handler error:",err:i},!1)}}.bind(this))}.bind(this)}Ze(){this.rt=document.addEventListener("click",this.ot,!0)}tt(){this.rt&&(this.rt(),this.rt=null)}Ye(){return this.it.length>0}Qe(e){this.it.push(e)}et(e){this.it=this.it.filter((function(t){return t.apiName!==e.apiName}))}}function We(e,t){for(var n=e.target;n;){var i;try{i=n.matches(t)}catch(r){return!1}if(i)return!0;n=n.parentElement}return!1}var Ge={st:Ue,ct:Le,ut:ze};var qe={dt:function(e,t,n,i){var r={id:e,policy:"single_experiment",holdback:0,experiments:[{id:t||"",variations:[{id:n||"",actions:[]}]}],integrationStringVersion:1};return i&&Object.assign(r,{pageIds:[i]}),r},lt:function(e,t,n,i){return{campaignId:e,decision:{campaignId:e,experimentId:t,variationId:n,isCampaignHoldback:i||!1},decisionTicket:{audienceIds:[]}}}};const Be={LIFECYCLE:"lifecycle"},He={CAMPAIGN_DECIDED:"campaignDecided",INITIALIZED:"initialized"};var Je={ht:function(e){var t=qe.dt(e.layerId,e.experimentId,e.variationId,e.viewId),n=qe.lt(e.layerId,e.experimentId,e.variationId,e.isLayerHoldback);return{type:Be.LIFECYCLE,name:He.CAMPAIGN_DECIDED,data:{campaign:t,decisionTicket:n.decisionTicket,decision:n.decision}}},ft:()=>({type:Be.LIFECYCLE,name:He.INITIALIZED})};const Xe="Side Emitter";function Ke(e){return f(e)&&e.type&&"addListener"===e.type&&e.filter&&f(e.filter)&&h(e.handler)}function Ye(e){var t=[];return g(window.optimizely)&&window.optimizely.forEach((n=>{Ke(n)&&n.filter.type===e.type&&n.filter.name===e.name&&t.push(n.handler)})),t}function Ze(e){Ye(e).forEach((t=>{try{t.call(void 0,e)}catch(n){N(Xe,{message:"4.0: Error in listener handler for event:",err:n,args:[e]})}}))}var Qe={_t:e=>{let t=[Je.ft()];e.decisions&&(t=t.concat(e.decisions.map(Je.ht))),t.forEach(Ze)}};function et(){return document.currentScript}function tt(e){document.cookie=e}var nt={gt:et,wt:tt};function it(e){nt.wt(e)}function rt(e,t="/"){const n=le.be().split(".");for(;n.length>0;)this.vt(`${e}=;expires=${new Date(0)};path=${t};domain=.${n.join(".")}`),n.shift()}var ot={vt:it,bt:rt};const st="Main",at="optimizelyOptOut",ct=()=>window&&document&&window.MutationObserver,ut=()=>window&&window.optlyDesktop&&void 0!==window.optlyDesktop.p13nInner;var dt=(e,t=null)=>{if(K.he(),ut())return void D.j(`${st} /  Disabling because of desktop app.`);if(!y.k(e))return void N(st,{message:"0.1: Not a valid input"});const n=e.snippetURL;if(n){let t,i,r;const o=()=>y.h(n),s=e.experimental&&e.experimental.features.tracking_snippet_install;if(s){s.enabled&&(({install_mode:t,delay:i,preload:r}=s),t=t.toLowerCase());const e=i>=0?()=>setTimeout(o,i):o;"load"===t?window.onload=e:"domcontentloaded"===t?window.addEventListener("DOMContentLoaded",e):(t&&D.R(`Ignoring unknown install mode: ${t}`),e()),r&&y._(n)}else e.trackingSnippetOnload?window.onload=o:o()}if(ct()){if(e.optIn&&(D.j(`${st} / Processing opt in`),ot.bt(at)),e.visitorIdCookie&&ot.vt(e.visitorIdCookie),"projectJS"in e&&ne.pe(e.projectJS),e.pluginsPayload)try{y.g(e.pluginsPayload)(ee)}catch(i){N(st,{message:"0.4: Error Registering Plugins",err:i},!1)}if(e.disableTracking||(R.N(e),R.M(e)),e.disableTracking||Qe._t(e),"changeSets"in e){const t=e.changeSets.reduce(((e,t)=>{const{changes:n,viewId:i}=t;return e[i]||(e[i]=[]),e[i].push(Me.Je(n)),e}),{});Object.keys(t).length&&Me.Ke(t)}if("activeClickEvents"in e&&!e.disableTracking){const t=Object.keys(e.activeClickEvents);t.length&&(Ge.ct(),t.forEach((t=>e.activeClickEvents[t].forEach(Ge.st))),Ge.ut(e.activeClickEvents))}}else N(st,{message:"0.2: Not a supported environment"})};const lt="https://rum.optimizely.com/rum";function ht(e,t){const{accountId:n,activeExt:i,dynamicWebsiteSupport:r,experimental:o,groups:s,projectId:a,revision:c,rum:u,webManExt:d}=e,{id:l,inRumSample:h,sampleRate:f}=u;if(!h)return window.optimizely.push({type:"rum",eventData:{inRumSample:h}}),Promise.resolve();const _={sampleRate:f,extras:{edge:Object.assign(ft(),{activeExt:i||0,groups:s||0,microsnippetTimestamp:t,spa:r||!1,webManExt:d||0}),experimental:o}};window.optimizely.push({type:"rum",eventData:{id:l,inRumSample:h,data:_}});const p=Object.assign({id:l,v:"1.0",account:n,project:a,revision:c,clientVersion:"v1_46_0_v1_46_0"},_),g=(e,t)=>Object.assign({},e,{extras:Object.assign({},e.extras,{[t]:!0,beacon:{microsnippet:!0}})});return"function"==typeof navigator.sendBeacon&&navigator.sendBeacon(lt,JSON.stringify(g(p,"sendBeacon"))),fetch(lt,{method:"POST",credentials:"include",body:JSON.stringify(g(p,"fetch")),headers:{"Content-Type":"text/plain;charset=UTF-8"}})}function ft(){const{async:e}=nt.gt(),{defer:t,src:n}=nt.gt();return{async:e,defer:t,performanceMeasures:pt(),subresource:_t(n),unsafeTrackingGlobalPushUsed:d.get("unsafeTrackingGlobalPushUsed")||!1}}function _t(e){if(!e)return;const t=v(e),n=o.t()?o.i(e)[0].toJSON():null;return{scheme:t.protocol.slice(0,-1),host:t.host,path:t.pathname,resourceTiming:n}}function pt(){if(!o.t())return;const e={"time-to-edge-complete":[void 0,"edge-end"],"edge-execution":["edge-begin","edge-end"]};return Object.keys(e).reduce(((t,n)=>{o.u(n,e[n][0],e[n][1]);const{startTime:i,duration:r}=o.i(n)[0];return t[n]={startTime:i,duration:r},t}),{})}var gt="Index";try{wt()}catch(mt){try{N(gt,{message:"0.0: Main: Unhandled error",err:mt})}catch(vt){console.warn(mt)}}function wt(){if(window.optimizelyEdge&&window.optimizelyEdge.fe||window.optimizely&&window.optimizely.initialized)console.warn("Disabling this snippet because Optimizely has already initialized on this page load. Are there multiple snippets on the page?");else{o.t()&&o.o("edge-begin");var e={"accountId":"20611073899","activeClickEvents":{"21909400130":[{"apiName":"21098500546_engagement_with_email_opti_form","id":"21859803609","selector":".bm_form input, .bm_form button"},{"apiName":"21098500546_interaction_with_sticky_form_or_cta","id":"21882011565","selector":".bm_sticky-form .bm_form_div .bm_form input, .bm_sticky-form .bm_form_div .bm_form button, #app-page-root > div > div > div.bb.b-gray-300.bg-white.pt5.pb5.m_pt6.m_pb6.bg-gray-200.pv0 > div > div > div.fixed.top-0.left-0.right-0.w-100.bg-white.z-1.pa3.b-gray.bb._2zVSJNJMzMOp9n-4Rwj7m1.PWvusrO2v5lE8_-mgQZ_Z > div.ma-auto.mw9.dn.m_db.m_flex.items-center.justify-center > div.ml5 > a > span"}],"22725102266":[{"apiName":"21098500546_breadcrumb_thumbtack_clicks_","id":"22686843081","selector":".bg-white nav[aria-label=\"Breadcrumb\"] ol>li:first-of-type"},{"apiName":"21098500546_tt__zip_code_fields_clicks_","id":"22705932979","selector":".bg-gray-200.bg-white .tp-wrap  form input[data-test=\"zip-code-field\"]"},{"apiName":"21098500546_tt__cost_estimates_clicks_","id":"22721262759","selector":" .bg-white nav[aria-label=\"Breadcrumb\"] ol>li:first-of-type + li"},{"apiName":"21098500546_tt__get_a_free_estimate_cta_clicks","id":"22727342020","selector":".bg-gray-200.bg-white .tp-wrap  form button.tp-button[type=\"submit\"]"},{"apiName":"21098500546_tt__join_as_pro_button_clicks","id":"22749511861","selector":"#app-page-root>.flex>div .flex.items-center.overflow-hidden .flex button"},{"apiName":"21098500546_tt__search_cta_clicks_","id":"22758221005","selector":"button[aria-label=\"Search\"]"}],"24444870362":[{"apiName":"21098500546_clicks_on_get_leads_hero_cta","id":"24464470048","selector":"div:nth-child(5) > div.m_dn > button,.dn.m_db > button"}],"4687461129912320":[{"apiName":"21098500546_click_on_sign_up_for_free_cta","id":"4766405728403456","selector":".ttsearch-location-input, [class*=\"hero_heroCategoryTaxonSearchBox\"] button, .fixed.bottom-0 .mv2 [class*=\"themed_themedButtonRoundedBordersLeft\"]"},{"apiName":"21098500546_clicks_on_lets_us_call_you","id":"6527531654840320","selector":"[class*=\"hero_heroInnerOffsetRight\"] [href=\"/sales/\"]"},{"apiName":"21098500546_clicks_on_phone_number","id":"6711138587508736","selector":"[class*=\"hero_heroInnerOffsetRight\"] [href=\"tel:+18556639023\"]"}],"5187591159414784":[{"apiName":"21098500546_increase_clickthroughs_on_ctas_within_the_belowthefold_modules","id":"4955021633126400","selector":".tt_clicksignup, .subhead_cta a, .community a"},{"apiName":"21098500546__interaction_rate_with_the_calculator","id":"6389746868420608","selector":".subhead_cta a, .calculator input"}],"5246456234246144":[{"apiName":"21098500546_signup_completion","id":"5530068762492928","selector":"[data-testid=\"signup-form__signup-button\"]"}]},"activeExt":0,"activeViews":[{"id":"21656601595","apiName":"21098500546_all_cost_pages_with_excluded_urls_"},{"id":"21909400130","apiName":"21098500546_tt_all_cost_pages_"},{"id":"22027372048","apiName":"21098500546_thumbtack_pro_page"},{"id":"22725102266","apiName":"21098500546_all_cost_pages_p"},{"id":"23074360354","apiName":"21098500546_new_pro_page"},{"id":"24444870362","apiName":"21098500546_pro__highlight_crm_integration_partners"},{"id":"25409930781","apiName":"21098500546_pro_landing_page_redesign"},{"id":"27967340620","apiName":"21098500546_tt136__hero_background_image"},{"id":"28205060031","apiName":"21098500546_tt137__tt_guarantee"},{"id":"28357860023","apiName":"21098500546_pro_highlight_large_pro_brands"},{"id":"29727970011","apiName":"21098500546_pro_landing_page"},{"id":"4687461129912320","apiName":"21098500546_pro_page_update"},{"id":"5187591159414784","apiName":"21098500546_url_targeting_for_pro_page_phase_2_updates"},{"id":"5235014539935744","apiName":"21098500546_tt__150_all_pages"},{"id":"5246456234246144","apiName":"21098500546_all_pages"},{"id":"5463746112389120","apiName":"21098500546_cta_copy__pricing_transparency"},{"id":"5710297290244096","apiName":"21098500546_tt__167__hp_hierarchy_v1"},{"id":"6008860543025152","apiName":"21098500546_preset_jobs_on_pro_landing_page"}],"changeSets":[{"changes":[{"type":"custom_code","value":function($){(function () {
try {
/* main variables */
var debug = 0;
var variation_name = "TT_Cost_Page";
/* all Pure helper functions */
function waitForElement(selector, trigger, delayInterval, delayTimeout) {
var interval = setInterval(function () {
if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
clearInterval(interval);
trigger();
}
}, delayInterval);
setTimeout(function () {
clearInterval(interval);
}, delayTimeout);
}
function addLiveEventListener(selector, event, callback, context) {
function addEvent(el, type, handler) {
if (el.attachEvent) el.attachEvent('on' + type, handler);
else el.addEventListener(type, handler);
}
// Matches polyfill
this.Element && function (ElementPrototype) {
ElementPrototype.matches = ElementPrototype.matches ||
ElementPrototype.matchesSelector ||
ElementPrototype.webkitMatchesSelector ||
ElementPrototype.msMatchesSelector ||
function (selector) {
var node = this,
nodes = (node.parentNode || node.document).querySelectorAll(selector),
i = -1;
while (nodes[++i] && nodes[i] != node);
return !!nodes[i];
};
}(Element.prototype);
// Live binding helper using matchesSelector
function live(selector, event, callback, context) {
addEvent(context || document, event, function (e) {
var found, el = e.target || e.srcElement;
while (el && el.matches && el !== context && !(found = el.matches(selector))) el = el.parentElement;
if (found) callback.call(el, e);
});
}
live(selector, event, callback, context);
}
// Add swiper slider script
function addScript() {
var bmScript = document.createElement("script");
bmScript.src = "https://unpkg.com/swiper@7/swiper-bundle.min.js";
document.getElementsByTagName("head")[0].appendChild(bmScript);
var bmcsslink = document.createElement("link");
bmcsslink.rel = "stylesheet";
bmcsslink.href = "https://unpkg.com/swiper@7/swiper-bundle.min.css";
document.getElementsByTagName("head")[0].appendChild(bmcsslink);
}
addScript();
// Wait for swiper slider
function onwaitforswiper(trigger) {
var interval = setInterval(function () {
if (typeof Swiper != "undefined") {
clearInterval(interval);
trigger();
}
}, 50);
setTimeout(function () {
clearInterval(interval);
}, 15000);
}
var topnav = `<h2 class="Type_title1__byBr1 pro-testimonials_title__Ywmk8 ph4 m_ph0 mb5 tl m_tc">Why pros love Thumbtack</h2><div class="swiper-container">
<div class="swiper-wrapper">
<div class="swiper-slide">
<div class="imagesection"> <img src="https://d27c6j8064skg9.cloudfront.net/Thumbtack/Pro+Landing+Page%3A+Update+testimonials/grow_more.jpg"></div>
<div class="textcontent">
<div class="shadowdiv">
<h5>We have been able to <b>grow more</b> since joining Thumbtack and it has also allowed us to branch out to<b> new areas of our business.</b></h5>
<p>Business owner <span> Landscaping and Hardscaping, Greenwood, IN</span></p>
</div>
</div>
</div>
<div class="swiper-slide">
<div class="imagesection"> <img src="https://cdn.optimizely.com/img/20611073899/d5e4447eef6a43e0bc367a9b00995bbb.jpg"></div>
<div class="textcontent">
<div class="shadowdiv">
<h5>Having the <b>reliability</b> of Thumbtack as a platform has allowed me to set a new franchise first year <b>record for revenue.</b></h5>
<p>Jerald Roberts <span>Five Star Painting, Manassas, VA</span></p>
</div>
</div>
</div>
<div class="swiper-slide">
<div class="imagesection"> <img src="https://d27c6j8064skg9.cloudfront.net/Thumbtack/Pro+Landing+Page%3A+Update+testimonials/customer.jpg"></div>
<div class="textcontent">
<div class="shadowdiv">
<h5>The app is super easy to use...one Thumbtack<b> customer can turn into several referrals.</b></h5>
<p>Ricc Brindicci <span>HVAC</span></p>
</div>
</div>
</div>
</div>
<!-- Add Arrows -->
<div class="swiper-button-next"></div>
<div class="swiper-button-prev"></div>
<!-- Add Pagination -->
<div class="swiper-pagination"></div>
</div>`;
var swiperInstance = null;
function generateSwiperSlider() {
if (swiperInstance) return; // Avoid reinitializing
swiperInstance = new Swiper('.swiper-container', {
slidesPerView: 1,
spaceBetween: 10,
loop: true,
navigation: {
nextEl: '.swiper-button-next',
prevEl: '.swiper-button-prev',
},
pagination: {
el: '.swiper-pagination',
clickable: true,
},
breakpoints: {
768: {
slidesPerView: 1,
},
991: {
slidesPerView: 1,
},
1366: {
slidesPerView: 1,
}
},
});
}
/* Variation Init */
function init() {
document.querySelector("body").classList.add(variation_name);
// console.log('run test');
if (!document.querySelector('.swiper-container')) {
document.querySelector('[class*="pro-testimonials_wrapper"]').innerHTML = topnav;
}
setTimeout(function () {
onwaitforswiper(generateSwiperSlider);
}, 3000);
}
/* Initialise variation */
function thumbtackTest144(list, observer) {
list.getEntries().forEach((entry) => {
if (entry.entryType === "mark" && entry.name === "afterHydrate") {
observer.disconnect();
clearInterval(test144Interval);
waitForElement('[class*="pro-testimonials_wrapper"]', init, 50, 15000);
window.isHydrated = true;
}
});
}
if (!window.isHydrated) {
var test144Interval = setInterval(function () {
waitForElement('[class*="pro-testimonials_wrapper"]', init, 50, 15000);
}, 50);
setTimeout(function () {
clearInterval(test144Interval);
}, 3000);
const observer = new PerformanceObserver(thumbtackTest144);
observer.observe({ entryTypes: ["mark"] });
} else {
waitForElement('[class*="pro-testimonials_wrapper"]', init, 50, 15000);
}
} catch (e) {
if (debug) console.log(e, "error in Test" + variation_name);
}
})();
}},{"type":"append","selector":"head","value":"<style>html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] [class*=\"pro-testimonials_title\"] {\n    margin-bottom: 42px !important;\n    font-size: 40px !important;\n    line-height: 44px !important;\n    font-weight: 700 !important;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-container .swiper-slide {\n    display: flex;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-container .swiper-slide>div {\n    width: 50%;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-container .swiper-slide>div img {\n    width: 100%;\n    height: 100%;\n    border-top-left-radius: 4px;\n    border-bottom-left-radius: 4px;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: center;\n    position: relative;\n    padding: 22px 22px 22px 0px !important;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .imagesection {\n    padding: 22px 0px 22px 0px;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent h5 {\n    font-size: 24px;\n    font-weight: 400;\n    line-height: 32px;\n    text-align: left;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent p {\n    font-size: 14px;\n    font-weight: 400;\n    line-height: 20px;\n    text-align: left;\n    color: rgba(47, 48, 51, 1);\n    margin-top: 35px;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent h5:before {\n    color: #009fd9;\n    position: relative;\n    display: inline-block;\n    float: left;\n    margin-left: -45px;\n    margin-top: -10px;\n    width: 27px;\n    height: 23px;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-container .swiper-slide>div {\n    width: 50%;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] {\n    overflow: hidden;\n    position: relative;\n    padding-top: 20px !important;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-button-next:after,\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-button-prev:after {\n    font-size: 18px !important;\n    color: black;\n    font-weight: 700;\n    top: 9px;\n    position: absolute;\n    left: 14px;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-button-next,\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-rtl .swiper-button-prev {\n    right: 30px !important;\n    border: 2px solid #FAFAFA;\n    border-radius: 50px;\n    width: 38px;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    height: 38px;\n    box-shadow: 0 2px 4px rgba(0, 0, 0, .15) !important;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .shadowdiv h5:before {\n    content: \" \";\n    background-image: url(https://d27c6j8064skg9.cloudfront.net/Thumbtack/Pro+Landing+Page%3A+Update+testimonials/%E2%80%98%E2%80%98.svg);\n    height: 35px;\n    width: 40px;\n    background-repeat: no-repeat;\n    position: relative;\n    top: -4px;\n    left: -9px;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-horizontal>.swiper-pagination-bullets,\n.swiper-pagination-bullets.swiper-pagination-horizontal {\n    width: 50% !important;\n    right: 0;\n    left: inherit !important;\n    bottom: 50px !important;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-pagination-bullet-active {\n    background: rgba(103, 109, 115, 1) !important;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-pagination-bullet {\n    width: var(--swiper-pagination-bullet-width, var(--swiper-pagination-bullet-size, 14px)) !important;\n    height: var(--swiper-pagination-bullet-height, var(--swiper-pagination-bullet-size, 14px)) !important;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_proTestimonialsSection\"]>div:first-child {\n    max-width: 1154px;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .shadowdiv {\n    height: 100%;\n    width: 100%;\n    box-shadow: 2px 6px 20px 0px rgba(0, 0, 0, 0.15);\n    background-color: #fff;\n    padding: 112px;\n    border-top-right-radius: 4px;\n    border-bottom-right-radius: 4px;\n    flex-direction: column;\n    justify-content: center;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent p span {\n    display: block;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-button-prev {\n    display: none;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-container.swiper-initialized.swiper-horizontal.swiper-pointer-events {\n    position: relative;\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-container .swiper-slide>div:first-child {\n    padding-left: 10px;\n}\n\n@media screen and (min-width:1024px) {\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent {\n        box-sizing: border-box;\n        padding: 0 116px;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-container .swiper-slide>div img {\n        box-shadow: 9px 6px 20px 0px rgba(0, 0, 0, 0.15);\n    }\n}\n\n@media screen and (max-width:1023px) {\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent {\n        padding: 0 66px;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent h5 {\n        padding: 85px;\n        padding-bottom: 0;\n        padding-top: 0;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent p {\n        padding: 0px 85px;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .shadowdiv {\n        padding: 0px;\n    }\n}\n\n@media only screen and (max-width: 1023px) and (min-width: 820px) {\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent h5 {\n        padding: 70px;\n        padding-bottom: 0;\n        padding-top: 45px;\n        font-size: 20px;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent p {\n        margin-top: 12px;\n        padding: 0 85px 0 70px;\n    }\n}\n\n@media screen and (max-width:820px) {\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent h5 {\n        padding-top: 0;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-container .swiper-slide {\n        flex-direction: column;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-container .swiper-slide>div {\n        width: 100%;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent {\n        box-sizing: border-box;\n        padding: 45px 48px;\n        width: 90% !important;\n        margin: 0 auto;\n        margin-top: -80px;\n        padding: 0 !important;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-container .swiper-slide>div:first-child {\n        padding-left: 0;\n        padding-top: 0;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-horizontal>.swiper-pagination-bullets,\n    .swiper-pagination-bullets.swiper-pagination-horizontal {\n        width: 100% !important;\n        right: inherit;\n        left: inherit;\n        bottom: 0 !important;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-button-next,\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-button-prev {\n        display: none !important;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .shadowdiv h5:before {\n        height: 28px;\n        width: 30px;\n        top: -4px;\n        left: 8px;\n        background-size: contain;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent h5 {\n        font-size: 16px;\n        line-height: 24px;\n        padding: 85px;\n        padding-bottom: 0;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent p {\n        margin-top: 14px;\n        padding: 0px 85px;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] {\n        padding-bottom: 30px;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .shadowdiv {\n        border-radius: 4px;\n        padding: 53px;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] [class*=\"pro-testimonials_title\"] {\n        margin-bottom: 30px !important;\n        font-size: 28px !important;\n    }\n}\n\nhtml body.TT_Cost_Page .swiper-container.swiper-initialized.swiper-horizontal.swiper-android {\n    position: relative;\n}\n\n@media screen and (max-width: 500px) {\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent h5,\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent p {\n        padding: 0;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] [class*=\"pro-testimonials_title\"] {\n        font-size: 27px !important;\n\n    }\n}\n\nhtml body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] {\n    z-index: 0;\n}\n\n@media only screen and (max-width: 820px) and (min-width: 500px) {\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent h5 {\n        padding: 0 20px;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .textcontent p {\n        padding: 0px 85px 0 20px;\n    }\n}\n\n@media screen and (max-width: 500px) and (min-width: 399px) {\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .shadowdiv {\n        height: 230px;\n        padding: 32px 53px 32px;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-horizontal>.swiper-pagination-bullets,\n    html body.TT_Cost_Page .swiper-pagination-bullets.swiper-pagination-horizontal {\n        bottom: -5px !important;\n    }\n}\n\n@media screen and (max-width: 399px) {\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .shadowdiv {\n        height: 270px;\n        padding: 32px 53px 32px;\n    }\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-horizontal>.swiper-pagination-bullets,\n    html body.TT_Cost_Page .swiper-pagination-bullets.swiper-pagination-horizontal {\n        bottom: 0px !important;\n    }\n}\n\n@media screen and (max-width: 378px) {\n\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .swiper-horizontal>.swiper-pagination-bullets,\n    html body.TT_Cost_Page .swiper-pagination-bullets.swiper-pagination-horizontal {\n        bottom: 0px !important;\n    }\n}\n\n@media screen and (max-width: 360px) {\n    html body.TT_Cost_Page [class*=\"pro-testimonials_wrapper\"] .shadowdiv {\n        height: auto;\n    }\n}</style>"}],"viewId":"29727970011"},{"changes":[],"viewId":"5463746112389120"},{"changes":[{"type":"custom_code","value":function($){(function () {
    var debug = false;
    var variation_name = "bm_preset_jobs_pro_lp";

    var HERO_SECTION = '[class*="pro-signup-hero_heroSection"]';
    var HERO_TITLE = '[class*="pro-signup-hero_heroTitle"]';
    var HERO_SUBHEAD = '[class*="pro-signup-hero_heroSubhead"]';
    var HOW_IT_WORKS = '[class*="how-tt-works_section"]';

    var NEW_TITLE_PREFIX = 'Grow your business in ';
    var NEW_SUBHEAD = '5M customers in the last 12 months on Thumbtack';

    var IMG_DIRECT = 'https://cdn.optimizely.com/img/20611073899/e633b72a9df34774998491e5d4f6934d.png';
    var IMG_PRESET = 'https://cdn.optimizely.com/img/20611073899/f9723f4c525749e8a6a135d0537c6b6e.png';

    var ARROW_SVG = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 1.5v10.5M2.5 7.5 7 12l4.5-4.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var barHTML =
        '<div class="bm-hiw-bar">' +
            '<div class="bm-hiw-bar__btn">' +
                '<span class="bm-hiw-bar__text">Show up in search, or claim available jobs. </span>' +
                '<button type="button" class="bm-hiw-bar__cta">See how it works <span class="bm-hiw-bar__arrow">' + ARROW_SVG + '</span></button>' +
            '</div>' +
        '</div>';

    function cardHTML(img, alt, title, desc) {
        return '<div class="bm-two-ways__card">' +
            '<img class="bm-two-ways__img" src="' + img + '" alt="' + alt + '" loading="lazy">' +
            '<div class="bm-two-ways__copy">' +
                '<h3 class="bm-two-ways__card-title">' + title + '</h3>' +
                '<p class="bm-two-ways__card-desc">' + desc + '</p>' +
            '</div>' +
        '</div>';
    }

    var sectionHTML =
        '<section class="bm-two-ways" id="bm-two-ways">' +
            '<div class="bm-two-ways__head">' +
                '<h2 class="bm-two-ways__title">Two ways to get hired</h2>' +
                '<p class="bm-two-ways__sub">Stand out in search, or skip the back-and-forth with jobs you can claim right away.</p>' +
            '</div>' +
            '<div class="bm-two-ways__cards">' +
                cardHTML(IMG_DIRECT, 'Deck refinishing job with a quote request', 'Customers find you',
                    'They see your profile in search and message you about their project. You set your own prices and schedule.') +
                cardHTML(IMG_PRESET, 'TV mounting job available to claim', 'Claim available jobs',
                    'Some jobs come with the details and earnings already set. Pick the ones you want, with no bidding.') +
            '</div>' +
            '<div class="bm-two-ways__footer">' +
                '<button type="button" class="bm-two-ways__signup">Sign up for free</button>' +
                '<p class="bm-two-ways__note">Claimable jobs are available in select areas and services.</p>' +
            '</div>' +
        '</section>';

    // Smooth-scroll to an element, then keep correcting until it actually lands at the top.
    // The native page shifts while scrolling (sticky search bar / collapsing elements on mobile),
    // so a single scrollTo with a precomputed target overshoots. The selector is re-queried on
    // every check because React can re-mount the target mid-scroll.
    function scrollToEl(selector, done) {
        var el = document.querySelector(selector);
        if (!el) return;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset, behavior: 'smooth' });

        var lastY = -1;
        var corrections = 0;
        var started = Date.now();
        var check = setInterval(function () {
            var y = window.pageYOffset;
            if (y !== lastY) {
                lastY = y; // still scrolling
                if (Date.now() - started < 3000) return;
            }
            var target = document.querySelector(selector);
            var offset = target ? target.getBoundingClientRect().top : 0;
            if (Math.abs(offset) > 2 && corrections < 3 && Date.now() - started < 3000) {
                corrections++;
                lastY = -1;
                window.scrollTo({ top: y + offset, behavior: 'smooth' });
                return;
            }
            clearInterval(check);
            if (done) done();
        }, 150);
    }

    // Keep the existing hero form/functionality; only swap the copy.
    // React can re-render the hero, so this is re-applied on an interval.
    function updateHeroCopy() {
        var h1 = document.querySelector(HERO_TITLE);
        if (h1 && h1.textContent.indexOf(NEW_TITLE_PREFIX) !== 0) {
            var match = h1.textContent.match(/\bin\s+(.+?)\.?\s*$/);
            if (match) h1.textContent = NEW_TITLE_PREFIX + match[1];
        }
        var sub = document.querySelector(HERO_SUBHEAD);
        if (sub && sub.textContent !== NEW_SUBHEAD) sub.textContent = NEW_SUBHEAD;
    }

    function addBar() {
        var hero = document.querySelector(HERO_SECTION);
        if (!hero || document.querySelector('.bm-hiw-bar')) return;
        hero.insertAdjacentHTML('afterend', barHTML);
    }

    function addTwoWaysSection() {
        var hiw = document.querySelector(HOW_IT_WORKS);
        if (!hiw || document.querySelector('.bm-two-ways')) return;
        hiw.insertAdjacentHTML('afterend', sectionHTML);
    }

    // Delegated event binding so handlers survive React re-renders of the injected markup.
    function live(selector, event, callback, context) {
        (context || document).addEventListener(event, function (e) {
            var el = e.target && e.target.closest ? e.target.closest(selector) : null;
            if (el) callback.call(el, e);
        });
    }

    function bindEvents() {
        // Guard so listeners are only attached once, even if the variation code runs again.
        if (window.bmPresetJobsProLpEvents) return;
        window.bmPresetJobsProLpEvents = true;

        live('.bm-hiw-bar__cta', 'click', function () {
            scrollToEl('.bm-two-ways');
        });

        // Bottom CTA reuses the existing hero signup flow: scroll up and click the hero "Sign up" button.
        // The hero has separate desktop/mobile buttons, so click the visible one. It is queried after the
        // scroll settles; the one present at click time may be detached by then.
        live('.bm-two-ways__signup', 'click', function () {
            scrollToEl(HERO_SECTION, function () {
                var buttons = document.querySelectorAll(HERO_SECTION + ' [class*="pro-signup-hero_searchFields"] button');
                for (var i = 0; i < buttons.length; i++) {
                    if (buttons[i].offsetParent !== null) {
                        buttons[i].click();
                        return;
                    }
                }
            });
        });
    }

    function init() {
        document.body.classList.add(variation_name);
        bindEvents();

        var interval = setInterval(function () {
            updateHeroCopy();
            addBar();
            addTwoWaysSection();
        }, 50);

        // Failsafe: stop checking after 10 seconds.
        setTimeout(function () {
            clearInterval(interval);
        }, 10000);
    }

    try {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    } catch (e) {
        if (debug) console.log(e, "error in Test" + variation_name);
    }
})();
}},{"type":"append","selector":"head","value":"<style>/* ============ Hero (existing banner, redesigned) ============ */\n.bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_heroSection\"] {\n    padding: 32px 24px 48px;\n}\n\n.bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_heroInner\"] {\n    display: flex;\n    flex-direction: column;\n    max-width: 570px;\n}\n\n.bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_heroInner\"] > .tc.mb5 {\n    order: 1;\n    text-align: left !important;\n    margin-bottom: 24px;\n}\n\n.bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_searchFields\"] {\n    order: 2;\n}\n\n/* Figma: white inputs with a light grey border. TextInput_inputStyles is the absolutely\n   positioned pill layer behind the input; style it directly instead of via --tp-* tokens. */\n.bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_searchFields\"] [class*=\"TextInput_inputStyles\"] {\n    background-color: #fff !important;\n    border: 1px solid #dddee1 !important;\n}\n\n.bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_searchFields\"] input:focus ~ [class*=\"TextInput_inputStyles\"] {\n    border-color: #8d8f94 !important;\n}\n\n.bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_searchFields\"] [class*=\"TextInput_inputInnerElement\"],\n.bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_searchFields\"] [class*=\"TextInput_inputIconContainer\"],\n.bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_searchFields\"] [class*=\"TextInput_root\"] input {\n    background: transparent !important;\n}\n\n.bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_searchFields\"] .mw9 {\n    max-width: none;\n}\n\n.bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_footnote\"] {\n    order: 3;\n    margin-top: 24px;\n    color: #595c61;\n    font-size: 16px;\n    line-height: 1.4;\n}\n\n.bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_footnote\"] a,\n.bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_footnote\"] a:hover,\n.bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_footnote\"] a:active {\n    color: #0175a3;\n}\n\n.bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_heroTitle\"] {\n    font-family: Rise, Avenir, Helvetica, Arial, sans-serif;\n    font-weight: 563;\n    color: #1f2022;\n    font-size: 36px;\n    line-height: 1.05;\n    letter-spacing: -0.72px;\n    text-wrap: initial;\n}\n\n.bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_heroSubhead\"] {\n    font-size: 22px;\n    line-height: 1.1;\n    letter-spacing: -0.44px;\n    color: #1f2022;\n    max-width: none;\n    margin: 12px 0 0;\n}\n\n/* Swap the old hero image for the new visual */\n.bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_heroImage\"] {\n    order: 4;\n    max-width: 454px;\n    margin: 40px auto 0;\n    aspect-ratio: 1506 / 1392;\n    background: url(\"https://cdn.optimizely.com/img/20611073899/d0150460eefd4591ae1b0e80b7e1fb4e.png\") center / contain no-repeat;\n}\n\n.bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_heroImage\"] picture {\n    display: none !important;\n}\n\n/* ============ \"See how it works\" bar ============ */\n.bm-hiw-bar {\n    padding: 0 0 8px;\n    background: #fff;\n}\n\n.bm-hiw-bar__btn {\n    display: block;\n    width: 100%;\n    margin: 0;\n    padding: 14px 24px;\n    border: 0;\n    border-radius: 8px;\n    background: #e0f4fe;\n    color: #0175a3;\n    font-family: Rise, Avenir, Helvetica, Arial, sans-serif;\n    font-size: 16px;\n    line-height: 1.4;\n    text-align: center;\n}\n\n.bm-hiw-bar__text {\n    font-weight: 400;\n}\n\n.bm-hiw-bar__cta {\n    margin: 0;\n    padding: 0;\n    border: 0;\n    background: none;\n    color: inherit;\n    font: inherit;\n    font-weight: 700;\n    white-space: nowrap;\n    cursor: pointer;\n}\n\n.bm-hiw-bar__cta:focus-visible {\n    outline: 2px solid #0175a3;\n    outline-offset: 2px;\n    border-radius: 2px;\n}\n\n.bm-hiw-bar__arrow {\n    display: inline-block;\n    width: 14px;\n    height: 14px;\n    margin-left: 6px;\n    vertical-align: -1px;\n    animation: bmArrowFloat 1.6s ease-in-out infinite;\n}\n\n.bm-hiw-bar__arrow svg {\n    display: block;\n}\n\n@keyframes bmArrowFloat {\n    0%, 100% { transform: translateY(-2px); }\n    50% { transform: translateY(2px); }\n}\n\n@media (prefers-reduced-motion: reduce) {\n    .bm-hiw-bar__arrow { animation: none; }\n}\n\nhtml body.pro-page-updte.bm_preset_jobs_pro_lp [class*='pro-search-signup_mainWrapper'] .relative.mv2 [class*='TextInput_input'] {\n    border-top-right-radius: 9999px !important;\n    border-bottom-right-radius: 9999px !important;\n    border-top-left-radius: 9999px !important;\n    border-bottom-left-radius: 9999px !important;\n    background-color: transparent !important;\n}\nhtml body.pro-page-updte.bm_preset_jobs_pro_lp #search-location-input {\n    background-color: transparent !important;\n    border-top-right-radius: 9999px !important;\n    border-bottom-left-radius: 9999px !important;\n    border-bottom-right-radius: 9999px !important;\n    border-top-left-radius: 0px !important;\n}\n\n/* ============ Two ways to get hired ============ */\n.bm-two-ways {\n    background: #e0f4fe;\n    padding: 48px 24px;\n    font-family: Rise, Avenir, Helvetica, Arial, sans-serif;\n}\n\n.bm-two-ways__head {\n    max-width: 474px;\n    margin: 0 auto;\n    text-align: center;\n}\n\n.bm-two-ways__title {\n    margin: 0;\n    font-size: 32px;\n    font-weight: 563;\n    line-height: 1.05;\n    letter-spacing: -0.64px;\n    color: #2f3033;\n}\n\n.bm-two-ways__sub {\n    margin: 16px 0 0;\n    font-size: 16px;\n    line-height: 1.4;\n    color: #595c61;\n}\n\n.bm-two-ways__cards {\n    display: flex;\n    flex-direction: column;\n    gap: 40px;\n    max-width: 467px;\n    margin: 32px auto 0;\n}\n\n.bm-two-ways__img {\n    display: block;\n    width: 100%;\n    height: auto;\n}\n\n.bm-two-ways__copy {\n    margin-top: 24px;\n}\n\n.bm-two-ways__card-title {\n    margin: 0;\n    font-size: 24px;\n    font-weight: 563;\n    line-height: 1.1;\n    letter-spacing: -0.48px;\n    color: #1f2022;\n}\n\n.bm-two-ways__card-desc {\n    margin: 8px 0 0;\n    font-size: 16px;\n    line-height: 1.4;\n    color: #595c61;\n}\n\n.bm-two-ways__footer {\n    margin-top: 32px;\n    text-align: center;\n}\n\n.bm-two-ways__signup {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    width: 100%;\n    max-width: 481px;\n    height: 52px;\n    padding: 12px 24px;\n    border: 0;\n    border-radius: 9999px;\n    background: #07344a;\n    color: #7cdcfd;\n    font-family: inherit;\n    font-size: 16px;\n    font-weight: 700;\n    line-height: 1;\n    cursor: pointer;\n}\n\n.bm-two-ways__signup:hover {\n    background: #0a4762;\n}\n\n.bm-two-ways__note {\n    margin: 24px 0 0;\n    font-size: 14px;\n    line-height: 1.4;\n    color: #595c61;\n}\nhtml body.bm_preset_jobs_pro_lp [class*='pro-search-signup_mainWrapper'] .relative.mv2 [class*='TextInput_input'] {\n    border-top-right-radius: 9999px !important;\n    border-bottom-right-radius: 9999px !important;\n    border-top-left-radius: 9999px !important;\n    border-bottom-left-radius: 9999px !important;\n}\n\n/* ============ Desktop ============ */\n@media (min-width: 1025px) {\n    .bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_heroSection\"] {\n        padding: 128px 24px;\n    }\n\n    .bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_heroInner\"] {\n        display: grid;\n        grid-template-columns: minmax(0, 570px) minmax(0, 540px);\n        column-gap: 48px;\n        grid-template-rows: auto auto 1fr;\n        justify-content: space-between;\n        max-width: 1184px;\n    }\n\n    .bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_heroInner\"] > * {\n        min-width: 0;\n    }\n\n    .bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_heroInner\"] > .tc.mb5 {\n        grid-column: 1;\n        grid-row: 1;\n    }\n\n    .bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_searchFields\"] {\n        grid-column: 1;\n        grid-row: 2;\n    }\n\n    .bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_footnote\"] {\n        grid-column: 1;\n        grid-row: 3;\n        align-self: start;\n    }\n\n    .bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_heroImage\"] {\n        grid-column: 2;\n        grid-row: 1 / 4;\n        align-self: start;\n        background-position: center top;\n        width: 100%;\n        max-width: none;\n        margin: 0;\n    }\n\n    .bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_heroTitle\"] {\n        font-size: 48px;\n        letter-spacing: -0.96px;\n    }\n\n    .bm_preset_jobs_pro_lp [class*=\"pro-signup-hero_heroSubhead\"] {\n        font-size: 28px;\n        letter-spacing: -0.56px;\n        margin-top: 16px;\n    }\n\n    .bm-hiw-bar {\n        padding: 0;\n    }\n\n    .bm-hiw-bar__btn {\n        border-radius: 0;\n    }\n\n    .bm-two-ways {\n        padding: 96px 24px;\n    }\n\n    .bm-two-ways__title {\n        font-size: 36px;\n        letter-spacing: -0.72px;\n    }\n\n    .bm-two-ways__cards {\n        flex-direction: row;\n        justify-content: center;\n        gap: 48px;\n        max-width: 982px;\n        margin-top: 48px;\n    }\n\n    .bm-two-ways__card {\n        flex: 0 1 467px;\n        min-width: 0;\n    }\n\n    .bm-two-ways__copy {\n        margin-top: 36px;\n    }\n\n    .bm-two-ways__card-title {\n        font-size: 28px;\n        letter-spacing: -0.56px;\n    }\n\n    .bm-two-ways__card-desc {\n        max-width: 420px;\n    }\n\n    .bm-two-ways__footer {\n        margin-top: 56px;\n    }\n\n    .bm-two-ways__signup {\n        width: auto;\n    }\n}</style>"}],"viewId":"6008860543025152"},{"changes":[{"type":"custom_code","value":function($){(function () {
  try {
    /* Main variables */
    var debug = 0;
    var variation_name = "pro-page-updte"; // Variation name for tracking
    /* All Pure helper functions */
    // Function to wait for an element to appear in the DOM
    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        // Check if the element exists and trigger callback
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger(); // Call the trigger function once the element is found
        }
      }, delayInterval); // Check every delayInterval milliseconds
      setTimeout(function () {
        clearInterval(interval); // Stop checking after delayTimeout
      }, delayTimeout);
    }
    // Function to add event listeners that work across all browsers (including IE 8)
    function live(selector, event, callback, context) {
      // Helper function to add event listeners for IE 8 and other browsers
      function addEvent(el, type, handler) {
        if (el.attachEvent) el.attachEvent("on" + type, handler); // IE 8
        else el.addEventListener(type, handler); // Other browsers
      }
      // Polyfill for matches method to ensure it works across browsers
      this &&
        this.Element &&
        (function (ElementPrototype) {
          ElementPrototype.matches =
            ElementPrototype.matches ||
            ElementPrototype.matchesSelector ||
            ElementPrototype.webkitMatchesSelector ||
            ElementPrototype.msMatchesSelector ||
            function (selector) {
              var node = this,
                nodes = (node.parentNode || node.document).querySelectorAll(selector),
                i = -1;
              while (nodes[++i] && nodes[i] != node);
              return !!nodes[i];
            };
        })(Element.prototype);
      // Live binding helper using matchesSelector
      function live(selector, event, callback, context) {
        addEvent(context || document, event, function (e) {
          var found,
            el = e.target || e.srcElement;
          // Loop through parent elements to find a match
          while (el && el.matches && el !== context && !(found = el.matches(selector))) el = el.parentElement;
          if (found) callback.call(el, e); // Call the callback if a match is found
        });
      }
      live(selector, event, callback, context); // Bind the event
    }
    const itemsection = `
 <section class="thumbtack-section thumbtack-section-variation">
  <!-- Tools -->
  <div class="tools">
    <h2>Tools to help grow and run your business.</h2>
    <div class="tools-logos desktoplogo">
      <img src="https://cdn.optimizely.com/img/20611073899/021ec6388201429c99179147686d0e1c.png" alt="ServiceTitan"> 
      <img src="https://cdn.optimizely.com/img/20611073899/57f5d09bb4314470b9e0d49bf048c349.png" alt="Chiiirp">
      <img src="https://cdn.optimizely.com/img/20611073899/ec9cabbec6ab40ab9566d32ea3351e32.png" alt="Housecall Pro">
      <img src="https://cdn.optimizely.com/img/20611073899/b9a22cdd12fd4ce498cfa067e3804faa.png" alt="Other Logo">
      <img src="https://cdn.optimizely.com/img/20611073899/71486fb119284fc8ad154ff88413196b.png" alt="Workiz">
      
    </div>
   <div class="tools-logos mobile_section">
  <img src="https://cdn.optimizely.com/img/20611073899/021ec6388201429c99179147686d0e1c.png" alt="ServiceTitan">
  <img src="https://cdn.optimizely.com/img/20611073899/b9a22cdd12fd4ce498cfa067e3804faa.png" alt="Other Logo">
  <img src="https://cdn.optimizely.com/img/20611073899/71486fb119284fc8ad154ff88413196b.png" alt="Workiz">
  <img src="https://cdn.optimizely.com/img/20611073899/57f5d09bb4314470b9e0d49bf048c349.png" alt="Chiiirp" style="max-width: 188px;">
  <img src="https://cdn.optimizely.com/img/20611073899/ec9cabbec6ab40ab9566d32ea3351e32.png" alt="Housecall Pro" style="max-width: 78px;">
</div>
  </div>
  <!-- Testimonials -->
  <div class="testimonials">
    <h2>Real results from real pros.</h2>
    <div class="testimonial-cards">
      <div class="card">
        <img src="https://cdn.optimizely.com/img/20611073899/f9f51c0108ce46fd997594c042ff44a4.png " alt="Alex">
        
        <p>"In the first year, I went from about $10K in revenue to almost $100K."</p>
        <span>— Beth B., founder of It’s Just Stuff</span>
      </div>
      <div class="card">
       <img src="https://cdn.optimizely.com/img/20611073899/0ed2c4ff5c404d3491db45c661364429.png" alt="Beth">
      
      <p>"When compared with other apps, Thumbtack is the best."</p>
        <span>— Alex T., Owner of Smart People Moving</span>
      </div>
      <div class="card">
        <img src="https://cdn.optimizely.com/img/20611073899/beb913574a624b4e993664ebe37fd1fa.png" alt="Mehdi">
        <p>"We invest our marketing budgets in different streams, but the best return we get is from Thumbtack."</p>
        <span>— Mehdi E., Owner of Step Up Home Improvements</span>
      </div>
    </div>
    <div class="testimonial-line"></div>
  </div>
  <!-- Calculator -->
  <div class="calculator">
    <h2>See your earning potential.</h2>
    <p>Use our Growth Calculator* to explore how your business could grow on Thumbtack. Enter your info into the calculator below to gain a clear view of what’s possible. 
</p>
    <form>
      <h6> Tell us about your business. </h6>
       <p>How much do you typically charge per job? </p>
      <input type="text" placeholder="Enter $ amount">
      <p>How many jobs do you expect to complete each month?<p>
      <input type="text" placeholder="Enter number">
      <div class="earnings">
        <h5>Potential earnings.* </h5>
        <div class="item_secotion_price">
        <div>Projected monthly revenue: <br> <span class="monthly_revenue">$0</span></div>
        <div>Projected annual revenue: <br><span class="year_revanu">$0</span></div>
        </div>
      </div>
    </form>
    <div class="subhead_cta">
    <p>*This tool is for informational purposes only. Actual earnings depend on various factors, including job demand, competition, and business operations and are subject to applicable Platform Fees and/or discounts. Thumbtack does not guarantee any specific earnings outcome.</p>
    <a>Grow with Thumbtack</a>
    </div>
  </div>
  <!-- Community -->
  <div class="community">
    <h2>Thumbtack’s Pro Community</h2>
    <p>Join a network of pros sharing tips, insights and strategies to help you win more work — whether you’re just getting started or scaling fast.</p>
     <a href="https://community.thumbtack.com/">Connect with other pros</a>
  </div>
</section>`;

    const thumbtackHTML = `
  <section class="thumbtack-section">
    <div class="container">
      <h2 class="title Type_title1__CjAkY mb5 tl m_tc">How Thumbtack works:</h2>
      <div class="feature-row">
        <!-- Feature 1 -->
        <div class="feature-item">
          <img src="https://cdn.optimizely.com/img/20611073899/4d658a3cf96941d499513bb919c6fb01.png" alt="Painting by Kay">
          <h3 class="Type_title6__pMyYO black">No subscription cost.</h3>
          <p class="ServiceCard_description__JpHs6">There's no charge to join, no annual fees and no membership fees.</p>
        </div>
        <!-- Feature 2 -->
        <div class="feature-item">
          <img src="https://cdn.optimizely.com/img/20611073899/10e08e94bd0b4b0691cb5841bb637c34.png" alt="Steve B. chat">
          <h3 class="Type_title6__pMyYO black">High intent customers.</h3>
          <p class="ServiceCard_description__JpHs6">You'll receive leads from customers that choose you, with high intent to hire.</p>
        </div>
        <!-- Feature 3 -->
        <div class="feature-item">
          <img src="https://cdn.optimizely.com/img/20611073899/eb4cabc88886477ab0fbbc2417eb9f14.png" alt="Insights dashboard">
          <h3 class="Type_title6__pMyYO black">Control and flexibility.</h3>
          <p class="ServiceCard_description__JpHs6">You control your pricing and budget for leads, which determines how many leads you get.</p>
        </div>
      </div>
       
    </div>
   </section>
`;
    const itemsection1 = `
  <h2 class="title Type_title1__CjAkY mb5 tl m_tc Thumbtack_different ">How Thumbtack is different:</h2>
<tbody class="see-how-different_featureComparisonChart__20mnw shadow-400 pv3 m_pv5">
   <tr class="see-how-different_chartBorderGray__wlJS2 grid grid-flush bb tl items-end pb2 mh3 m_mh6">
      <th class="col-4">
         <p class="Type_text3__wyjTq black-300 ttu b">Features</p>
      </th>
      <th class="col-4 tc">
         <div class="see-how-different_ttLogo__c39ls">
            <svg aria-label="Thumbtack logo" width="120" height="17" viewBox="0 0 156 21" fill="currentColor">
               <path fill-rule="evenodd" d="M115.67 17.929c-1.403 0-2.089-.873-2.087-1.777 0-1.183.88-1.775 1.99-1.93l3.781-.54v.685c-.001 2.71-1.858 3.562-3.685 3.562zm.76-12.358c4.344 0 7.108 2.157 7.108 6.395v8.613h-3.996l.016-1.702c-.8 1.202-2.517 2.124-4.642 2.123-3.425-.001-5.511-2.214-5.51-4.612 0-2.741 2.121-4.267 4.796-4.64 0 0 4.393-.52 5.017-.605 0-1.809-1.687-2.219-3.368-2.219-1.722 0-3.091.601-4.15 1.31l-1.567-2.727c1.643-1.162 3.802-1.936 6.296-1.936zm-92.81 1.99c1.09-1.449 2.716-1.962 4.39-1.962 3.475 0 5.954 2.308 5.954 5.702v9.306h-4.122v-8.04c0-2.11-1.105-3.272-2.985-3.272-1.769 0-3.237 1.1-3.237 3.303v8.01h-4.123V0h4.123v7.56zM78.18 11.3v9.306h-4.106v-8.04c0-2.11-1.121-3.272-2.985-3.272-1.769 0-3.238 1.1-3.238 3.303v8.01H63.73v-8.04c0-2.112-1.105-3.273-2.985-3.273-1.768 0-3.237 1.1-3.237 3.303v8.01h-4.122V5.991h4.011V7.71c1.09-1.553 2.764-2.112 4.502-2.112 2.21 0 4.027.95 5.053 2.504 1.185-1.855 3.19-2.504 5.196-2.504 3.6 0 6.033 2.308 6.033 5.702zm18.46 1.99c0 4.39-3.191 7.693-7.408 7.693-2.116 0-3.585-.814-4.58-1.99v1.613h-4.027V.015h4.106v7.5c.995-1.146 2.432-1.916 4.485-1.916 4.233 0 7.423 3.304 7.423 7.693zm-12.028 0c0 2.309 1.596 4.028 3.933 4.028 2.432 0 3.948-1.795 3.948-4.027 0-2.233-1.516-4.027-3.948-4.027-2.337 0-3.933 1.72-3.933 4.027zm54.715-4.931l-2.97 2.368c-.93-.95-1.926-1.463-3.268-1.463-2.132 0-3.838 1.599-3.838 4.027 0 2.443 1.69 4.027 3.822 4.027 1.326 0 2.464-.573 3.332-1.478l2.938 2.398c-1.437 1.765-3.586 2.745-6.143 2.745-4.881 0-8.15-3.258-8.15-7.692 0-4.42 3.269-7.693 8.15-7.693 2.557 0 4.72.996 6.127 2.76zm15.828-2.368l-5.544 5.463L156 20.607h-5.015l-4.264-6.617-1.864 1.84v4.777h-4.122V.015h4.122v11.41l5.338-5.433h4.961zM46.632 19.038C45.542 20.486 43.916 21 42.242 21c-3.475 0-5.954-2.307-5.954-5.701V5.992h4.122v8.039c0 2.111 1.105 3.273 2.985 3.273 1.769 0 3.237-1.101 3.237-3.303V5.99h4.122v14.616h-4.122v-1.569zM97.184 5.992h2.243V1.648h4.107v4.344h4.568v3.5h-4.568v6.183c0 1.023.741 1.644 1.553 1.644.855 0 1.967-.514 1.967-.514l1.328 3.131s-1.411 1.032-4.564 1.032c-2.085 0-4.391-1.507-4.391-4.434V9.49h-2.243v-3.5zm-85.924-.4v9.284c0 1.6-.44 3.173-1.277 4.56l-.926 1.532-.925-1.533a8.815 8.815 0 0 1-1.278-4.56V7.56c1.094-1.453 2.727-1.968 4.406-1.968zM0 3.937V0h18.115v3.937H0z"></path>
            </svg>
         </div>
      </th>
      <th class="col-4 tc">
         <div class="Type_title3___voqu dn m_db black-300">Other Services</div>
         <div class="Type_title6__pMyYO db m_dn black-300">Others</div>
      </th>
   </tr>
   <tr class="see-how-different_featureComparisonChartRow__4ctV6 grid grid-flush">
      <td class="see-how-different_chartBorderGray__wlJS2 col-4 tl pv4 br pl3 pr3 m_pl6 items-center itemheading">
         <div class="Type_title5__9a0XV dn m_db">Customers choose pros directly</div>
         <div class="Type_title7__9t_vN db m_dn">Customers choose pros directly</div>
      </td>
      <td class="col-4 tc pv4 items-center crethumbimag">
        <img src="https://cdn.optimizely.com/img/20611073899/43aa1e79bf8d4c6bbf35482fa60f64d7.svgz">
      </td>
      <td class="col-4 tc pv4 pr3 m_pr6 items-center crethumbimag">
         <img src="https://cdn.optimizely.com/img/20611073899/0faa22d35df54eb8ac543c5a6b374f2e.svgz">
      </td>
   </tr>
   <tr class="see-how-different_featureComparisonChartRow__4ctV6 grid grid-flush itemheading">
      <td class="see-how-different_chartBorderGray__wlJS2 col-4 tl pv4 br pl3 pr3 m_pl6 items-center">
         <div class="Type_title5__9a0XV dn m_db">Pros control their pricing</div>
         <div class="Type_title7__9t_vN db m_dn">Pros control their pricing</div>
      </td>
      <td class="col-4 tc pv4 items-center crethumbimag">
        <img src="https://cdn.optimizely.com/img/20611073899/43aa1e79bf8d4c6bbf35482fa60f64d7.svgz">
      </td> 
      <td class="col-4 tc pv4 pr3 m_pr6 items-center crethumbimag">
         <img src="https://cdn.optimizely.com/img/20611073899/0faa22d35df54eb8ac543c5a6b374f2e.svgz">
      </td>
   </tr>
   <tr class="see-how-different_featureComparisonChartRow__4ctV6 grid grid-flush itemheading">
      <td class="see-how-different_chartBorderGray__wlJS2 col-4 tl pv4 br pl3 pr3 m_pl6 items-center">
         <div class="Type_title5__9a0XV dn m_db">Direct customer communication</div>
         <div class="Type_title7__9t_vN db m_dn">Direct customer communication</div>
      </td>
      <td class="col-4 tc pv4 items-center crethumbimag">
        <img src="https://cdn.optimizely.com/img/20611073899/43aa1e79bf8d4c6bbf35482fa60f64d7.svgz">
      </td>
      <td class="col-4 tc pv4 pr3 m_pr6 items-center crethumbimag">
         <img src="https://cdn.optimizely.com/img/20611073899/0faa22d35df54eb8ac543c5a6b374f2e.svgz">
      </td>
   </tr>
   <tr class="see-how-different_featureComparisonChartRow__4ctV6 grid grid-flush itemheading">
      <td class="see-how-different_chartBorderGray__wlJS2 col-4 tl pv4 br pl3 pr3 m_pl6 items-center">
         <div class="Type_title5__9a0XV dn m_db">Limited competition per lead</div>
         <div class="Type_title7__9t_vN db m_dn">Limited competition per lead</div>
      </td>
      <td class="col-4 tc pv4 items-center crethumbimag">
        <img src="https://cdn.optimizely.com/img/20611073899/43aa1e79bf8d4c6bbf35482fa60f64d7.svgz">
      </td>
      <td class="col-4 tc pv4 pr3 m_pr6 items-center crethumbimag">
         <img src="https://cdn.optimizely.com/img/20611073899/0faa22d35df54eb8ac543c5a6b374f2e.svgz">
      </td>
   </tr>
   <tr class="see-how-different_featureComparisonChartRow__4ctV6 grid grid-flush itemheading">
      <td class="see-how-different_chartBorderGray__wlJS2 col-4 tl pv4 br pl3 pr3 m_pl6 items-center">
         <div class="Type_title5__9a0XV dn m_db">No hidden fees or contracts</div>
         <div class="Type_title7__9t_vN db m_dn">No hidden fees or contracts</div>
      </td>
      <td class="col-4 tc pv4 items-center crethumbimag">
        <img src="https://cdn.optimizely.com/img/20611073899/43aa1e79bf8d4c6bbf35482fa60f64d7.svgz">
      </td>
      <td class="col-4 tc pv4 pr3 m_pr6 items-center crethumbimag">
         <img src="https://cdn.optimizely.com/img/20611073899/0faa22d35df54eb8ac543c5a6b374f2e.svgz">
      </td>
   </tr>
   <tr class="see-how-different_featureComparisonChartRow__4ctV6 grid grid-flush itemheading">
      <td class="see-how-different_chartBorderGray__wlJS2 col-4 tl pv4 br pl3 pr3 m_pl6 items-center">
         <div class="Type_title5__9a0XV dn m_db">Free pro community</div>
         <div class="Type_title7__9t_vN db m_dn">Free pro community</div>
      </td>
      <td class="col-4 tc pv4 items-center crethumbimag">
        <img src="https://cdn.optimizely.com/img/20611073899/43aa1e79bf8d4c6bbf35482fa60f64d7.svgz">
      </td>
      <td class="col-4 tc pv4 pr3 m_pr6 items-center crethumbimag">
         
         <img src="https://cdn.optimizely.com/img/20611073899/0faa22d35df54eb8ac543c5a6b374f2e.svgz">
      
      </td>
   </tr>
 
   
</tbody>`
      ;

    /* Variation Init */
    function init() {

      document.querySelector("body").classList.add(variation_name);

      var h1 = document.querySelector('[class*="hero_heroInnerOffsetRight"] [class*="hero_heroTitle"]');
      if (h1) {
        var parts = h1.innerHTML.split('<br>');
        if (parts.length === 2) {
          parts[0] = 'Grow your business in ';
          h1.innerHTML = parts.join('<br>');
        }
      }
      var target = document.querySelector('html body [class*="hero_heroInnerOffsetRight"] [class*="hero_heroTitle"]');
      var alreadyExists = document.querySelector('.section_topimage');

      if (target && !alreadyExists) {
        target.insertAdjacentHTML('beforebegin', `
                  <div class="section_topimage">
                      <img src="https://cdn.optimizely.com/img/20611073899/d508327bdcc04e8591cae24b52e19157.svgz">
                  </div>
              `);
      }
      const target1 = document.querySelector('[class*="see-how-different_seeHowDifferentSection"] [class*="Wrap_root"] .grid.grid-wide');
      if (target1 && !document.querySelector('.thumbtack-section')) {
        target1.insertAdjacentHTML('afterend', thumbtackHTML);
      }
      const inputField = document.querySelector('[placeholder="e.g. House cleaning"]');
      if (inputField) {
        inputField.setAttribute('placeholder', 'Enter the service you provide to get started.');
      }
      const targetTableBody = document.querySelector('[class*="see-how-different_featureComparisonTable"] > tbody');
      const existingHeading = document.querySelector('.ttheading');
      if (targetTableBody && !existingHeading) {
        targetTableBody.insertAdjacentHTML(
          'beforebegin',
          '<h2 class="title Type_title1__CjAkY mb5 tl m_tc ttheading">How Thumbtack is different:</h2>'
        );
      }
      waitForElement('[class*="see-how-different_featureComparisonTable"]', function () {

        document.querySelector('[class*="see-how-different_featureComparisonTable"]').innerHTML = itemsection1;
      }, 100, 15000);

      waitForElement('[class*="see-how-different_seeHowDifferentSection"] > div', function () {
        const target = document.querySelector('[class*="see-how-different_seeHowDifferentSection"] > div');

        // Check if target exists and button not already added
        if (target && !document.querySelector('#ttsearch-location-input')) {
          target.insertAdjacentHTML('afterend', '<div id="ttsearch-location-input">Sign up for free</div>');

          // Add scroll to top on click
          const cta = document.querySelector('#ttsearch-location-input');
          if (cta) {
            cta.addEventListener('click', function () {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            });
          }
        }
      }, 100, 15000);

      waitForElement('[data-testid="get-started-button-mobile"] span', function () {
        document.querySelector('[data-testid="get-started-button-mobile"] span').innerHTML = "Sign up for free"
      }, 100, 15000);
      if (window.innerWidth < 768) {
        waitForElement('#new-pro-lp-cs', function () {
          document.querySelector('#new-pro-lp-cs').setAttribute("placeholder", "Enter the service you provide.");
        }, 100, 15000);
      }

      // Add the new section after the "See how Thumbtack is different" section


      waitForElement('[data-testid="get-started-button-mobile"] span', function () {

        if (!document.querySelector('.thumbtack-section-variation')) {
          document.querySelector('[class*="see-how-different_seeHowDifferentSection"]').insertAdjacentHTML("afterend", itemsection);
        }

      }, 100, 15000);

      //   document.querySelector('.tt_clicksignup').addEventListener('click', function () {
      //     document.querySelector('[class*="get-started_titlePadding"] button').click(); // Trigger the click on the "Get Started" button
      //   });


      // Wait until both input fields exist
      waitForElement('input[placeholder="Enter $ amount"]', function () {
        const perJobInput = document.querySelector('input[placeholder="Enter $ amount"]');
        const jobsPerMonthInput = document.querySelector('input[placeholder="Enter number"]');
        const monthlyRevenueEl = document.querySelector('.monthly_revenue');
        const yearlyRevenueEl = document.querySelector('.year_revanu');

        if (!perJobInput || !jobsPerMonthInput || !monthlyRevenueEl || !yearlyRevenueEl) return;

        function createErrorElement(input) {
          if (!input) return null;
          let errorEl = input.nextElementSibling;
          if (!errorEl || !errorEl.classList.contains('input-error')) {
            errorEl = document.createElement('div');
            errorEl.className = 'input-error';
            errorEl.style.color = 'red';
            errorEl.style.fontSize = '14px';
            errorEl.style.marginTop = '5px';
            errorEl.style.display = 'none';
            input.insertAdjacentElement('afterend', errorEl);
          }
          return errorEl;
        }

        const perJobErrorEl = createErrorElement(perJobInput);
        const jobsErrorEl = createErrorElement(jobsPerMonthInput);

        function cleanCurrencyInput(value) {
          return parseFloat(value.replace(/[^0-9.]/g, ''));
        }

        function calculateEarnings() {
          const perJobValue = perJobInput.value.trim();
          const jobsValue = jobsPerMonthInput.value.trim();
          let hasError = false;

          if (perJobValue === '') {
            if (perJobErrorEl) {
              perJobErrorEl.textContent = 'Please add value';
              perJobErrorEl.style.display = 'block';
            }
            hasError = true;
          } else if (perJobErrorEl) {
            perJobErrorEl.style.display = 'none';
          }

          if (jobsValue === '') {
            if (jobsErrorEl) {
              jobsErrorEl.textContent = 'Please add value';
              jobsErrorEl.style.display = 'block';
            }
            hasError = true;
          } else if (jobsErrorEl) {
            jobsErrorEl.style.display = 'none';
          }

          if (!hasError) {
            const perJobCost = cleanCurrencyInput(perJobValue);
            const jobsPerMonth = parseFloat(jobsValue);
            if (!isNaN(perJobCost) && !isNaN(jobsPerMonth)) {
              const monthlyRevenue = perJobCost * jobsPerMonth;
              const yearlyRevenue = monthlyRevenue * 12;
              monthlyRevenueEl.textContent = "$" + monthlyRevenue.toLocaleString();
              yearlyRevenueEl.textContent = "$" + yearlyRevenue.toLocaleString();
            } else {
              monthlyRevenueEl.textContent = "$0";
              yearlyRevenueEl.textContent = "$0";
            }
          } else {
            monthlyRevenueEl.textContent = "$0";
            yearlyRevenueEl.textContent = "$0";
          }
        }

        function resetRevenueOnEmpty() {
          if (perJobInput.value.trim() === '' || jobsPerMonthInput.value.trim() === '') {
            monthlyRevenueEl.textContent = "$0";
            yearlyRevenueEl.textContent = "$0";
          }
        }

        // Attach input listeners
        perJobInput.addEventListener('input', resetRevenueOnEmpty);
        jobsPerMonthInput.addEventListener('input', resetRevenueOnEmpty);

        //  Safe CTA listener binding
        waitForElement('.subhead_cta a', function () {
          const ctaButton = document.querySelector('.subhead_cta a');
          if (ctaButton) {
            ctaButton.addEventListener('click', function (e) {
              e.preventDefault();
              calculateEarnings();
            });
          }
        }, 50, 15000);
      }, 50, 15000);

      (function () {
        const currentURL = window.location.href;
        
        if (currentURL.includes("coBrand")) {
         document.querySelector("body").classList.add("cobrand-variation");
        }
      })();

    }

    /* Initialise variation */
    function thumbtackTest144(list, observer) {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === "mark" && entry.name === "afterHydrate") {
          observer.disconnect(); // Stop observing
          clearInterval(test144Interval); // Clear interval
          waitForElement("body", init, 50, 15000); // Initialize the variation after hydration
          window.isHydrated = true;
        }
      });
    }
    // Check hydration status and initiate
    if (!window.isHydrated) {
      var test144Interval = setInterval(function () {
        waitForElement("body", init, 50, 15000); // Wait for body to load
      }, 50);
      setTimeout(function () {
        clearInterval(test144Interval); // Stop the interval after 3 seconds
      }, 3000);
      const observer = new PerformanceObserver(thumbtackTest144);
      observer.observe({ entryTypes: ["mark"] }); // Start observing performance marks
    } else {
      waitForElement("body", init, 50, 15000); // If already hydrated, initialize immediately
    }
  } catch (e) {
    if (debug) console.log(e, "error in Test" + variation_name); // Log errors if debug is enabled
  }
})();
}},{"type":"append","selector":"head","value":"<style>html body.pro-page-updte .thumbtack-section-variation .tools {\n  text-align: center;\n  margin-bottom: 50px;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .tools h2 {\n  font-size: 32px;\n  font-weight: bold;\n  margin-bottom: 30px;\n  line-height: 40px;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .tools-logos {\n  display: flex;\n  justify-content: center;\n  flex-wrap: wrap;\n  gap: 40px;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .tools-logos img {\n  max-height: 32px;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .testimonials {\n  text-align: center;\n  margin-bottom: 60px;\n  margin-top: 126px;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .testimonials h2 {\n  font-size: 32px;\n  font-weight: bold;\n  margin-bottom: 40px;\n  line-height: 40px;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .testimonial-cards {\n  display: flex;\n  justify-content: center;\n  flex-wrap: wrap;\n  gap: 40px;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .card {\n  max-width: 300px;\n  text-align: center;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .card img {\n  width: 180px;\n  height: 180px;\n  border-radius: 50%;\n  object-fit: cover;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .subhead_cta a,\nhtml body.pro-page-updte .thumbtack-section-variation .community a {\n  color: #7cdcfd;\n  background-color: #07344a;\n  border-color: #07344a;\n  max-width: 325px;\n  margin-top: 25px;\n  padding: 14px;\n  border-radius: 9999px;\n  box-shadow: none;\n  border: none;\n  font-size: 16px;\n  display: inline-block;\n  width: 100%;\n  font-weight: 700;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .subhead_cta a:hover,\nhtml body.pro-page-updte .thumbtack-section-variation .community a:hover {\n  color: #7cdcfd;\n  background-color: #1f2022;\n  border-color: #1f2022;\n}\n\nhtml\n  body.pro-page-updte\n  .thumbtack-section-variation\n  .calculator\n  .subhead_cta\n  p {\n  margin: 0 auto;\n  max-width: 961px;\n  margin-top: 51px;\n  font-size: 12px;\n  color: #2f3033;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .card p {\n  font-size: 16px;\n  margin: 20px 0 10px;\n  line-height: 24px;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .item_secotion_price div {\n  font-size: 16px;\n  line-height: 24px;\n  color: #2f3033;\n  font-weight: 400;\n  /* margin-bottom: 30px; */\n}\n\nhtml\n  body.pro-page-updte\n  .thumbtack-section-variation\n  .item_secotion_price\n  div\n  span {\n  font-size: 40px;\n  line-height: 46px;\n  color: #009fd9;\n  margin-top: 12px;\n  display: inline-block;\n  font-weight: 700;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .card span {\n  font-weight: bold;\n  font-size: 16px;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .calculator {\n  text-align: center;\n  margin-bottom: 60px;\n  margin-top: 60px;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .calculator h2 {\n  font-size: 32px;\n  font-weight: bold;\n  margin-bottom: 9px;\n  line-height: 40px;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .calculator > p {\n  max-width: 772px;\n  margin: 0 auto;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .calculator p {\n  font-size: 14px;\n  margin-bottom: 30px;\n  color: #2f3033;\n  margin-top: 16px;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .calculator form {\n  max-width: 964px;\n  margin: 0 auto;\n  text-align: left;\n  margin-top: 63px;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .calculator form h6 {\n  font-size: 24px;\n  font-weight: 700;\n  line-height: 32px;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .calculator form p {\n  font-size: 16px;\n  margin-bottom: 9px;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .calculator input {\n  padding: 12px;\n  margin-bottom: 15px;\n  border: 1px solid #676d73;\n  border-radius: 9999px;\n  font-size: 14px;\n  width: 100%;\n  height: 55px;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .earnings {\n  margin-top: 38px;\n  justify-content: space-between;\n  font-size: 16px;\n  font-weight: bold;\n  color: #3ec6f2;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .item_secotion_price {\n  display: flex;\n  gap: 30px;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .earnings h5 {\n  font-size: 24px;\n  line-height: 32px;\n  color: #2f3033;\n  margin-bottom: 15px;\n  font-weight: 700;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .community {\n  background-image: url(https://cdn.optimizely.com/img/20611073899/0e619b45df8542db88486806dfb6f0ec.jpg);\n  /* Replace with actual image */\n  background-size: cover;\n  background-position: center;\n  padding: 80px 20px;\n  text-align: center;\n  color: white;\n  /* border-radius: 12px; */\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .community h2 {\n  font-size: 32px;\n  font-weight: bold;\n  line-height: 40px;\n  margin-bottom: 12px;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .community p {\n  max-width: 470px;\n  margin: 0 auto;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .community button {\n  background: #00aaff;\n  color: white;\n  padding: 15px 30px;\n  border: none;\n  border-radius: 8px;\n  font-size: 16px;\n  cursor: pointer;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .community button:hover {\n  background: #008fcc;\n}\n\nhtml\n  body.pro-page-updte\n  .thumbtack-section-variation\n  section.thumbtack-section {\n  padding-top: 50px;\n}\n\nhtml\n  body.pro-page-updte\n  .thumbtack-section-variation\n  section.thumbtack-section\n  ~ div {\n  display: none;\n}\n\nhtml\n  body.pro-page-updte\n  .thumbtack-section-variation\n  section.thumbtack-section\n  ~ div:last-child {\n  display: block;\n}\n\nhtml body.pro-page-updte .thumbtack-section-variation .testimonial-line {\n  border-bottom: 1px solid #d3d4d5;\n  max-width: 978px;\n  margin: 0 auto;\n  margin-top: 70px;\n  width: 100%;\n}\n\n@media (max-width: 768px) {\n  html body.pro-page-updte .thumbtack-section-variation .testimonial-cards {\n    flex-direction: column;\n    align-items: center;\n  }\n\n  html body.pro-page-updte .thumbtack-section-variation .earnings {\n    flex-direction: column;\n    gap: 10px;\n    align-items: center;\n  }\n\n  html body.pro-page-updte .thumbtack-section-variation .item_secotion_price {\n    display: block;\n  }\n\n  html\n    body.pro-page-updte\n    .thumbtack-section-variation\n    .item_secotion_price\n    div:last-child {\n    margin-top: 20px;\n  }\n\n  html\n    body.pro-page-updte\n    .thumbtack-section-variation\n    .tools-logos.desktoplogo {\n    display: none;\n  }\n}\n\n@media (min-width: 769px) {\n  html\n    body.pro-page-updte\n    .thumbtack-section-variation\n    .tools-logos.mobile_section {\n    display: none;\n  }\n}\n\n@media screen and (max-width: 600px) {\n  html body.pro-page-updte .thumbtack-section-variation .tools,\n  html body.pro-page-updte .thumbtack-section-variation .testimonials,\n  html body.pro-page-updte .thumbtack-section-variation .calculator {\n    padding: 0 15px;\n  }\n\n  html body.pro-page-updte .thumbtack-section-variation .community {\n    background-image: url(https://cdn.optimizely.com/img/20611073899/8a172aac42ea4df5a1916ac59f347f07.jpg);\n  }\n\n  html body.pro-page-updte .thumbtack-section-variation .tools-logos {\n    gap: 20px;\n  }\n\n  html body.pro-page-updte .thumbtack-section-variation .testimonials {\n    margin-top: 70px;\n  }\n\n  html body.pro-page-updte .thumbtack-section-variation .community {\n    border-radius: 0px;\n  }\n}\n\n/* Additional styles for better responsiveness */\nhtml body.pro-page-updte [class*='hero_heroInnerOffsetLeft'] {\n  display: none;\n}\n\n@media (min-width: 701px) {\n  html\n    body.pro-page-updte\n    [class*='hero_heroInnerOffsetRight']\n    [class*='hero_heroTitle'] {\n    font-size: 40px !important;\n    line-height: 54px;\n    color: #2f3033 !important;\n  }\n\n  html\n    body.pro-page-updte\n    [class*='hero_heroInnerOffsetRight']\n    > [class*='Type_text1'] {\n    font-size: 32px !important;\n    padding-right: 0 !important;\n    color: #2f3033 !important;\n    margin-top: 15px;\n  }\n}\n\nhtml\n  body.pro-page-updte\n  [class*='hero_heroInnerOffsetRight']\n  [class*='hero_heroTitle']\n  br {\n  display: none;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='hero_heroInnerContainer']\n  [class*='hero_heroInnerOffsetRight'] {\n  max-width: 743px;\n  width: 100% !important;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='hero_heroInnerOffsetRight']\n  [class*='hero_heroTitle'],\nhtml\n  body.pro-page-updte\n  [class*='hero_heroInnerOffsetRight']\n  > [class*='Type_text1'] {\n  text-align: center;\n  padding-right: 0 !important;\n  display: block !important;\n  line-height: 36px !important;\n}\n\nhtml body.pro-page-updte [class*='hero_heroCategoryTaxonSearchBox'] {\n  padding-bottom: 15px !important;\n  box-shadow: none !important;\n  background-color: transparent !important;\n}\n\nhtml body.pro-page-updte [class*='pro-search-signup_mainWrapper'] > div p {\n  display: none;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='composable-customer-header_root']\n  + .bg-gray-200 {\n  background-color: #fff !important;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='pro-search-signup_mainWrapper']\n  [class*='TextInput_inputIconContainer']\n  svg {\n  fill: #2f3033;\n  width: 21px;\n  height: 28px;\n}\n\nhtml body.pro-page-updte [class*='hero_heroCategoryTaxonSearchBox'] + div {\n  text-align: center !important;\n  margin-top: 0 !important;\n  margin-bottom: 50px !important;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='hero_heroCategoryTaxonSearchBox']\n  + div\n  [class*='Type_text1'] {\n  padding-right: 0 !important;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='hero_heroCategoryTaxonSearchBox']\n  + div\n  [class*='Type_text1']\n  * {\n  font-weight: 400 !important;\n}\n\nhtml body.pro-page-updte .section_topimage {\n  text-align: center;\n}\n\n/* section style */\n/* Reset and base styles */\nhtml body.pro-page-updte .thumbtack-section {\n  padding: 25px 0px;\n  text-align: center;\n  padding-bottom: 60px;\n}\n\nhtml body.pro-page-updte .container {\n  max-width: 1200px;\n  margin: 0 auto;\n}\n\nhtml body.pro-page-updte .title {\n  font-size: 32px;\n  font-weight: 600;\n  margin-bottom: 60px;\n  color: #222;\n}\n\nhtml body.pro-page-updte .feature-row {\n  display: flex;\n  justify-content: space-between;\n  flex-wrap: wrap;\n  gap: 40px;\n  margin-top: 80px;\n}\n\nhtml body.pro-page-updte .feature-item {\n  flex: 1 1 30%;\n  max-width: 320px;\n  margin: 0 auto;\n}\n\nhtml body.pro-page-updte .feature-item img {\n  width: 100%;\n  height: auto;\n  border-radius: 20px;\n  margin-bottom: 30px;\n}\n\nhtml body.pro-page-updte .feature-item h3 {\n  font-size: 16px !important;\n  line-height: 24px !important;\n  font-weight: 700 !important;\n}\n\nhtml body.pro-page-updte .feature-item p {\n  font-size: 15px;\n  color: #555;\n  line-height: 1.5;\n}\n\nhtml\n  body.pro-page-updte\n  .see-how-different_seeHowDifferentSection__XzCyL:before {\n  display: none;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='see-how-different_seeHowDifferentSection']\n  [class*='Wrap_root']\n  > div\n  > h2,\nhtml\n  body.pro-page-updte\n  [class*='see-how-different_seeHowDifferentSection']\n  [class*='Wrap_root']\n  > div\n  > h2\n  + div {\n  display: none !important;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='hero_heroInnerOffsetRight']\n  > [class*='Type_text1']\n  span {\n  font-weight: 400 !important;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='pro-search-signup_mainWrapper']\n  .relative.mv2\n  [for='new-pro-lp-cs']\n  + [class*='TextInput_root']\n  > div\n  > div:before {\n  content: ' ';\n  height: 20px;\n  width: 20px;\n  background-size: contain;\n  background-image: url(https://cdn.optimizely.com/img/20611073899/35159129023748fb818ab5022863bbee.svgz);\n}\n\nhtml\n  body.pro-page-updte\n  [class*='pro-search-signup_mainWrapper']\n  .relative.mv2\n  [for='new-pro-lp-cs']\n  + [class*='TextInput_root']\n  > div\n  > div\n  svg {\n  display: none;\n}\n\n/* style for tabel section */\nhtml body.pro-page-updte [class*='see-how-different_featureComparisonChart'] {\n  box-shadow: none !important;\n  padding-top: 0px !important;\n  padding-bottom: 0 !important;\n  border-radius: 0;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='see-how-different_featureComparisonChart']\n  td {\n  padding-top: 4px !important;\n  padding-bottom: 4px !important;\n  padding-left: 0 !important;\n  padding-right: 0 !important;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='see-how-different_featureComparisonChart']\n  tr\n  [class*='see-how-different_chartBorderGray'] {\n  display: flex;\n  padding-left: 12px !important;\n}\n\nhtml body.pro-page-updte .flex.w-100.bg-gray-200.relative {\n  background-color: #fff !important;\n}\n\nhtml body.pro-page-updte [class*='see-how-different_seeHowDifferentSection'] {\n  background-color: #fafafa !important;\n}\n\nhtml body.pro-page-updte [class*='see-how-different_greenThumbsUpIcon'] {\n  color: #009fd9;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='see-how-different_chartBorderGray']\n  th:first-child\n  p,\nhtml\n  body.pro-page-updte\n  [class*='see-how-different_chartBorderGray']\n  th:nth-child(3)\n  div {\n  font-size: 16px !important;\n  color: #2f3033 !important;\n}\n\nhtml body.pro-page-updte [class*='see-how-different_chartBorderGray'] {\n  border-bottom: none !important;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='see-how-different_featureComparisonChart']\n  tr:first-child {\n  background-color: #fafafa;\n  margin-left: 0 !important;\n  margin-right: 0 !important;\n  padding-left: 12x;\n  padding-right: 0px !important;\n  border-bottom: none !important;\n}\n\nhtml\n  body.pro-page-updte.pro-page-updte\n  [class*='see-how-different_featureComparisonChart']\n  td\n  div {\n  font-size: 16px !important;\n  line-height: 24px !important;\n  font-weight: 400 !important;\n  color: #2f3033;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='see-how-different_featureComparisonChart']\n  tr:first-child\n  th:first-child {\n  padding-left: 12px !important;\n}\n\n.crethumbimag img {\n  margin-top: 7px;\n}\n\nhtml body.pro-page-updte html body.pro-page-updte .thumbtack-section-variation {\n  margin-bottom: 80px !important;\n  text-align: center !important;\n}\n\nhtml body.pro-page-updte #ttsearch-location-input {\n  color: #7cdcfd;\n  background-color: #07344a;\n  border-color: #07344a;\n  margin-top: 51px;\n  max-width: 378px;\n  margin: 0 auto;\n  margin-top: 0;\n  padding: 12px 22px;\n  border-radius: 9999px;\n  cursor: pointer;\n  text-align: center;\n  margin-bottom: 68px;\n  font-weight: 700;\n}\n\nhtml body.pro-page-updte #ttsearch-location-input:hover {\n  background-color: #1f2022;\n  border-color: #1f2022;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='pro-search-signup_mainWrapper']\n  input::placeholder,\nhtml\n  body.pro-page-updte\n  [class*='pro-search-signup_mainWrapper']\n  textarea::placeholder {\n  color: #2f3033;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='pro-search-signup_mainWrapper']\n  .relative.mv2\n  + .relative.mv2\n  div\n  > div\n  > div:before {\n  content: ' ';\n  height: 20px;\n  width: 20px;\n  background-size: contain;\n  background-image: url(https://cdn.optimizely.com/img/20611073899/59ac46be5ada4f5c911f41170d2eebff.svgz);\n}\n\nhtml\n  body.pro-page-updte\n  [class*='pro-search-signup_mainWrapper']\n  .relative.mv2\n  + .relative.mv2\n  div\n  > div\n  > div\n  svg {\n  display: none;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='pro-search-signup_mainWrapper']\n  .relative.mv2\n  + .relative.mv2 {\n  margin-top: 19px !important;\n  padding-bottom: 0 !important;\n  margin-bottom: 0 !important;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='pro-search-signup_mainWrapper']\n  .relative.mv2\n  + .relative.mv2\n  + div {\n  margin-top: 11px !important;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='pro-search-signup_mainWrapper']\n  .relative.mv2\n  + .relative.mv2\n  + div\n  + div {\n  margin-top: 19px !important;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='pro-search-signup_mainWrapper']\n  .relative.mv2\n  + .relative.mv2\n  + div {\n  display: none !important;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='see-how-different_featureComparisonChartRow']:nth-child(2n + 1) {\n  background-color: #fafafa;\n}\n\nhtml\n  body.pro-page-updte\n  [class*='see-how-different_featureComparisonChartRow']:nth-child(2n) {\n  background-color: transparent !important;\n}\n\n/* Responsive for small screens */\nhtml body.pro-page-updte #new-pro-lp-cs,\nhtml\n  body.pro-page-updte\n  [class*='pro-search-signup_mainWrapper']\n  .relative.mv2\n  [class*='TextInput_inputInnerElement'],\nhtml body.pro-page-updte #search-location-input {\n  background-color: #fafafa !important;\n  border-top-right-radius: 9999px !important;\n  border-bottom-left-radius: 0px !important;\n  border-bottom-right-radius: 9999px !important;\n  border-top-left-radius: 0px !important;\n}\n\nhtml\n  body.pro-page-updte\n   [class*='pro-search-signup_mainWrapper']\n  .relative.mv2\n  [class*='TextInput_input']\n{\n  border-top-right-radius: 0px !important;\n  border-bottom-right-radius: 0px !important;\n  border-top-left-radius: 9999px !important;\n  border-bottom-left-radius: 9999px !important;\n}\n\n\n\n\nhtml body.pro-page-updte [class*='pro-search-signup_mainWrapper'] [class*='TextInput_inputStylesRoundedBordersLeft'] {\n  border-style: none;\n}\n\n@media screen and (max-width: 768px) {\n  html body.pro-page-updte .feature-row {\n    flex-direction: column;\n    align-items: center;\n  }\n\n  html body.pro-page-updte .feature-item {\n    max-width: 90%;\n  }\n\n  html body.pro-page-updte .title {\n    font-size: 26px;\n    margin-bottom: 40px;\n  }\n\n  html body.pro-page-updte .section_topimage img {\n    max-width: 300px;\n  }\n\n  html\n    body.pro-page-updte\n    [class*='hero_heroInnerOffsetRight']\n    [class*='hero_heroTitle'] {\n    display: block !important;\n    color: #2f3033 !important;\n  }\n\n  html body.pro-page-updte .shadow-400.br-pill.m_shadow-none svg {\n    display: none !important;\n  }\n\n  [class*='hero_heroCategoryTaxonSearchBox'] + div > p:first-child {\n    display: none;\n  }\n\n  html\n    body.pro-page-updte\n    [class*='see-how-different_featureComparisonTable']\n    [class*='see-how-different_featureComparisonChart'] {\n    background-color: transparent;\n  }\n\n  html\n    body.pro-page-updte\n    [class*='see-how-different_featureComparisonTable']\n    [class*='see-how-different_featureComparisonChart']\n    tr {\n    margin-bottom: 20px;\n  }\n\n  html\n    body.pro-page-updte\n    [class*='see-how-different_featureComparisonTable']\n    [class*='see-how-different_featureComparisonChart']\n    tr:first-child {\n    display: none !important;\n  }\n\n  html body.pro-page-updte .thumbtack-section-variation {\n    margin-bottom: 40px !important;\n  }\n\n  html\n    body.pro-page-updte.pro-page-updte\n    [class*='see-how-different_featureComparisonChart']\n    td:first-child {\n    padding-right: 12px !important;\n    padding-left: 5px !important;\n    border: none !important;\n  }\n\n  html body.pro-page-updte .crethumbimag img {\n    width: 33px;\n  }\n\n  html body.pro-page-updte .crethumbimag img {\n    margin-top: 16px;\n  }\n\n  html\n    body.pro-page-updte\n    [class*='see-how-different_featureComparisonChart']\n    tr:first-child\n    th:first-child {\n    padding-left: 5px !important;\n  }\n\n  html\n    body.pro-page-updte.pro-page-updte\n    [class*='see-how-different_featureComparisonChart']\n    td\n    div {\n    line-height: 18px !important;\n  }\n\n  html\n    body.pro-page-updte\n    [class*='hero_heroInnerOffsetRight']\n    > [class*='Type_text1'] {\n    margin-bottom: 0 !important;\n    color: #2f3033 !important;\n    font-size: 24px !important;\n    line-height: 30px !important;\n  }\n\n  html body.pro-page-updte section.thumbtack-section > div h2 {\n    text-align: center !important;\n  }\n\n  html body.pro-page-updte [class*='hero_heroCategoryTaxonSearchBox'] + div {\n    margin-bottom: 0 !important;\n  }\n\n  html body.pro-page-updte .shadow-400.br-pill.m_shadow-none {\n    background-color: transparent;\n    box-shadow: none !important;\n  }\n\n  html body.pro-page-updte .shadow-400.br-pill.m_shadow-none .dn.m_di {\n    display: inline-block !important;\n    margin-left: 3px;\n  }\n\n  html\n    body.pro-page-updte\n    [class*='see-how-different_featureComparisonChartRow']:nth-child(2n) {\n    background-color: transparent !important;\n  }\n\n  html body.pro-page-updte #ttsearch-location-input {\n    max-width: 325px;\n    border-radius: 2.5px;\n  }\n\n  html body.pro-page-updte .feature-row {\n    margin-top: 40px;\n  }\n\n  html\n    body.pro-page-updte\n    [class*='see-how-different_seeHowDifferentSection']\n    > div\n    > div {\n    padding-top: 20px !important;\n  }\n}\n\n@media screen and (max-width: 390px) {\n  html\n    body.pro-page-updte\n    [class*='hero_heroInnerOffsetRight']\n    [class*='hero_heroTitle'] {\n    margin: 0 20px;\n  }\n}\n\n.thumbtack-section-variation ~ * {\n  display: none;\n}\n\n.thumbtack-section-variation ~ *:last-child {\n  display: block;\n}\n\n@media (max-width: 970px) and (min-width: 750px) {\n  html body.pro-page-updte .thumbtack-section-variation .calculator form {\n    padding: 0 20px;\n  }\n}\n\nhtml body.pro-page-updte .thumbtack-section.thumbtack-section-variation {\n  padding-top: 60px;\n  padding-bottom: 0;\n}\n\n@media screen and (max-width: 768px) {\n  html body.pro-page-updte .title {\n    text-align: center !important;\n  }\n}\n\n.thumbtack-section-variation ~ .relative + div {\n  display: block;\n  margin-bottom: 30px;\n  border-bottom: none;\n}\nhtml body.pro-page-updte.cobrand-variation .tools {\n  display: none;\n}\nhtml\n  body.pro-page-updte.cobrand-variation\n  .thumbtack-section-variation\n  .testimonials {\n  margin-top: 0;\n}</style>"}],"viewId":"5187591159414784"}],"decisions":[{"layerId":"4521182595121152","experimentId":"6329439777193984","experimentName":"[Apr 24 2025] SHIP - Pro Landing Page: Update testimonials","variationId":"5978197351727104","variationName":"V1: New testimonial section","isLayerConcluded":false,"viewId":"29727970011"},{"layerId":"4917354532962304","experimentId":"6405370246070272","experimentName":"CTA Copy & Pricing Transparency","variationId":"4878840823021568","variationName":"Original","isLayerConcluded":false,"viewId":"5463746112389120"},{"layerId":"5028798649860096","experimentId":"6154131621019648","experimentName":"[QA] Preset Jobs on Pro Landing Page","variationId":"5442504495988736","variationName":"Variation #1","isLayerConcluded":false,"viewId":"6008860543025152"},{"layerId":"6086312009138176","experimentId":"5870164508409856","experimentName":"[SHIP] Pro Page Phase 2 Updates","variationId":"5307870309253120","variationName":"Variation #1","isLayerConcluded":false,"viewId":"5187591159414784"}],"dynamicWebsiteSupport":true,"groups":0,"pluginsPayload":"","projectId":"21098500546","projectJS":function(){(function () {
  var currentPageLoc = window.location.href;
  /**
  * =================================================================
  * Library Functions
  * =================================================================
  */
  /**
  * Waits for the specified element to be present in the DOM and then triggers the specified function.
  * @param {string} selector - The CSS selector of the element to wait for.
  * @param {function} trigger - The function to trigger once the element is found.
  */
  function waitForElement(selector, trigger) {
    var interval = setInterval(function () {
      if (document.querySelector(selector)) {
        clearInterval(interval);
        trigger();
      }
    }, 50);
    setTimeout(function () {
      clearInterval(interval);
    }, 15000);
  }
  /**
  * Attaches an event listener to elements that match the given selector, even for dynamically added elements.
  * @param {string} selector - The CSS selector to match elements.
  * @param {string} event - The event type (e.g., 'click').
  * @param {function} callback - The function to call when the event is triggered.
  * @param {Element} [context] - The context within which to search for matching elements. Defaults to the entire document.
  */
  function live(selector, event, callback, context) {
    // helper for enabling IE 8 event bindings
    function addEvent(el, type, handler) {
      if (el.attachEvent) el.attachEvent("on" + type, handler);
      else el.addEventListener(type, handler);
    }
    // matches polyfill
    this &&
      this.Element &&
      (function (ElementPrototype) {
        ElementPrototype.matches =
          ElementPrototype.matches ||
          ElementPrototype.matchesSelector ||
          ElementPrototype.webkitMatchesSelector ||
          ElementPrototype.msMatchesSelector ||
          function (selector) {
            var node = this,
              nodes = (node.parentNode || node.document).querySelectorAll(selector),
              i = -1;
            while (nodes[++i] && nodes[i] != node);
            return !!nodes[i];
          };
      })(Element.prototype);
    // live binding helper using matchesSelector
    function live(selector, event, callback, context) {
      addEvent(context || document, event, function (e) {
        var found,
          el = e.target || e.srcElement;
        while (el && el.matches && el !== context && !(found = el.matches(selector)))
          el = el.parentElement;
        if (found) callback.call(el, e);
      });
    }
    live(selector, event, callback, context);
  }
  /**
  * Sends a Google Analytics event.
  * @param {string} eventCategory - The category of the event.
  * @param {string} eventAction - The action associated with the event.
  * @param {string} eventLabel - The label associated with the event.
  */
  function trackGAEvent(eventCategory, eventAction, eventLabel) {
    if ("ga" in window && "getAll" in window.ga) {
      ga.getAll()[0].send("event", {
        eventCategory: eventCategory,
        eventAction: eventAction,
        eventLabel: eventLabel,
      });
    }
  }
  /**
  * Executes a callback once the dataLayer is loaded.
  * @param {function} callback - The function to execute when the dataLayer is loaded.
  */
  function onDataHelperLoad(callback) {
    var waitForDatalayer = setInterval(function () {
      if (window && window.dataLayer) {
        clearInterval(waitForDatalayer);
        callback();
      }
    }, 50);
    setTimeout(function () {
      clearInterval(waitForDatalayer);
    }, 15000);
  }
  /**datalayer helper */
  var g = /\[object (Boolean|Number|String|Function|Array|Date|RegExp)\]/;
  function h(a) {
    return null == a ?
      String(a) :
      (a = g.exec(Object.prototype.toString.call(Object(a)))) ?
        a[1].toLowerCase() :
        "object";
  }
  function k(a, b) {
    return Object.prototype.hasOwnProperty.call(Object(a), b);
  }
  function m(a) {
    if (!a || "object" != h(a) || a.nodeType || a == a.window) return !1;
    try {
      if (a.constructor && !k(a, "constructor") && !k(a.constructor.prototype, "isPrototypeOf"))
        return !1;
    } catch (b) {
      return !1;
    }
    for (var c in a);
    return void 0 === c || k(a, c);
  }
  /* Copyright 2012 Google Inc. All rights reserved. */
  function n(a, b, c) {
    this.b = a;
    this.f = b || function () { };
    this.d = !1;
    this.a = {};
    this.c = [];
    this.e = p(this);
    r(this, a, !c);
    var d = a.push,
      e = this;
    a.push = function () {
      var b = [].slice.call(arguments, 0),
        c = d.apply(a, b);
      r(e, b);
      return c;
    };
  }
  window.DataLayerHelper = n;
  n.prototype.get = function (a) {
    var b = this.a;
    a = a.split(".");
    for (var c = 0; c < a.length; c++) {
      if (void 0 === b[a[c]]) return;
      b = b[a[c]];
    }
    return b;
  };
  n.prototype.flatten = function () {
    this.b.splice(0, this.b.length);
    this.b[0] = {};
    s(this.a, this.b[0]);
  };
  function r(a, b, c) {
    for (a.c.push.apply(a.c, b); !1 === a.d && 0 < a.c.length;) {
      b = a.c.shift();
      if ("array" == h(b))
        a: {
          var d = b,
            e = a.a;
          if ("string" == h(d[0])) {
            for (var f = d[0].split("."), u = f.pop(), d = d.slice(1), l = 0; l < f.length; l++) {
              if (void 0 === e[f[l]]) break a;
              e = e[f[l]];
            }
            try {
              e[u].apply(e, d);
            } catch (v) { }
          }
        }
      else if ("function" == typeof b)
        try {
          b.call(a.e);
        } catch (w) { }
      else if (m(b))
        for (var q in b) s(t(q, b[q]), a.a);
      else continue;
      c || ((a.d = !0), a.f(a.a, b), (a.d = !1));
    }
  }
  function p(a) {
    return {
      set: function (b, c) {
        s(t(b, c), a.a);
      },
      get: function (b) {
        return a.get(b);
      },
    };
  }
  function t(a, b) {
    for (var c = {}, d = c, e = a.split("."), f = 0; f < e.length - 1; f++) d = d[e[f]] = {};
    d[e[e.length - 1]] = b;
    return c;
  }
  function s(a, b) {
    for (var c in a)
      if (k(a, c)) {
        var d = a[c];
        "array" == h(d) ?
          ("array" == h(b[c]) || (b[c] = []), s(d, b[c])) :
          m(d) ?
            (m(b[c]) || (b[c] = {}), s(d, b[c])) :
            (b[c] = d);
      }
  }
  /**
  * =================================================================
  * GA Events
  * =================================================================
  */
  // Pro Page
  if (currentPageLoc.indexOf("https://www.thumbtack.com/pro") != -1) {
    // Get Leads Hero CTA -> .relative.bg-white .mv2 [data-test="get-started-button"]
    // Location Field - Hero Form -> .relative.mv2+div+.relative.mv2 input
    live(
      '.relative.bg-white .mv2 [data-test="get-started-button"], .relative.mv2+div+.relative.mv2 input',
      "click",
      function (e) {
        trackGAEvent("Competitive Advantage V2", "click", "Get Leads Hero CTA");
      }
    );
    // Service Field - Hero Form
    live(" #new-pro-lp-cs", "click", function (e) {
      trackGAEvent("Competitive Advantage V2", "click", "Service Field - Hero Form");
    });
    // Get Leads - Sticky CTA
    live('.fixed [data-test="get-started-button"]', "click", function (e) {
      trackGAEvent("Competitive Advantage V2", "click", "Get Leads - Sticky CTA");
    });
    // Get Leads - Bottom Image CTA
    live("h2+button .Fu-ioshlo_Bv6bF9AaQbF", "click", function (e) {
      trackGAEvent("Competitive Advantage V2", "click", "Get Leads - Bottom Image CTA");
    });
  }
  /**
  * =================================================================
  * Custom Trigger
  * =================================================================
  */
  var regex = "https://www.thumbtack.com/.*/.*/.*|/service/",
    pageUrl = currentPageLoc,
    alreadyFire = false,
    alreadyFireSP = false,
    alreadyFireNP = false;
  // Inactive state more then 2sec
  /****** LP Page ******/
  var userInactive;
  function userInactiveTime() {
    // If modalInactivityTimer option set
    class InactivityCountdown {
      constructor(callback = () => { }, duration = 10) {
        this.timer; // to hold setTimeout ID
        this.active = false; // remember timer state
        this.callback = callback; // function to run when countdown completes
        this.duration = duration; // time in seconds to wait
        this.sprung = false;
      }
      start() {
        // If timer is not active, start it
        if (this.active === false) {
          this.active = true;
          this.timer = setTimeout(() => {
            this.callback();
            this.sprung = true;
          }, this.duration * 1000);
          // If timer is already active, reset it
        } else {
          this.reset();
        }
      }
      stop() {
        // If timer is active, stop it
        if (this.active === true) {
          this.active = false;
          clearTimeout(this.timer);
        }
      }
      // Reset timer by stopping and restarting it
      reset() {
        this.stop();
        this.start();
      }
    }
    const modalTrigger = new InactivityCountdown(() => {
      if (userInactive == true) return;
      userInactive = true;
    }, 10);
    modalTrigger.start();
    ["click", "keydown", "touchstart"].forEach(function (eventType) {
      window.addEventListener(eventType, function (event) {
        if (
          event.target.closest("a") ||
          event.target.closest("button") ||
          event.target.closest("input")
        ) {
          modalTrigger.reset();
        }
      });
    });
  }
  function checkLpPage() {
    if (pageUrl.match(regex)) {
      /**
      * page scroll > 50% and the scrollup
      */
      document.addEventListener("mouseout", function (e) {
        if (!e.toElement && !e.relatedTarget && !alreadyFire && userInactive == true) {
          alreadyFire = true;
          console.log("test exit intent new");
          window["optimizelyEdge"] = window["optimizelyEdge"] || [];
          window["optimizelyEdge"].push({
            type: "page",
            pageName: "state_pages_with_manual",
          });
        }
      });
      //trigger user inactive state
      userInactiveTime();
    }
  }
  /****** SP Page ******/
  var userInactiveOnSP;
  function userInactiveTimeOnServicePage() {
    // If modalInactivityTimer option set
    class InactivityCountdown {
      constructor(callback = () => { }, duration = 45) {
        this.timer; // to hold setTimeout ID
        this.active = false; // remember timer state
        this.callback = callback; // function to run when countdown completes
        this.duration = duration; // time in seconds to wait
        this.sprung = false;
        this.isOtherModalFired = false;
      }
      //check other modal opened
      isAlreadyOtherModalOpend() {
        var modalOpened = false;
        var modals = document.querySelectorAll('[aria-label="Modal"] > div');
        if (modals.length > 0) {
          modals.forEach(function (modal) {
            var modalOpacity = window.getComputedStyle(modal).opacity;
            if (modalOpacity == 1) {
              modalOpened = true;
            }
          });
        }
        return modalOpened;
      }
      start() {
        if (this.isOtherModalFired) {
          this.duration = 1;
        }
        // If timer is not active, start it
        if (this.active === false) {
          this.active = true;
          this.timer = setTimeout(() => {
            if (!this.isAlreadyOtherModalOpend()) {
              this.callback();
              this.sprung = true;
            } else {
              this.isOtherModalFired = true;
              this.reset();
            }
          }, this.duration * 1000);
          // If timer is already active, reset it
        } else {
          this.reset();
        }
      }
      stop() {
        // If timer is active, stop it
        if (this.active === true) {
          this.active = false;
          clearTimeout(this.timer);
        }
      }
      // Reset timer by stopping and restarting it
      reset() {
        this.stop();
        this.start();
      }
    }
    const modalTrigger = new InactivityCountdown(() => {
      if (userInactiveOnSP == true) return;
      userInactiveOnSP = true;
    }, 30);
    modalTrigger.start();
  }
  function checkServicePage() {
    if (pageUrl.match(regex)) {
      /**
      * page scroll > 50% and the scrollup
      */
      document.querySelector("body").addEventListener("mousemove", function (e) {
        if (!alreadyFireSP && userInactiveOnSP == true) {
          alreadyFireSP = true;
          console.log("servicePage exit intent");
          window["optimizelyEdge"] = window["optimizelyEdge"] || [];
          window["optimizelyEdge"].push({
            type: "page",
            pageName: "21098500546_tt_service_pages_",
          });
        }
      });
      //trigger user inactive state
      userInactiveTimeOnServicePage();
    }
  }
  /****** NP Page ******/
  var userInactiveOnNP;
  function userInactiveTimeOnNP() {
    // If modalInactivityTimer option set
    class InactivityCountdown {
      constructor(callback = () => { }, duration = 45) {
        this.timer; // to hold setTimeout ID
        this.active = false; // remember timer state
        this.callback = callback; // function to run when countdown completes
        this.duration = duration; // time in seconds to wait
        this.sprung = false;
        this.isOtherModalFired = false;
      }
      //check other modal opened
      isAlreadyOtherModalOpend() {
        var modalOpened = false;
        var modals = document.querySelectorAll('[aria-label="Modal"] > div');
        if (modals.length > 0) {
          modals.forEach(function (modal) {
            var modalOpacity = window.getComputedStyle(modal).opacity;
            if (modalOpacity == 1) {
              modalOpened = true;
            }
          });
        }
        return modalOpened;
      }
      start() {
        if (this.isOtherModalFired) {
          this.duration = 1;
        }
        // If timer is not active, start it
        if (this.active === false) {
          this.active = true;
          this.timer = setTimeout(() => {
            if (!this.isAlreadyOtherModalOpend()) {
              this.callback();
              this.sprung = true;
            } else {
              this.isOtherModalFired = true;
              this.reset();
            }
          }, this.duration * 1000);
          // If timer is already active, reset it
        } else {
          this.reset();
        }
      }
      stop() {
        // If timer is active, stop it
        if (this.active === true) {
          this.active = false;
          clearTimeout(this.timer);
        }
      }
      // Reset timer by stopping and restarting it
      reset() {
        this.stop();
        this.start();
      }
    }
    const modalTrigger = new InactivityCountdown(() => {
      if (userInactiveOnNP == true) return;
      //console.log("inactive state 5 second");
      window["optimizelyEdge"] = window["optimizelyEdge"] || [];
      window["optimizelyEdge"].push({
        type: "page",
        pageName: "21098500546_exit_intent_excluding_",
      });
      userInactiveOnNP = true;
    }, 5);
    modalTrigger.start();
    ["click", "keydown", "touchstart"].forEach(function (eventType) {
      window.addEventListener(eventType, function (event) {
        if (
          event.target.closest("a") ||
          event.target.closest("button") ||
          event.target.closest("input")
        ) {
          modalTrigger.reset();
        }
      });
    });
  }
  function checkNpPage() {
    if (pageUrl.match(regex)) {
      document.addEventListener("mouseout", function (e) {
        if (!e.toElement && !e.relatedTarget && !alreadyFireNP && userInactiveOnNP == true) {
          alreadyFireNP = true;
          console.log("Np exit intent");
          window["optimizelyEdge"] = window["optimizelyEdge"] || [];
          window["optimizelyEdge"].push({
            type: "page",
            pageName: "21098500546_exit_intent_excluding_",
          });
        }
      });
      //trigger user inactive state
      userInactiveTimeOnNP();
    }
  }
  /**
  * Checks if the current page is a landing page (LP page) based on the presence of the 'LpPageView' event in the dataLayer.
  * If the event exists, it triggers the 'checkLpPage' function.
  * Additionally, it triggers Optimizely Edge events based on specific LP page URLs and event types.
  * Also, triggers Optimizely Edge events for all LP and non-LP pages, including specific NP page URLs.
  * Finally, triggers Optimizely Edge event for Service Page (SP PageView).
  */
  onDataHelperLoad(function () {
    var bmListener = function (model, message) {
      var currentUrl = window.location.href;
      // LP Page
      if (message && message.event == "LpPageView") {
        // console.log("lp page match");
        checkLpPage();
        // LP page view (TT-098 | Book A Service FD Module)
        if (
          currentUrl.match(
            "https://www.thumbtack.com/.*/.*/(appliance-repair|plumbing|drain-cleaning-plumbers)"
          )
        ) {
          // console.log("TT: 98 lp page match");
          window["optimizelyEdge"] = window["optimizelyEdge"] || [];
          window["optimizelyEdge"].push({
            type: "page",
            pageName: "21098500546_tt098_landing_pages_",
          });
        }
      }
      // LP Page or Np page
      if (
        (message && message.event == "LpPageView") ||
        (message && message.event == "NpPageView")
      ) {
        // console.log("lp page match || np page match");
        window["optimizelyEdge"] = window["optimizelyEdge"] || [];
        window["optimizelyEdge"].push({
          type: "page",
          pageName: "21098500546_tt__all_pages_nps__lps_",
        });
        // Np page
        if (message && message.event == "NpPageView") {
          checkNpPage();
          // NP page with (TT-098 | Book A Service FD Module)
          if (
            currentUrl.includes("www.thumbtack.com/k/appliance-repair/near-me") ||
            currentUrl.includes("www.thumbtack.com/k/plumbers/near-me") ||
            currentUrl.includes("www.thumbtack.com/k/drain-cleaning-plumbers/near-me") ||
            currentUrl.includes("www.thumbtack.com/k/licensed-plumbers/near-me/") ||
            currentUrl.includes("www.thumbtack.com/k/master-plumbers/near-me") ||
            currentUrl.includes("www.thumbtack.com/k/bathroom-plumbers/near-me")
          ) {
            console.log("Console message: URL matched:", currentUrl);
            console.log("TT: 98 NP page match");
            window["optimizelyEdge"] = window["optimizelyEdge"] || [];
            window["optimizelyEdge"].push({
              type: "page",
              pageName: "21098500546_tt098__near_me_pages_",
            });
          }
        }
      }
      // SP page view
      if (message && message.event == "SpPageView") {
        console.log("SpPageView page match");
        window["optimizelyEdge"] = window["optimizelyEdge"] || [];
        window["optimizelyEdge"].push({
          type: "page",
          pageName: "Service_page_12",
        });
        checkServicePage();
      }
    };
    new DataLayerHelper(dataLayer, bmListener, true);
  });
  // Click on Popup Modal Close Button
  function clickOnModal() {
    window["optimizelyEdge"] = window["optimizelyEdge"] || [];
    window["optimizelyEdge"].push({
      type: "page",
      pageName: "223322",
    });
    window["optimizelyEdge"].push({
      type: "page",
      pageName: "21098500546_tt__rf_tca_exit_intent_callback_form_mweb",
    });
  }
  // Service page goal
  waitForElement("body", function () {
    if (document.body && !document.body.classList.contains("tt_global")) {
      document.body.classList.add("tt_global");
      // Click on popup modal close button
      live(
        '[data-testid="request-flow-modal--open"] button[aria-label="Close"]',
        "click",
        clickOnModal
      );
    }
  });
})();
// The following code is used for manual activation of test 158.
try {
  var urlobject = {
    "/k/handyman/near-me": [
      328405356611,
      7183074494,
      932960133,
      1443963532,
      356457776089,
      1157756512,
      218909059684,
      359310821,
      7801925573,
      289878774,
      1711768210,
      286606524,
      770406202,
      857958513,
      289852764,
      3067547062,
      1711773790,
      89093037,
      653966100237,
      95270741120,
      246689671,
      44150212,
      154548391,
      7801924313,
      298124304862,
      324409992162,
      68603172187,
      13500042,
      289873644,
      430015493909,
      5507948586,
      11867757593,
      289873974,
      102073904,
      797985059940,
      353762584253,
      295100473133,
      102073984,
      4181881892,
      334097592896,
      473122237653,
      11438131535,
      11867702873,
      89094657,
      3629287883,
      346090655506,
      1444001632,
      1444019272,
      2944454009,
      5225004628,
      11438255825,
      3629282483,
      1987701207,
      297580637455,
      4376055002,
      353795694215,
      541859215619,
      1045714630,
      770410492,
      323176680170,
      377222323156,
      375471298279,
      335491628293,
      289852464,
      178195763,
      289856844,
      914382893035,
      375471302359,
      257948570521,
      7172035935,
      346070225676,
      11866301843,
      411125793007
    ],
    "/k/commercial-cleaning/near-me": [
      2225190958683,
      315474535667,
      1438063534,
      602605922,
      298574927001,
      882313130,
      602600312,
      2233444683052,
      369478754132,
      297627036861
    ],
    "/k/home-painters/near-me": [
      296552074969,
      2798796068,
      167240916292,
      796718527140,
      371850084153,
      2803238468,
      2798793428,
      338905956439,
      360753044568,
      1559966798,
      370512238523,
      1494251064840,
      410537911612,
      478249209767,
      303363206578,
      371750966591,
      397168613181,
      2798763848,
      376440929213,
      680789224762,
      379106871275,
      338905955439,
      1559989778,
      610429669351,
      1559990708,
      2803219028,
      2798772908,
      357260217834,
      374893077742,
      5009609284,
      326841622494,
      474731182224,
      12970000445,
      385355900783,
      317163901909,
      5944908165,
      1174960940,
      412369838149,
      570723941962,
      334970917400,
      300658770436,
      352795599772,
      311050772146,
      863613136553,
      918885645809,
      13105718747,
      2431877447,
      2431114187,
      333821419133,
      2151346414,
      19438235323,
      311230308870,
      333250866440,
      300250003913,
      929512014854,
      2151349174,
      2431113587,
      294737438336,
      333361294554,
      352556392204,
      5508034326,
      2126324205,
      869597772159,
      296940870142,
      309581873510,
      891449449116,
      307025870391,
      1546266939,
      300659402556,
      2431116347,
      299099981949,
      2596842448,
      12202054609,
      299255016858,
      311230306710,
      300349984448,
      1921702261,
      515476327672,
      893744884554,
      4401018587,
      832435516023,
      298707088750,
      2431115927,
      342072895894,
      12297637670,
      341930413859,
      1117994448,
      434622647676,
      903279091817,
      344381794977,
      10802053415,
      314686468319,
      393659556395,
      405909816890,
      306151322155,
      460400692548,
      358443955581,
      2238998153241,
      12202055419,
      321628724302,
      302629082561,
      304147968894,
      324132000841,
      491510304215,
      310461640495,
      310255787663,
      364555569047,
      1704983968,
      301149150716,
      323200801175,
      12297493310,
      2803306688,
      358443960381,
      357358260904,
      342072895414,
      443761769,
      301154753948,
      406282780997,
      412637564808,
      5981282532,
      351956895727,
      294737441216,
      341434174974,
      2809539953,
      680186998062,
      307466221098,
      2431114667,
      310492965748,
      450262692195,
      1117995378,
      1117993398,
      297152834371,
      1100225030,
      1102897811747,
      1006182583,
      297152834331,
      2019157944,
      305921110726,
      297062257191,
      298057193676,
      261550041,
      927281232674,
      338905958839,
      1472010087,
      914731292,
      365054174,
      1735365718280,
      297984177267,
      297062259031,
      294532653302,
      305048430466,
      2796220388,
      352186993380,
      298079373025,
      2157787533,
      1360995877,
      289534884,
      297351558911,
      12202111489,
      295568738806,
      489232273859,
      311505614815,
      297150838756,
      297351538311,
      311230300950,
      5230790473,
      1168164719892,
      641089230853,
      296474375000,
      502314223152,
      300659403516,
      297351556271,
      406389816237,
      295851257680,
      309581873230,
      910141127463,
      2431116827,
      322534773507,
      297837024905,
      11873049111,
      297351538551,
      296474372760,
      297351533751,
      321885411064,
      326728905244,
      19438960723,
      391266483759,
      296224855606,
      12202110769,
      2307392776538,
      295173793830,
      6553542103,
      353399521876,
      297842954839,
      346402713052,
      1546269339,
      826376319817,
      295811670430,
      1721504252631,
      295811671670,
      11638092628,
      329525631769,
      297351544231,
      296343246888,
      297736357085,
      295811670190,
      355875941648,
      2112016226,
      297351534871,
      1522023805,
      6635555913,
      297351534911,
      297351549551,
      300659402636,
      410917502342,
      297351550071,
      297351533191,
      321769674210,
      1724922197237,
      832075179058,
      1016255217118,
      380902907,
      641802729809,
      298544658943,
      328917565156,
      13926430055,
      11491641126,
      2431870967,
      297351548391,
      11638142578,
      295811669430,
      326172709572,
      295851246120,
      357298301515,
      12297480170,
      824923449995,
      297351555831,
      2809549373,
      12312837326,
      258465593,
      258465533,
      312832055972,
      759416657697,
      1621852998,
      297150848876,
      326008718604,
      905107315848,
      1244735624,
      297150842796,
      305921108846,
      378618932103,
      357308985518,
      934824523,
      431434100607,
      357308985278,
      379106870875,
      642509688683,
      1343022410089,
      371850078913,
      643001286685,
      376440929013,
      830583847128,
      472619778903,
      2798811548,
      2798786168,
      1186255734367,
      371850082233,
      568227541354,
      490568632312,
      374643351595,
      317513438083,
      2175602373,
      67753033497,
      411137836220,
      326841622294,
      710278288500,
      3673356180,
      305682527235,
      378005910,
      385355899423,
      378005940,
      12969933215,
      1302478457999,
      6635573133,
      338121661657,
      710893944901,
      346336343194,
      1117997538,
      317569071506,
      10802053325,
      369798968398,
      638521868061,
      1718947797016
    ],
    "/k/movers/near-me": [
      400704430,
      155867902860,
      127113550094,
      245916736,
      326005894731,
      54691820,
      323904755900,
      245913076,
      475825110125,
      117986663,
      647100398528,
      329316966884,
      138518910510,
      20719843,
      1983145495,
      338790188780,
      1343934614,
      1343929094,
      113148941,
      733147266,
      49228810,
      1578640476,
      61250486,
      1366667044,
      733139586,
      334186377,
      10757692,
      582760213,
      733146186,
      20021791,
      100496962,
      296342011090,
      838152325,
      3527674783,
      304974257227,
      320898699,
      10757182,
      304337320,
      96708690,
      135891134476,
      174585179,
      155867881500,
      387990787158,
      1399939072,
      298090250343,
      124203724387,
      9170462480,
      4156654791,
      659385981076,
      1059991069347,
      408151480077,
      10025121,
      174585259,
      1295463347
    ],
    "/k/furniture-assembly/near-me": [
      418691083876,
      304269017200,
      303759702478,
      391940059130,
      355950037811,
      315275009981,
      457586702767,
      26193598420,
      391940059370,
      338635540469,
      310232526850,
      297963310505,
      310887479747,
      304269018160,
      297963306185,
      559584203900,
      577688431867,
      295868918776,
      426276389470,
      304269025400,
      350746672041,
      295375946839,
      297963306225,
      29111219791,
      309485351750,
      863293593747,
      391957924446,
      340016804556,
      298818256266,
      297963307425,
      3921404921,
      2421684433,
      309485352150,
      332083162988,
      297963314545,
      297963306465,
      309485352190,
      96145776,
      309485351510,
      922464429961,
      330074931030,
      4122704031,
      297963314145,
      297438435261,
      298247056750,
      426892673974,
      933245203438,
      334549755316,
      404024230000,
      328195093354,
      404024230040,
      308977013496,
      818865219265,
      308977013416,
      308977013256,
      69966903547,
      1712616633321,
      822296072318,
      330335234319,
      331400659191,
      318484395783,
      331843800863,
      297438447821,
      295868919776,
      295868919816,
      318484409743,
      888915535343,
      308977009336,
      889498923301,
      384203442608,
      260912612827,
      308977009416,
      568046637992,
      308977009176,
      568046635872,
      310887479907,
      309702407038,
      297438447301,
      354720428354,
      331875980633,
      784285735615,
      309159065466,
      306272524031,
      331537961508,
      446599798016,
      309702407718,
      1480588435874,
      2420250793,
      2421684313,
      45446892472,
      333808773568,
      1285932172233,
      316952782942,
      302646916694,
      3175584863,
      1001026266884,
      257134877,
      839241218538,
      295060263053,
      354979678974,
      40553615628,
      295060271693,
      298818254626,
      298247056710,
      56974761,
      350629095567,
      329135328933,
      331537959828,
      355925725087,
      782200975169,
      330035930776,
      331218867001
    ],
    "/k/junk-removal/near-me": [
      378664330446,
      5529882442,
      360761099245,
      3833574404,
      13523957438,
      355283371639,
      6844537173,
      81503201622,
      788809844395,
      369957086839,
      323709508753,
      6844377573,
      333016232334,
      7139091866,
      371360384111,
      297578430888,
      341198592222,
      13057205426,
      831037759366,
      706277956717,
      297928440668,
      3368320342,
      314828803671,
      314828803831,
      13057347266,
      370110721174,
      6844527153,
      1078528036,
      305307452629,
      1078517536,
      1078545406,
      307136755895,
      508325371912,
      1078528006,
      1209536549,
      341198592622,
      11594560091,
      13057205966,
      10722248054,
      400343159414,
      10722248234,
      297373029343,
      401957425196,
      295961091999,
      415040617084,
      831037758206,
      297373029063,
      772284426860,
      7796346640,
      323709504713,
      295654276486,
      82966592514,
      372284261035,
      296665251765,
      367508937562,
      321674320475,
      354315342126,
      350103482127
    ],
    "/k/tv-wall-mount-install/near-me": [
      456486244784,
      1397148482631,
      1235018255997,
      38172866052,
      462219333317,
      477882484541,
      583530177099,
      13948350205,
      333105209732,
      478251507727,
      648764292900,
      600956443816,
      404024230480,
      549049659772,
      308773001017,
      333105209212,
      2342698503507,
      301157312769,
      11701509985,
      2345647045831,
      2341357959510,
      2181567667657,
      394854328684,
      436799986034,
      2341837178091,
      2345488800195,
      2343187533746,
      854402108138,
      299546773428,
      36431358204,
      396019795560,
      31584365201,
      539909775064,
      297614771430,
      394306003176,
      350560951848,
      3299145219,
      303814495810,
      11473402202,
      2148927166,
      12985571627,
      428609043311,
      930750112302,
      303955273583,
      355372898071,
      599105802927,
      312127413342,
      340268330043,
      750847581111,
      549049660732,
      340839003553,
      314304139163,
      12307768281,
      298365702913,
      297610649001,
      316726288482,
      33456709448,
      11388781714,
      677465074459,
      954669877647,
      1318904262718,
      49052317069,
      103031414716,
      300943114963,
      549049660772,
      549049660292,
      51646686355,
      858940258261,
      125995604441,
      401228259748,
      903885205820,
      367437194877,
      2368834774746,
      1397148482151,
      584777946370,
      456682709881,
      648274449312,
      404200707491,
      371062818437,
      356247900671
    ],
    "/k/fence-installation/near-me": [
      328921047515,
      5509167142,
      5508917122,
      357063835811,
      676703331026,
      334027659030,
      230047174,
      230046094,
      790006345417,
      1648436574920,
      375256240535,
      298144419780,
      5509121242,
      5509171552,
      179292973964,
      5507972346,
      13923978358,
      299956811926,
      5433361253,
      3800384106,
      3718168897,
      5509213042,
      860896606,
      5507972286,
      1423573874384,
      1636678719,
      1272020126,
      501365735,
      662619229,
      4970036209,
      821003982414,
      360388665791,
      12901839472,
      5661427043,
      399708396696,
      300249990193,
      5661474083,
      323157882394,
      4584290199,
      1164808817,
      535507512451,
      529049076930,
      298877080211,
      5508865732,
      319578731234,
      12296072750,
      9009238643,
      1272019916,
      297035323405,
      1663419350575,
      396990915,
      300196222721,
      353686662630,
      367438188,
      367438278,
      686484033009,
      299593735911,
      5507954706
    ],
    "/k/gate-companies/near-me": [
      298144421420,
      356632215007,
      339312554044,
      298242568528,
      495296149913,
      429134887606,
      298144419300,
      306185956315,
      298144427980,
      318622407815
    ],
    "/k/roofing/near-me": [
      495094221481,
      3423005025,
      295503715369,
      311618449089,
      5534923162,
      301697200507,
      5534935582,
      358265618822,
      5534752252,
      6824905661,
      10024189280,
      1174976330,
      4978673393,
      382376116510,
      488322851232,
      1172388845,
      2748481700,
      3275332468,
      5236087114,
      2748525140,
      5534928652,
      363976399675,
      3721180997,
      4169850976,
      3912973012,
      4235996416,
      2977036552,
      300923561978,
      2008590342402,
      4199618956,
      890100010039,
      398477204310,
      2544133092,
      3081175104,
      5220958337,
      363976395755,
      347843244,
      947823655658,
      2224821370001,
      1728059201961,
      301697200307,
      383406634023,
      365215920842,
      828907506711,
      295503714209,
      6844419033
    ],
    "/k/professional-cleaning-services/near-me": [
      299999146759,
      1130613756,
      649193356,
      297985702020,
      298759174068,
      351738937647,
      1999756301,
      328383916,
      301522280138,
      2302118449,
      69038526,
      3124403329,
      323099239848,
      361389133582,
      89113777,
      404413950450,
      440063050464,
      428945156381,
      385163408629,
      11067663,
      153176235171,
      346552497525,
      54869121,
      89114037,
      1085612328,
      335816407323,
      298574926441,
      301377220735,
      1061667009,
      323099321939,
      1600218429000,
      298339759145,
      122452501,
      301377220535,
      256106603,
      516071592922,
      286601356,
      82158495400,
      276133342,
      26784735829,
      10755482,
      4247949787,
      320577175369,
      437764709177,
      395751210128,
      680851605552,
      361389115142,
      406076572995,
      556947142052,
      303147438123,
      368637221470,
      45685583530,
      1335783572,
      296618143401,
      278331579,
      343583884516,
      297842494558
    ],
    "/k/deep-cleaning/near-me": [
      298759174068,
      1391792644922,
      390372169144,
      3034023457,
      299602097254,
      300045514475,
      364469705739,
      298195409729,
      794312755355,
      329530977515,
      3803703403,
      969844309891,
      300045519835,
      300045519595,
      295778204526,
      296603306627,
      341004032053,
      311111360305,
      300045520795,
      329530978035,
      4298099902,
      679381623795,
      297512333426,
      726411855538,
      315474584067,
      29670597127,
      300792918888,
      335816416683,
      326390014924,
      298574938041,
      705950189264,
      6282999330,
      312169784350,
      515851502352,
      364729257250,
      313600007740,
      22874685631,
      300984786904,
      335816419563,
      301423032898,
      399106875594,
      309257733001,
      317454083648,
      300792192688,
      298574934201,
      297674654588,
      300045529155,
      360016336299,
      482612531945,
      458965980652,
      834886932638,
      454777535949,
      298195415169,
      329530977315,
      2343467272213,
      358938016505,
      349646460879,
      2342740589410,
      894561281703,
      300045528155,
      392370611709,
      300045528195,
      894561282463,
      5159038604,
      691229121510,
      1380601203095,
      831848254496,
      50096861120,
      298195412849,
      298195412289,
      1072385976418,
      2043422123,
      4401888446,
      1394294369908,
      296439074526,
      296633696590,
      589985365611
    ],
    "/k/house-cleaning/near-me": [
      1405890412,
      365217277411,
      180247970887,
      467458683496,
      434710311063,
      312202516770,
      395858808159,
      312052776150,
      304580631048,
      335816407083,
      295917780419,
      340714842170,
      3803637103,
      301009647763,
      295917780379,
      305760031620,
      335816411683,
      333175891830,
      304114294228,
      3802569159,
      1085612328,
      335799615818,
      394993298822,
      307697602521,
      2101921160,
      28400838855,
      297177426670,
      871964629585,
      19955398074,
      312566735003,
      2173483654035,
      295753741419,
      313195231898,
      10026065185,
      306662376190,
      383580458048,
      300045520795,
      540735789518,
      297674658148,
      528789323273,
      313197160771,
      867578178,
      10026065725,
      17891696788,
      2224267123,
      297562800953,
      5127832234,
      312566735203,
      313197160971,
      1936569322795,
      299207171936,
      304447305092,
      12096466035,
      941338020870,
      52682467356,
      799961384543,
      1440855112,
      348811377321,
      299350037922,
      77657491477,
      298574943521,
      308829015057,
      830639375956,
      797005137786,
      20180541455,
      935019204,
      95243404130,
      152093823,
      901640288112,
      89114157,
      324226274154,
      351766437572,
      5371637246,
      401660182942,
      77657491837,
      142071723,
      315654259662,
      817169746773,
      411177905646,
      44247512,
      44247532,
      425442605462,
      677651511359,
      77662074997,
      7411781697,
      387579140826,
      335805695403,
      298574935801,
      311672357679,
      89314737,
      297512330106,
      327170455,
      7285670007,
      299207171976,
      297674649548,
      326390015204,
      22874470351,
      805924269259,
      355687948924,
      142071763,
      2148418666,
      333987324602,
      298574926721,
      908411031247,
      487828188848,
      372705681822,
      678610248130,
      399106898634,
      614526790739,
      335805696403,
      908288425177,
      295283855220,
      1390430095,
      416591824442,
      298574941801,
      2224267303,
      816755424866,
      327171295,
      344800054732,
      142464607692,
      340714845730,
      488506449731,
      813086565,
      377527227,
      473121538505,
      593623425309,
      416591826402,
      298677771028,
      415476965,
      286601356,
      446050539,
      301832423196,
      1748063023,
      1690730361,
      276133192,
      301832424716,
      3219266963,
      1390411015,
      10755352,
      349317460473,
      355246086600,
      342464639011,
      357169712341,
      297842494958,
      258462563,
      498209104004,
      828487523935,
      985694037734,
      786873726884,
      487828188688,
      2208740021,
      603769691,
      297842523038,
      301392644561,
      2208737681,
      374798519491,
      770164006,
      786873726924,
      985694038014,
      301392642921,
      175134316,
      2474782736,
      835163438,
      2208739421,
      1072385975898,
      997841624617,
      1440856732,
      3802461763,
      2254368448444,
      39334792173,
      383161907731,
      299207141896,
      297674630828,
      297562788233,
      297562787913,
      352978630787,
      799961382863,
      52497321876,
      9163290650,
      488071996752,
      9163112810,
      867570018,
      387438699296,
      786873713684,
      2208736181,
      528789322953,
      929240191334,
      314956551275,
      359042743,
      299869225373,
      1405908952,
      355910712224,
      783762824355,
      411890374926,
      414681228605,
      357969456659,
      300620608555,
      769114997993,
      355222663400,
      2025431896079,
      2871167012,
      107990471,
      767469432379,
      357969457139,
      9163038380,
      2097593483,
      20536382,
      64248239741,
      26786552029,
      3130392639
    ],
    "/k/housekeeping/near-me": [
      304580631048,
      314637988938,
      296025225562,
      433674239644,
      21419564364,
      28400838855,
      5158396004,
      311672357679,
      313101126953,
      2208738401,
      488302573392,
      333103027635,
      6924190074,
      8250972653,
      354919346,
      4969945707,
      314090274685,
      102932751,
      95243404730,
      316152920292,
      12759230596,
      351766431732,
      1578651395,
      449945752233,
      351766438452,
      351766431092,
      429829930692,
      516071594522,
      2208742061,
      7376991664,
      5158425824,
      571167886466
    ],
    "/k/maids/near-me": [
      82157254840,
      5371717886,
      2814597510,
      5371667246,
      5371721306,
      298916029577,
      5051137527,
      44247502,
      694598593,
      446173449,
      694589773,
      3744111097,
      2044533421,
      934999194,
      1464666527,
      333780604044,
      13082977925,
      312566735163,
      306031028574,
      44247542,
      20536052,
      12802134977,
      55938479041,
      2279972969416,
      296431060059,
      73346494000,
      335816414563,
      295431834136,
      89314777,
      60864311,
      65809244270,
      374311921157,
      1163594301,
      606508575764,
      645379061,
      69045631238,
      5085975268,
      2512938540,
      393228502750,
      694604053,
      694603723,
      2512939020,
      2190860015260,
      297975270129,
      5507713372,
      4802024857,
      390451942458,
      4958875594,
      2814629370,
      299285950942,
      2145127839,
      297260441215,
      301257594417,
      291711867,
      694592593,
      694598953
    ],
    "/k/move-out-cleaning/near-me": [
      309090211630,
      309090214270,
      949151708594,
      309257731361,
      339286462988,
      295269833893,
      306634370591,
      309090211350,
      434463741347,
      694598593,
      297177426670,
      377227456201,
      844651902867,
      312048447326,
      298968547638,
      306634370391,
      303916102688,
      455965063596,
      710703260053,
      1619853860582,
      312048438126,
      298968546638,
      298968547598,
      414366329001,
      484892876543,
      61118185409,
      7999535329,
      300792205888,
      420361137737,
      60109081813,
      428140468756,
      363801447262,
      298968546918,
      455965064116,
      16559586575,
      868456310093,
      2476919132,
      301832420116,
      434540883052,
      2475061972,
      301832419356,
      2475062272,
      298574939921,
      454796759709,
      306951560393,
      1312022691972,
      309090212790,
      25406297386,
      31722737066,
      391726088879,
      10896948604,
      2576268707,
      488457838953,
      427203435810,
      355910712464,
      301392639801,
      296875044673,
      301949688181,
      467468690376,
      889831861426,
      853465095,
      2475061312,
      13302650163,
      309257722521,
      943374473433,
      1187630910645,
      839930132097,
      651108625890,
      603768311,
      367038457815,
      295269844973,
      295269845213,
      295269832253,
      323081204294,
      824944969121,
      1633727035108,
      357598090769,
      821304997172,
      388197981509,
      715415859481,
      1066465745017
    ],
    "/k/home-organizers/near-me": [
      2176887054701,
      1883246035560,
      1603925715352,
      1603925717992,
      299070283384,
      307356084132,
      335356275728,
      2407702091197,
      2342678520609,
      1064194785481,
      2008198975616,
      851816590542,
      853979964845,
      2342269627575,
      413534879496,
      295083844062,
      491934070997,
      295083833462,
      307070698227,
      348550490547,
      337456240228,
      416211331415,
      415719250965,
      390981262075,
      308803490340,
      295834807889,
      299207154616,
      5051584493,
      317963110308,
      400490011116,
      335356276488,
      330121656135,
      307356084892,
      1656979653051,
      305501067014,
      2341440665026,
      913942237606,
      2345627393024,
      305501059894,
      2344578884130,
      2341231265003,
      299070286024,
      299070288624
    ],
    "/k/24-hour-plumbers/near-me": [
      50198310,
      102970996,
      102971696,
      116741836,
      477118730,
      532285826,
      779363146,
      779366266,
      779384026,
      983220456,
      1091301006,
      1485278298,
      4773560615,
      4773602135,
      6031755646,
      7437165934,
      16722962961,
      296825166709
    ],
    "/k/emergency-electricians/near-me": [
      791986862,
      792093602,
      1048796092,
      1067756062,
      4567969728,
      4568059488,
      13235859254,
      14694153989,
      16630667991,
      16647260301,
      295968590340,
      299131098398,
      299625349083,
      300877388572,
      300877417892,
      301226506738,
      301226509578,
      303187324297
    ],
    "/k/locksmiths/near-me": [
      407847507,
      484498648,
      484498708,
      696085065,
      896314822,
      1023459643,
      1145399729,
      1762840589,
      2400092752,
      12082276405,
      25673948979,
      296118077929,
      296129016128,
      296298529104,
      298280182259,
      298857928941,
      305294972076,
      361557020077
    ]
  }
  var url = window.location.href;
  var match = url.match(/kwd-(\d+)-/);
  var pagePath = window.location.pathname;
  if (match) {
    if (window.location.href.includes("https://www.thumbtack.com/") && match && match[1]) {
      console.log('KWD:', match[1]);
      var kwId = match[1];
      if (kwId && pagePath) {
        if (urlobject[pagePath].includes(Number(kwId))) {
          // activate the test here
          // console.log("test 158 activated")
          window['optimizelyEdge'] = window['optimizelyEdge'] || [];
          window['optimizelyEdge'].push({
            type: "page",
            pageName: "21098500546_tt158_nplp_pages_"
          });
          // console.log("conditon mateched for the etes")
        } else {
          window['optimizelyEdge'] = window['optimizelyEdge'] || [];
          window['optimizelyEdge'].push({
            type: "page",
            pageName: "21098500546_tt__160_nps__lps"
          });
          // console.log("thumbtack test 160 activated with the kwid and excluded from test 158--")
        }
      }
    }
  } else {
    window['optimizelyEdge'] = window['optimizelyEdge'] || [];
    window['optimizelyEdge'].push({
      type: "page",
      pageName: "21098500546_tt__160_nps__lps"
    });
    // console.log("thumbtack test 160 activated without kwid page--")
  }
} catch (error) {
  console.log("error on test activating based on KWid")
}

// The code below has been added to check logged-in and logged-out users
try {
  // Function to wait for an element before executing a trigger function
  function waitForElement(selector, trigger) {
      var interval = setInterval(function () {
          if (
              document &&
              document.querySelector(selector) &&
              document.querySelectorAll(selector).length > 0
          ) {
              clearInterval(interval);
              trigger();
          }
      }, 50);
      setTimeout(function () {
          clearInterval(interval);
      }, 15000);
  }

  // Function to get a cookie value by name
  function getCookie(cname) {
      let name = cname + "=";
      let decodedCookie = decodeURIComponent(document.cookie);
      let cookies = decodedCookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          let c = cookies[i].trim();
          if (c.indexOf(name) === 0) {
              return c.substring(name.length, c.length);
          }
      }
      return null;
  }

  // Function to check and update body class
  function updateBodyClass() {
      let body = document.querySelector("body");
      if (body) {
          if (getCookie("ll_remember_me")) {
              body.classList.add("logged_in_users");
          } else {
              body.classList.remove("logged_in_users");
          }
      }
  }

  // Wait for <body> and then execute updateBodyClass
  waitForElement("body", updateBodyClass);

} catch (e) {
  console.error("Error in script: checking user login status", e);
}



/*
    Here adding a cookie for the user who visits the pages except the service pages. 
*/

(function () {
    try {
        var debug = 0;
        var variation_name = "TT-Global-activationCode";

        function waitForElement(selector, trigger) {
            var interval = setInterval(function () {
                if (
                    document &&
                    document.querySelector(selector) &&
                    document.querySelectorAll(selector).length > 0
                ) {
                    clearInterval(interval);
                    trigger();
                }
            }, 50);
            setTimeout(function () {
                clearInterval(interval);
            }, 15000);
        }

        function setCookie(name, value, days) {
            var expires = "";
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "") + expires + "; path=/";
        }

        function getCookie(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }

        function activateTest182() {
            window['optimizelyEdge'] = window['optimizelyEdge'] || [];
            window['optimizelyEdge'].push({
                type: "page",
                pageName: "21098500546_tt182__sp_cta_test"
            });
        }

        function init() {

            // For the pages except the service pages
            if (!window.location.href.includes('/service/')) {
                setCookie('TT-182-SettingCookieForNotTargetedURLs', 'true');
            } else if (window.location.href.includes('/service/')) {

                let otherPagesCookie = getCookie('TT-182-SettingCookieForNotTargetedURLs');
                let targetedPagesCookie = getCookie('TT-182-TestCookieServicePages');

                if (otherPagesCookie) {
                    if (targetedPagesCookie) {
                        activateTest182();
                    }
                } else {
                    activateTest182();
                }
            }

        }

        /* Initialize variation */
        waitForElement("body", init);
    } catch (e) {
        if (debug) console.log(e, "error in Test " + variation_name);
    }
})();
},"queryParams":[["QA","QA-testing"],["optimizely_x","5442504495988736"],["optimizely_force_tracking","true"]],"requestId":"a4e8ca598f012f99","revision":"10995","rum":{"inRumSample":false,"sampleRate":0.003},"snippetURL":"https://cdn.optimizely.com/public/20611073899/21098500546/10995_ee23f3054b3ca75de390d4f6430b7bfedb6377cdb2c18aec88ec7f53b3cb2f04_edge_helper.js","targetPageURL":"https://www.thumbtack.com/pro?QA=QA-testing&optimizely_x=5442504495988736&optimizely_force_tracking=true","trackingSnippetOnload":false,"viewStates":{"21175842540":false,"21239801000":false,"21266041172":false,"21379650977":false,"21403760311":false,"21439550442":false,"21466233294":false,"21511710594":false,"21530410635":false,"21536600606":false,"21555060142":false,"21561170452":false,"21582780078":false,"21654450994":false,"21656601595":true,"21685011256":false,"21686920937":false,"21909400130":true,"22027372048":true,"22041295602":false,"22113771291":false,"22126340435":false,"22126450067":false,"22127181021":false,"22137830308":false,"22174642967":false,"22254500100":false,"22262221869":false,"22270371455":false,"22278280763":false,"22283251312":false,"22284980050":false,"22449012713":false,"22512861150":false,"22662611135":false,"22702140999":false,"22708690964":false,"22709631900":false,"22711471621":false,"22713720920":false,"22725102266":true,"22728931661":false,"22745391141":false,"22895770421":false,"22897530197":false,"22903560009":false,"22907040075":false,"22911291143":false,"22929520066":false,"23074360354":true,"23198110494":false,"23209430324":false,"23259370132":false,"23259670185":false,"23264540819":false,"23299220276":false,"23352861432":false,"23656400178":false,"23661620235":false,"23668020579":false,"23671300516":false,"23675750015":false,"23856490039":false,"23890990036":false,"23917540015":false,"24011440618":false,"24122550113":false,"24174230406":false,"24176300231":false,"24182141012":false,"24196480475":false,"24198210399":false,"24198220321":false,"24203880427":false,"24205440374":false,"24444870362":true,"24449750417":false,"24486761323":false,"24492380981":false,"24497100215":false,"24497990219":false,"24513350157":false,"24531701247":false,"24649420104":false,"24784102017":false,"24789621635":false,"24790631490":false,"24825680026":false,"24829020125":false,"24983120091":false,"25139840448":false,"25142800490":false,"25230210983":false,"25249431541":false,"25257450354":false,"25257641039":false,"25409930781":true,"25535790041":false,"25545660057":false,"25553520023":false,"25565890024":false,"25584040025":false,"25609540030":false,"25711640413":false,"25803070296":false,"25868870454":false,"25874190546":false,"25884100757":false,"25894830011":false,"25957460191":false,"26325861035":false,"26326420980":false,"26343280606":false,"26343450977":false,"26384720489":false,"26412560160":false,"26610992603":false,"26778420367":false,"27215410062":false,"27272500056":false,"27521041224":false,"27682980074":false,"27967340620":true,"28164840375":false,"28205060031":true,"28357860023":true,"28479230387":false,"28481290395":false,"28733340088":false,"28759220077":false,"28789940516":false,"28803450384":false,"28803471021":false,"29239050837":false,"29273550638":false,"29279370410":false,"29631280132":false,"29727970011":true,"29743740051":false,"30071840087":false,"30208890136":false,"30272760777":false,"30277510573":false,"30305320892":false,"30514440027":false,"4657969757945856":false,"4673626016841728":false,"4685118208475136":false,"4687461129912320":true,"4736488370339840":false,"4767832777424896":false,"4823536380936192":false,"4868357648809984":false,"4968211326697472":false,"5083081137192960":false,"5094443211554816":false,"5144818284756992":false,"5187591159414784":true,"5208220340322304":false,"5235014539935744":true,"5246456234246144":true,"5451263625134080":false,"5460842049699840":false,"5463746112389120":true,"5565890725412864":false,"5573821600628736":false,"5595855856599040":false,"5648512562495488":false,"5710297290244096":true,"5769553527963648":false,"5791324237463552":false,"5942552751243264":false,"5979763131547648":false,"6008860543025152":true,"6204410169131008":false,"6229730667003904":false,"6275548880568320":false,"6319398626000896":false,"6611083146821632":false,"6693066547920896":false},"visitorId":"Va2MObags9lSz5vchyE4f59REJMAC3q4d.veR.PVTq8","visitorIp":"37.19.198.74","webManExt":0},t=null;d.set("msVersion","v1_46_0_v1_46_0"),d.set("requestId",e.requestId),d.set("projectId",e.projectId),d.set("data",e),d.set("disableTracking",e.disableTracking),d.set("dynamicWebsiteSupport",e.dynamicWebsiteSupport),dt(e,t),o.t()&&(o.o("edge-end"),o.u("edgeExecution","edge-end","edge-begin")),"rum"in e&&ht(e,Date.now()).then((e=>{e&&e.status&&D.j(`${gt} / Tracked RUM: ${e.status}`)}),(e=>{N(gt,{message:"0.3: RUM Error",err:e})}))}}}();

})()