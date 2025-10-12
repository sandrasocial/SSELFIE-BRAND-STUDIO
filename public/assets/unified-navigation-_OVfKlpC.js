import{r as d,j as e,U as C}from"./stackauth-DztS4c1S.js";import{g as c,u as N,f as S,C as $,U as u,X as g}from"./index-BddbrSOF.js";const z=c("CreditCard",[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]]),L=c("Home",[["path",{d:"m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"y5dka4"}],["polyline",{points:"9 22 9 12 15 12 15 22",key:"e2us08"}]]),T=c("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]),b=c("Shield",[["path",{d:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10",key:"1irkt0"}]]),a={editorialHeadline:"font-serif font-light leading-tight tracking-wide text-stone-900",editorialHeadlineLarge:"font-serif text-5xl sm:text-6xl font-light leading-tight tracking-wide text-stone-900",editorialHeadlineMedium:"font-serif text-3xl sm:text-4xl font-light leading-tight tracking-wide text-stone-900",body:"font-sans text-base font-light leading-relaxed text-stone-700",bodyLarge:"font-sans text-lg font-light leading-relaxed text-stone-700",bodySmall:"font-sans text-sm font-light leading-normal text-stone-600",caption:"font-sans text-xs font-light leading-normal tracking-wide uppercase text-stone-500",label:"font-sans text-sm font-medium leading-normal tracking-normal text-stone-700",button:"font-sans text-sm font-medium leading-none tracking-wide uppercase"},O={brand:{primary:"text-4xl sm:text-5xl font-serif font-thin tracking-widest text-stone-900 uppercase leading-none"}};function W({transparent:f=!0,darkText:E=!1,showAuth:h=!0}){const[o,s]=N(),[r,i]=d.useState(!1),[w,y]=d.useState(!1),{user:n}=S();d.useEffect(()=>{const t=()=>{const j=window.scrollY>50;y(j)};return window.addEventListener("scroll",t),()=>window.removeEventListener("scroll",t)},[]),d.useEffect(()=>{window.scrollTo(0,0)},[]);const l=t=>!!(t==="/maya"&&(o==="/maya"||o==="/studio")||t!=="/maya"&&o.startsWith(t));n?.email;const x=n?.email==="shannon@soulresets.com"&&n?.role==="user",p=n?[{path:"/maya",label:"Studio",icon:L},{path:"/sselfie-gallery",label:"Gallery",icon:$},{path:"/account-settings",label:"Account",icon:u}]:[],m=()=>{window.location.href="/api/auth/logout"},k=`
    ${O.brand.primary}
    cursor-pointer
    touch-manipulation
    transition-all
    duration-300
    ease-sophisticated
    select-none
  `,v=w||!f||r?"bg-black/90 backdrop-blur-md":"bg-transparent";return e.jsxs("nav",{role:"navigation","aria-label":"Main navigation",className:`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-sophisticated ${v}`,children:[e.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("button",{onClick:t=>{t.preventDefault(),o==="/maya"||o==="/studio"?window.scrollTo({top:0,behavior:"smooth"}):s("/maya")},"aria-label":"SSELFIE home page",className:k,style:{fontFamily:"Times New Roman, serif",minHeight:"44px",display:"flex",alignItems:"center"},itemProp:"publisher",itemScope:!0,itemType:"https://schema.org/Organization",children:e.jsx("span",{itemProp:"name",children:"SSELFIE"})}),e.jsxs("div",{className:"hidden md:flex items-center space-x-8",role:"menubar",children:[p.map(t=>e.jsxs("button",{onClick:()=>s(t.path),role:"menuitem","aria-current":l(t.path)?"page":void 0,"aria-label":`Navigate to ${t.label}`,className:`
                  ${a.caption}
                  flex items-center gap-2
                  transition-all duration-300 ease-sophisticated
                  px-3 py-2 rounded-lg
                  ${l(t.path)?"text-white bg-white/10":"text-white/70 hover:text-white hover:bg-white/5"}
                `,children:[e.jsx(t.icon,{size:16,strokeWidth:1.2}),t.label]},t.path)),h&&e.jsx("div",{className:"flex items-center gap-4",role:"menuitem",children:n?e.jsxs(e.Fragment,{children:[e.jsx(C,{showUserInfo:!1,extraItems:[{text:"Subscription & Billing",icon:e.jsx(z,{size:16,strokeWidth:1.2}),onClick:()=>s("/account-settings?tab=billing")},{text:"Business Profile",icon:e.jsx(u,{size:16,strokeWidth:1.2}),onClick:()=>s("/profile")}]}),x&&e.jsxs("button",{onClick:async()=>{try{(await fetch("/api/admin/stop-impersonation",{method:"POST",headers:{"Content-Type":"application/json","x-admin-token":"sandra-admin-2025"}})).ok&&(window.location.href="/admin-dashboard")}catch(t){console.error("Failed to stop impersonation:",t)}},"aria-label":"Stop impersonation and return to admin dashboard",className:`
                          ${a.caption}
                          text-white/70 hover:text-white
                          transition-all duration-300 ease-sophisticated
                          flex items-center gap-2
                          px-3 py-2 rounded-lg hover:bg-white/5
                        `,children:[e.jsx(b,{size:16,strokeWidth:1.2}),"Back to Admin"]}),e.jsx("button",{onClick:m,"aria-label":"Logout from account",className:`
                        ${a.button}
                        text-white border border-white/30 hover:bg-white hover:text-black
                        transition-all duration-300 ease-sophisticated
                        px-6 py-2 rounded-lg
                        min-h-[44px]
                      `,children:"LOGOUT"})]}):e.jsx(e.Fragment,{children:e.jsx("button",{onClick:()=>window.location.href="/handler/sign-in","aria-label":"Sign in to account",className:`
                        ${a.button}
                        text-white border border-white/30 hover:bg-white hover:text-black
                        transition-all duration-300 ease-sophisticated
                        px-6 py-2 rounded-lg
                        min-h-[44px]
                      `,children:"LOGIN"})})})]}),e.jsx("button",{onClick:()=>i(!r),"aria-label":"Toggle mobile menu","aria-expanded":r,"aria-controls":"mobile-menu",className:`
              md:hidden
              ${a.caption}
              text-white/70 hover:text-white
              transition-all duration-300 ease-sophisticated
              p-2 rounded-lg hover:bg-white/5
            `,children:r?e.jsx(g,{size:20,strokeWidth:1.5}):e.jsx(T,{size:20,strokeWidth:1.5})})]})}),r&&e.jsx("div",{id:"mobile-menu",role:"dialog","aria-modal":"true","aria-label":"Mobile navigation menu",className:"md:hidden fixed top-0 left-0 right-0 bottom-0 z-[999] bg-black/97 backdrop-blur-md",style:{background:"rgba(0, 0, 0, 0.97)"},children:e.jsxs("div",{className:"flex flex-col items-center justify-center h-full space-y-8 px-6",role:"menu",children:[p.map(t=>e.jsxs("button",{onClick:()=>{s(t.path),i(!1)},role:"menuitem","aria-current":l(t.path)?"page":void 0,"aria-label":`Navigate to ${t.label}`,className:`
                  ${a.body}
                  text-white
                  flex items-center gap-3
                  transition-all duration-300 ease-sophisticated
                  px-4 py-3 rounded-lg
                  ${l(t.path)?"bg-white/10":"hover:bg-white/5"}
                `,children:[e.jsx(t.icon,{size:18,strokeWidth:1.2}),t.label]},t.path)),h&&e.jsx(e.Fragment,{children:n?e.jsxs(e.Fragment,{children:[x&&e.jsxs("button",{onClick:async()=>{try{(await fetch("/api/admin/stop-impersonation",{method:"POST",headers:{"Content-Type":"application/json","x-admin-token":"sandra-admin-2025"}})).ok&&(window.location.href="/admin-dashboard")}catch(t){console.error("Failed to stop impersonation:",t)}i(!1)},className:`
                          ${a.caption}
                          text-white/70 hover:text-white
                          transition-all duration-300 ease-sophisticated
                          mt-8 flex items-center gap-3
                          px-4 py-3 rounded-lg hover:bg-white/5
                        `,children:[e.jsx(b,{size:18,strokeWidth:1.2}),"Back to Admin"]}),e.jsx("button",{onClick:()=>{m(),i(!1)},className:`
                        ${a.button}
                        text-white border border-white/30 hover:bg-white hover:text-black
                        transition-all duration-300 ease-sophisticated
                        mt-8 px-6 py-3 rounded-lg
                      `,children:"LOGOUT"})]}):e.jsx(e.Fragment,{children:e.jsx("button",{onClick:()=>{window.location.href="/handler/sign-in",i(!1)},className:`
                        ${a.button}
                        text-white border border-white/30 hover:bg-white hover:text-black
                        transition-all duration-300 ease-sophisticated
                        px-6 py-3 rounded-lg
                      `,children:"LOGIN"})})}),e.jsx("button",{onClick:()=>i(!1),className:`
                absolute top-6 right-6
                ${a.caption}
                text-white/70 hover:text-white
                transition-all duration-300 ease-sophisticated
                p-2 rounded-lg hover:bg-white/5
              `,children:e.jsx(g,{size:20,strokeWidth:1.5})})]})})]})}export{a as T,W as U};
