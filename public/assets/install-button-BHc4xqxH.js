import{j as o}from"./index-Dww5k1Pu.js";import{r as n}from"./stackauth-DQoC2kQW.js";class u{deferredPrompt=null;isInstalled=!1;constructor(){this.init()}init(){this.checkInstallStatus(),window.addEventListener("beforeinstallprompt",t=>{t.preventDefault(),this.deferredPrompt=t,this.showInstallBanner()}),window.addEventListener("appinstalled",()=>{this.isInstalled=!0,this.hideInstallBanner(),this.trackInstallation()}),this.registerServiceWorker()}async registerServiceWorker(){}checkInstallStatus(){window.matchMedia("(display-mode: standalone)").matches&&(this.isInstalled=!0),document.referrer.includes("android-app://")&&(this.isInstalled=!0)}async showInstallPrompt(){if(!this.deferredPrompt)return!1;try{await this.deferredPrompt.prompt();const{outcome:t}=await this.deferredPrompt.userChoice;return t==="accepted"}catch(t){return console.error("SSELFIE Studio: Install prompt failed",t),!1}}showInstallBanner(){const t=document.createElement("div");t.id="pwa-install-banner",t.innerHTML=`
      <div style="
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #0a0a0a;
        color: white;
        padding: 16px 24px;
        border-radius: 0;
        z-index: 10000;
        font-family: 'Times New Roman', serif;
        font-size: 14px;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        max-width: 320px;
        text-align: center;
        animation: slideUp 0.3s ease-out;
      ">
        <div style="margin-bottom: 12px; font-weight: 300;">
          Install SSELFIE Studio
        </div>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="pwa-install-btn" style="
            background: white;
            color: #0a0a0a;
            border: none;
            padding: 8px 16px;
            font-size: 11px;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            cursor: pointer;
            font-family: inherit;
          ">Install</button>
          <button id="pwa-dismiss-btn" style="
            background: transparent;
            color: white;
            border: 1px solid white;
            padding: 8px 16px;
            font-size: 11px;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            cursor: pointer;
            font-family: inherit;
          ">Later</button>
        </div>
      </div>
      <style>
        @keyframes slideUp {
          from { transform: translate(-50%, 100px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      </style>
    `,document.body.appendChild(t),document.getElementById("pwa-install-btn")?.addEventListener("click",()=>{this.showInstallPrompt(),this.hideInstallBanner()}),document.getElementById("pwa-dismiss-btn")?.addEventListener("click",()=>{this.hideInstallBanner()}),setTimeout(()=>{this.hideInstallBanner()},1e4)}hideInstallBanner(){const t=document.getElementById("pwa-install-banner");t&&(t.style.animation="slideDown 0.3s ease-out forwards",setTimeout(()=>t.remove(),300))}showUpdateAvailable(){if(window.location.pathname==="/"){const t=document.createElement("div");t.innerHTML=`
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #0a0a0a;
          color: white;
          padding: 12px;
          text-align: center;
          font-size: 12px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          z-index: 10001;
        ">
          New version available. Refresh to update.
        </div>
      `,document.body.appendChild(t)}}trackInstallation(){try{const t=window;t.gtag&&t.gtag("event","pwa_install",{event_category:"engagement",event_label:"PWA installed"})}catch{console.debug("Analytics tracking not available")}}get canInstall(){return!!this.deferredPrompt&&!this.isInstalled}get isAppInstalled(){return this.isInstalled}}const a=new u;function h({variant:s="default",className:t=""}){const[d,r]=n.useState(!1),[c,i]=n.useState(!1);n.useEffect(()=>{const e=()=>{r(a.canInstall),i(a.isAppInstalled)};e();const p=setInterval(e,2e3);return()=>clearInterval(p)},[]);const l=async()=>{await a.showInstallPrompt()&&(r(!1),i(!0))};return c||!d?null:s==="minimal"?o.jsxDEV("button",{onClick:l,className:`text-xs uppercase tracking-[0.3em] font-light text-gray-600 hover:text-black transition-colors underline ${t}`,children:"Install App"},void 0,!1,{fileName:"/workspaces/SSELFIE-BRAND-STUDIO/client/src/components/ui/install-button.tsx",lineNumber:41,columnNumber:7},this):o.jsxDEV("button",{onClick:l,className:`
        bg-black text-white px-6 py-3
        text-xs uppercase tracking-[0.3em] font-light
        border-0 hover:bg-gray-800 transition-colors
        ${t}
      `,children:"Install SSELFIE Studio"},void 0,!1,{fileName:"/workspaces/SSELFIE-BRAND-STUDIO/client/src/components/ui/install-button.tsx",lineNumber:51,columnNumber:5},this)}export{h as I};
