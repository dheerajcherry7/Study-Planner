const CACHE='study-planner-v6';
const FILES=['./','./index.html','./app.css','./app.js','./config.js','./manifest.webmanifest','./assets/study-planner-logo.webp','./assets/study-planner-icon-192.webp','./assets/study-planner-icon-512.webp','./assets/study-planner-icon-192.png','./assets/study-planner-icon-512.png','./assets/study-planner-maskable-512.png','./assets/study-texture.webp','./terms.html','./privacy.html','./404.html','./error.html','./loading.html','./under-construction.html','./login.html','./logout.html','./auth-pages.js','./assets/icon-192.png','./assets/icon-512.png','./assets/apple-touch-icon.png'];
const isAsset=p=>/\.(webp|png|jpe?g|svg|ico|woff2?)$/i.test(p);
// Cache each file on its own so one missing file cannot break the whole install.
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(FILES.map(f=>c.add(f)))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
function store(req,r){if(r&&r.ok&&r.type==='basic'){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r}
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;
 const url=new URL(req.url);if(url.origin!==location.origin)return; // leave Google scripts/fonts/APIs alone
 if(isAsset(url.pathname)){ // images: cache first
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>store(req,r))));return}
 // pages, scripts, styles, config: network first so edits (e.g. config.js) are never stale
 e.respondWith(fetch(req,{cache:'no-cache'}).then(r=>store(req,r)).catch(()=>
  caches.match(req,{ignoreSearch:true}).then(hit=>hit||(req.mode==='navigate'?caches.match('./index.html').then(h=>h||caches.match('./error.html')):Response.error()))));
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>l.length?l[0].focus():self.clients.openWindow('./')))});
