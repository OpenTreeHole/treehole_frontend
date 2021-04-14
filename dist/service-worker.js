importScripts("/precache-manifest.bf9594aa43242b201c8ed16bee42670d.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");



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
  console.log('active')
  console.log('active', event)
  await self.clientsClaim()
})

let online = true
setInterval(() => {
  fetch('online').then(() => {
    if(!online){
      this.clients.matchAll()
      .then(function (clients){
        console.log(clients)
        if (clients && clients.length) {
          clients.forEach((client) => {
              client.postMessage({msg: '网络连接已恢复, 请刷新以获取最新内容', status: 'success'})
          })
        }
      })
    }
    online = true
  }).catch(() => {
    if(online){
      this.clients.matchAll()
      .then(function (clients){
        console.log(clients)
        if (clients && clients.length) {
          clients.forEach((client) => {
              client.postMessage({msg: '网络已断开, 正在以离线模式浏览', status: 'warning'})
          })
        }
      })
    }
    online = false
  })
}, 10000)

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

