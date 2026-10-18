const VERSION='2026.10.18-cissp.1-c86b3e251d9b2d2fb2f6';
const PREFIX='cissp-navigator-';
const CACHE=PREFIX+VERSION;
const STATUS_CACHE=PREFIX+'source-status';
const url=p=>new URL(p,self.registration.scope).href;
const FILES=[{"path":"index.html","sha256":"b2e6bc487a01095a42973942e1860ed095640ffba512b9069a91050185ba2b19"},{"path":"assets/app.js","sha256":"9918e5802b61ab7ab6ba202dea648f215d7b9027f48e195cc25196089cef1b5e"},{"path":"assets/app.css","sha256":"e69652ba95c85aed9cad9471a6ab39cc137f64e8539cc27e4200320634d04083"},{"path":"favicon.svg","sha256":"50d45f2d42acd9423fb6e1abbe2e55f2c52c76199de18b2b7379db7ba15c123c"},{"path":"icon-192.png","sha256":"ada44e998a23e1604b0c783ef7b795b9dab14bf15a0d8007f2f3d3ca2ddd525b"},{"path":"icon-512.png","sha256":"67b02546c09ce48671a9aa023cf84c13680397de4db64b9d03ea6dbe17d269cf"},{"path":"manifest.webmanifest","sha256":"1b99b1146c2b8949c3e88d51eef521bcaae2a922560cf3f9dbaff164c7490622"}];
self.addEventListener('install',e=>e.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  try{for(const file of FILES){const response=await fetch(url(file.path),{cache:'reload'});if(!response.ok)throw Error('Precache failed');const digest=await crypto.subtle.digest('SHA-256',await response.clone().arrayBuffer());const actual=[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');if(actual!==file.sha256)throw Error('Precache integrity failed');await cache.put(url(file.path),response);}}
  catch(error){await caches.delete(CACHE);throw error;}
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE&&k!==STATUS_CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('message',e=>{if(e.data?.type==='APPLY_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const requestURL=new URL(e.request.url),scopeURL=new URL(self.registration.scope);
  if(requestURL.origin!==scopeURL.origin||!requestURL.pathname.startsWith(scopeURL.pathname))return;
  if(requestURL.pathname===new URL('source-status.json',self.registration.scope).pathname){e.respondWith((async()=>{const cache=await caches.open(STATUS_CACHE);try{const response=await fetch(e.request,{cache:'no-store'});if(!response.ok)throw Error('Source status unavailable');await cache.put(e.request,response.clone());return response;}catch{return (await cache.match(e.request))||(await (await caches.open(CACHE)).match(url('source-status.json')))||Response.error();}})());return;}
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    if(e.request.mode==='navigate')return (await cache.match(url('index.html')))||fetch(e.request);
    return (await cache.match(e.request,{ignoreSearch:true}))||fetch(e.request);
  })());
});
