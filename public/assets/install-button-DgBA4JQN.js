import{r,j as d}from"./stackauth-DztS4c1S.js";class u{deferredPrompt=null;isInstalled=!1;constructor(){this.init()}init(){this.checkInstallStatus(),window.addEventListener("beforeinstallprompt",t=>{t.preventDefault(),this.deferredPrompt=t,this.showInstallBanner()}),window.addEventListener("appinstalled",()=>{this.isInstalled=!0,this.hideInstallBanner(),this.trackInstallation()}),this.registerServiceWorker()}async registerServiceWorker(){if("serviceWorker"in navigator&&!/handler\//.test(window.location.pathname))try{const t=await navigator.serviceWorker.register("/sw.js");t.addEventListener("updatefound",()=>{const e=t.installing;e&&e.addEventListener("statechange",()=>{try{e.state==="installed"&&navigator.serviceWorker.controller&&this.showUpdateAvailable()}catch(n){console.warn("SSELFIE Studio: Service Worker state change error",n)}})})}catch(t){console.warn("SSELFIE Studio: Service Worker registration failed (expected in dev)",t)}}checkInstallStatus(){window.matchMedia("(display-mode: standalone)").matches&&(this.isInstalled=!0),document.referrer.includes("android-app://")&&(this.isInstalled=!0)}async showInstallPrompt(){if(!this.deferredPrompt)return!1;try{await this.deferredPrompt.prompt();const{outcome:t}=await this.deferredPrompt.userChoice;return t==="accepted"}catch(t){return console.error("SSELFIE Studio: Install prompt failed",t),!1}}showInstallBanner(){const t=document.createElement("div");t.id="pwa-install-banner",t.innerHTML=`
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
      `,document.body.appendChild(t)}}trackInstallation(){try{const t=window;t.gtag&&t.gtag("event","pwa_install",{event_category:"engagement",event_label:"PWA installed"})}catch{console.debug("Analytics tracking not available")}}get canInstall(){return!!this.deferredPrompt&&!this.isInstalled}get isAppInstalled(){return this.isInstalled}}const s=new u;function m({variant:i="default",className:t=""}){const[e,n]=r.useState(!1),[c,o]=r.useState(!1);r.useEffect(()=>{const a=()=>{n(s.canInstall),o(s.isAppInstalled)};a();const p=setInterval(a,2e3);return()=>clearInterval(p)},[]);const l=async()=>{await s.showInstallPrompt()&&(n(!1),o(!0))};return c||!e?null:i==="minimal"?d.jsx("button",{onClick:l,className:`text-xs uppercase tracking-[0.3em] font-light text-gray-600 hover:text-black transition-colors underline ${t}`,children:"Install App"}):d.jsx("button",{onClick:l,className:`
        bg-black text-white px-6 py-3
        text-xs uppercase tracking-[0.3em] font-light
        border-0 hover:bg-gray-800 transition-colors
        ${t}
      `,children:"Install SSELFIE Studio"})}export{m as I};
