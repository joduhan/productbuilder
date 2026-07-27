const CACHE_NAME="tarot-reading-v1";

const CORE_ASSETS=[
    "index.html",
    "about.html",
    "privacy.html",
    "encyclopedia.html",
    "tarot-data.js",
    "manifest.json",
    "icon.svg"
];

self.addEventListener("install",event=>{

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE_ASSETS))
    );

    self.skipWaiting();

});

self.addEventListener("activate",event=>{

    event.waitUntil(
        caches.keys().then(keys=>Promise.all(
            keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))
        ))
    );

    self.clients.claim();

});

self.addEventListener("fetch",event=>{

    if(event.request.method!=="GET") return;
    if(!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request).then(cached=>{

            const fetchPromise=fetch(event.request).then(response=>{
                if(response && response.status===200){
                    const clone=response.clone();
                    caches.open(CACHE_NAME).then(cache=>cache.put(event.request,clone));
                }
                return response;
            }).catch(()=>cached);

            return cached || fetchPromise;

        })
    );

});
