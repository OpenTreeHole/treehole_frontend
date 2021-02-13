importScripts("/precache-manifest.5297cf3325635353734ee090a1ba91ad.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");



// self.addEventListener("message", (e)=>{
//   if (e.data.action=='skipWaiting') {
//     console.log('skip waiting')
//     self.skipWaiting()
//   }
// })

self.addEventListener('install', async event => {
  await self.skipWaiting()
  console.log('skip waiting')
})

self.addEventListener('active', async event => {
  console.log('active', event)
  await workbox.core.clientsClaim()
})

if (workbox) {

  console.log(`Workbox is loaded`);

  self.__precacheManifest = [].concat(self.__precacheManifest || []);
  workbox.precaching.precacheAndRoute(self.__precacheManifest);

  workbox.routing.registerRoute(
    /^https:\/\/www\.fduhole\.tk\/api\/.*/, // 匹配的路由
    workbox.strategies.networkFirst({cacheName: 'api'})
  )

  workbox.routing.registerRoute(
    /^https:\/\/cdn\.jsdelivr\.net\/gh\/fduhole\/web@img\/.*/, // 匹配的路由
    // workbox.strategies.staleWhileRevalidate({cacheName: 'img'}),
    new workbox.strategies.CacheFirst({
      plugins: [
        new workbox.cacheableResponse.Plugin({
          statuses: [0, 200]
        })
      ]
    }),
  )
} 
else {
  console.log(`Workbox didn't load`);
}

