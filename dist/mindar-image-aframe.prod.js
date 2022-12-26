(()=>{var t={2792:function(t){t.exports=function(){"use strict";var t=function(){var e=0,i=document.createElement("div");function n(t){return i.appendChild(t.dom),t}function s(t){for(var n=0;n<i.children.length;n++)i.children[n].style.display=n===t?"block":"none";e=t}i.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000",i.addEventListener("click",(function(t){t.preventDefault(),s(++e%i.children.length)}),!1);var a=(performance||Date).now(),r=a,o=0,l=n(new t.Panel("FPS","#0ff","#002")),h=n(new t.Panel("MS","#0f0","#020"));if(self.performance&&self.performance.memory)var d=n(new t.Panel("MB","#f08","#201"));return s(0),{REVISION:16,dom:i,addPanel:n,showPanel:s,begin:function(){a=(performance||Date).now()},end:function(){o++;var t=(performance||Date).now();if(h.update(t-a,200),r+1e3<=t&&(l.update(1e3*o/(t-r),100),r=t,o=0,d)){var e=performance.memory;d.update(e.usedJSHeapSize/1048576,e.jsHeapSizeLimit/1048576)}return t},update:function(){a=this.end()},domElement:i,setMode:s}};return t.Panel=function(t,e,i){var n=1/0,s=0,a=Math.round,r=a(window.devicePixelRatio||1),o=80*r,l=48*r,h=3*r,d=2*r,c=3*r,u=15*r,p=74*r,m=30*r,f=document.createElement("canvas");f.width=o,f.height=l,f.style.cssText="width:80px;height:48px";var g=f.getContext("2d");return g.font="bold "+9*r+"px Helvetica,Arial,sans-serif",g.textBaseline="top",g.fillStyle=i,g.fillRect(0,0,o,l),g.fillStyle=e,g.fillText(t,h,d),g.fillRect(c,u,p,m),g.fillStyle=i,g.globalAlpha=.9,g.fillRect(c,u,p,m),{dom:f,update:function(l,v){n=Math.min(n,l),s=Math.max(s,l),g.fillStyle=i,g.globalAlpha=1,g.fillRect(0,0,o,u),g.fillStyle=e,g.fillText(a(l)+" "+t+" ("+a(n)+"-"+a(s)+")",h,d),g.drawImage(f,c+r,u,p-r,m,c,u,p-r,m),g.fillRect(c+p-r,u,r,m),g.fillStyle=i,g.globalAlpha=.9,g.fillRect(c+p-r,u,r,a((1-l/v)*m))}}},t}()}},e={};function i(n){var s=e[n];if(void 0!==s)return s.exports;var a=e[n]={exports:{}};return t[n].call(a.exports,a,a.exports,i),a.exports}i.n=t=>{var e=t&&t.__esModule?()=>t.default:()=>t;return i.d(e,{a:e}),e},i.d=(t,e)=>{for(var n in e)i.o(e,n)&&!i.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:e[n]})},i.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),(()=>{"use strict";const t=t=>null==t,e="arError",n="image-markerFound",s="image-markerLost",a="mindar-image-system";AFRAME.registerComponent("mindar-image",{dependencies:[a],el:null,schema:{imageTargetSrc:{type:"string"},maxTrack:{type:"int",default:1},filterMinCF:{type:"number",default:-1},filterBeta:{type:"number",default:-1},missTolerance:{type:"int",default:-1},warmupTolerance:{type:"int",default:-1},showStats:{type:"boolean",default:!1},autoStart:{type:"boolean",default:!0},uiLoading:{type:"string",default:"yes"},uiScanning:{type:"string",default:"yes"},uiError:{type:"string",default:"yes"},reshowScanning:{type:"boolean",default:!0},shouldFaceUser:{type:"boolean",default:!1},_positionSettings:{type:"string",default:"absolute"},_positionZIndex:{type:"int",default:-2}},init:function(){if(!this.el.sceneEl)return;const t=this.el.sceneEl.systems["mindar-image-system"];t.setup({imageTargetSrc:this.data.imageTargetSrc,maxTrack:this.data.maxTrack,filterMinCF:-1===this.data.filterMinCF?null:this.data.filterMinCF,filterBeta:-1===this.data.filterBeta?null:this.data.filterBeta,missTolerance:-1===this.data.missTolerance?null:this.data.missTolerance,warmupTolerance:-1===this.data.warmupTolerance?null:this.data.warmupTolerance,showStats:this.data.showStats,uiLoading:this.data.uiLoading,uiScanning:this.data.uiScanning,uiError:this.data.uiError,reshowScanning:this.data.reshowScanning,shouldFaceUser:this.data.shouldFaceUser,_positionSettings:this.data._positionSettings,_positionZIndex:this.data._positionZIndex}),this.data.autoStart&&this.el.sceneEl.addEventListener("renderstart",(()=>{t.start()}))}}),AFRAME.registerComponent("mindar-image-target",{dependencies:[a],el:null,postMatrix:null,schema:{targetIndex:{type:"number"}},init:function(){if(!this.el.sceneEl)return;this.el.sceneEl.systems["mindar-image-system"].registerAnchor(this,this.data.targetIndex);const t=this.el.object3D;t.visible=!1,t.matrixAutoUpdate=!1},setupMarker([t,e]){const i=new AFRAME.THREE.Vector3,n=new AFRAME.THREE.Quaternion,s=new AFRAME.THREE.Vector3;i.x=t/2,i.y=t/2+(e-t)/2,s.x=t,s.y=t,s.z=t,this.postMatrix=new AFRAME.THREE.Matrix4,this.postMatrix.compose(i,n,s)},updateWorldMatrix(t){if(!this.el.object3D.visible&&t?this.el.emit(n):this.el.object3D.visible&&!t&&this.el.emit(s),this.el.object3D.visible=!!t,!t)return;const e=new AFRAME.THREE.Matrix4;e.elements=t,e.multiply(this.postMatrix),this.el.object3D.matrix=e}});var r=i(2792),o=i.n(r);const{Controller:l,UI:h}=window.MINDAR.IMAGE;AFRAME.registerSystem(a,{container:null,video:null,anchorEntities:[],imageTargetSrc:"",maxTrack:-1,filterMinCF:-1/0,filterBeta:1/0,missTolerance:-1/0,warmupTolerance:-1/0,showStats:!1,controller:null,ui:null,el:null,mainStats:null,reshowScanning:!0,shouldFaceUser:!1,_positionSettings:"absolute",_positionZIndex:-2,init:function(){this.anchorEntities=[]},setup:function({imageTargetSrc:e,maxTrack:i,showStats:n,uiLoading:s,uiScanning:a,uiError:r,missTolerance:o,warmupTolerance:l,filterMinCF:d,filterBeta:c,reshowScanning:u,shouldFaceUser:p,_positionSettings:m,_positionZIndex:f}){this.imageTargetSrc=e,this.maxTrack=i,this.filterMinCF=d,this.filterBeta=c,this.missTolerance=o,this.warmupTolerance=l,this.showStats=n,this.reshowScanning=u,this.shouldFaceUser=p,t(m)||(this._positionSettings=m),t(f)||(this._positionZIndex=f),this.ui=new h({uiLoading:s,uiScanning:a,uiError:r}),this._registerEventListener()},_registerEventListener:function(){this.el.addEventListener(n,(()=>{this.ui.hideScanning()})),this.el.addEventListener(s,(()=>{this.reshowScanning&&this.ui.showScanning()}))},registerAnchor:function(t,e){this.anchorEntities.push({el:t,targetIndex:e})},start:function(){this.el.sceneEl&&this.el.sceneEl.parentNode&&(this.container=this.el.sceneEl.parentNode,this.showStats&&(this.mainStats=new(o()),this.mainStats.showPanel(0),this.mainStats.domElement.style.cssText="position: absolute; top: 0px; left: 0px; z-index: 999",this.container.appendChild(this.mainStats.domElement)),this.ui.showLoading(),this._startVideo())},switchTarget:function(t){this.controller.interestedTargetIndex=t},stop:function(){if(this.pause(),!this.video)return;const{srcObject:t}=this.video;t&&(t.getTracks().forEach((function(t){t.stop()})),this.video.remove())},switchCamera:function(){this.shouldFaceUser=!this.shouldFaceUser,this.stop(),this.start()},pause:function(t=!1){t||this.video.pause(),this.controller.stopProcessVideo()},unpause:function(){this.video.play(),this.controller.processVideo(this.video)},_startVideo:async function(){if(this.video=document.createElement("video"),this.video.id="mindar-video",this.video.setAttribute("autoplay",""),this.video.setAttribute("muted",""),this.video.setAttribute("playsinline",""),this.video.style.position=this._positionSettings,this.video.style.top="0px",this.video.style.left="0px",this.video.style.zIndex=`${this._positionZIndex}`,this.container.appendChild(this.video),!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return this.el.emit(e,{error:"VIDEO_FAIL"}),void this.ui.showCompatibility();try{const t=(await navigator.mediaDevices.enumerateDevices()).filter((t=>"videoinput"===t.kind));let e="environment";t.length>1&&(e=this.shouldFaceUser?"user":"environment");const i=await navigator.mediaDevices.getUserMedia({audio:!1,video:{facingMode:e}});this.video.addEventListener("loadedmetadata",(()=>{this.video.setAttribute("width",this.video.videoWidth.toString()),this.video.setAttribute("height",this.video.videoHeight.toString()),this._startAR()})),this.video.srcObject=i}catch(t){console.log("getUserMedia error",t),this.el.emit(e,{error:"VIDEO_FAIL"})}},_startAR:async function(){this.controller=new l({inputWidth:this.video.videoWidth,inputHeight:this.video.videoHeight,maxTrack:this.maxTrack,filterMinCF:this.filterMinCF,filterBeta:this.filterBeta,missTolerance:this.missTolerance,warmupTolerance:this.warmupTolerance,onUpdate:t=>{switch(t.type){case"processDone":this.mainStats&&this.mainStats.update();break;case"updateMatrix":const{targetIndex:e,worldMatrix:i}=t;for(const t of this.anchorEntities)t.targetIndex===e&&t.el.updateWorldMatrix(i)}}}),this._resize(),window.addEventListener("resize",this._resize.bind(this));const{dimensions:t}=await this.controller.addImageTargets(this.imageTargetSrc);for(const e of this.anchorEntities){const{el:i,targetIndex:n}=e;n<t.length&&i.setupMarker(t[n])}await this.controller.dummyRun(this.video),this.el.emit("arReady"),this.ui.hideLoading(),this.ui.showScanning(),this.controller.processVideo(this.video)},_resize:function(){const{vh:t}=((t,e)=>{let i,n;const s=t.videoWidth/t.videoHeight;return s>e.clientWidth/e.clientHeight?(n=e.clientHeight,i=n*s):(i=e.clientWidth,n=i/s),t.style.top=-(n-e.clientHeight)/2+"px",t.style.left=-(i-e.clientWidth)/2+"px",t.style.width=i+"px",t.style.height=n+"px",{vw:i,vh:n}})(this.video,this.container),e=this.container,i=this.controller.getProjectionMatrix(),n=2*Math.atan(1/i[5]/t*e.clientHeight)*180/Math.PI,s=i[14]/(i[10]-1),a=i[14]/(i[10]+1),r=e.clientWidth/e.clientHeight,o=e.getElementsByTagName("a-camera")[0].getObject3D("camera");o.fov=n,o.aspect=r,o.near=s,o.far=a,o.updateProjectionMatrix()}})})()})();