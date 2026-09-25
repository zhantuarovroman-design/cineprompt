const CACHE='cineprompt-v6';
const APP_SHELL=[
  './','./index.html','./coverage.html','./multishot.html','./manifest.webmanifest',
  './styles.css','./modes.css','./previews.css','./preview-fix.css','./movement.css','./coverage.css','./atlas.css?v=6','./coverage-page.css','./multishot.css',
  './app.js?v=5','./movement-bank.js','./coverage-page.js?v=4','./multishot.js?v=4','./pwa.js',
  './assets/icons/icon.svg','./assets/icons/icon-maskable.svg',
  './assets/previews/camera-sensor-atlas.png','./assets/previews/focal-length-atlas.png',
  './assets/previews/cameras/arri-alexa-35.png','./assets/previews/cameras/arri-alexa-mini-lf.png','./assets/previews/cameras/sony-venice-2.png','./assets/previews/cameras/red-v-raptor-xl.png','./assets/previews/cameras/blackmagic-ursa-cine-12k.png','./assets/previews/cameras/arricam-lt-kodak-vision3.png','./assets/previews/cameras/panavision-system-65.png',
  './assets/previews/focals/18mm.png','./assets/previews/focals/25mm.png','./assets/previews/focals/35mm.png','./assets/previews/focals/50mm.png','./assets/previews/focals/85mm.png','./assets/previews/focals/135mm.png'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok&&new URL(event.request.url).origin===self.location.origin){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
    return response;
  }).catch(()=>event.request.mode==='navigate'?caches.match('./index.html'):undefined)));
});
