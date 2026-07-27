const CACHE_NAME="tarot-reading-v2";
const IMAGE_CACHE_NAME="tarot-card-images-v1";

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

    const keepCaches=[CACHE_NAME,IMAGE_CACHE_NAME];

    event.waitUntil(
        caches.keys().then(keys=>Promise.all(
            keys.filter(key=>!keepCaches.includes(key)).map(key=>caches.delete(key))
        ))
    );

    self.clients.claim();

});

self.addEventListener("fetch",event=>{

    if(event.request.method!=="GET") return;

    const url=new URL(event.request.url);

    if(url.hostname==="upload.wikimedia.org"){

        event.respondWith(
            caches.open(IMAGE_CACHE_NAME).then(cache=>
                cache.match(event.request).then(cached=>{
                    if(cached) return cached;
                    return fetch(event.request).then(response=>{
                        if(response && response.status===200){
                            cache.put(event.request,response.clone());
                        }
                        return response;
                    });
                })
            )
        );

        return;

    }

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
