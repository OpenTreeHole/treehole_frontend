// self.addEventListener("message", (e)=>{
//   if (e.data.action=='skipWaiting') {
//     console.log('skip waiting')
//     self.skipWaiting()
//   }
// })
// noinspection JSUnresolvedVariable,JSUnresolvedFunction

self.addEventListener('install', async () => {
  await self.skipWaiting()
  console.log('skip waiting')
})

self.addEventListener('active', async event => {
  console.log('active')
  console.log('active', event)
  await self.clientsClaim()
})

let online = true
setInterval(async () => {
  try {
    await fetch('online')
    if (!online) {
      online = true
      const clients = await this.clients.matchAll()
      console.log(clients)
      if (clients && clients.length) {
        clients.forEach((client) => {
          client.postMessage({
            msg: '网络连接已恢复, 请刷新以获取最新内容',
            status: 'success'
          })
        })
      }
    }
  } catch (e) {
    if (online) {
      online = false
      const clients = await this.clients.matchAll()
      console.log(clients)
      if (clients && clients.length) {
        clients.forEach((client) => {
          client.postMessage({
            msg: '网络已断开, 正在以离线模式浏览',
            status: 'warning'
          })
        })
      }
    }
  }
}, 10000)

// eslint-disable-next-line no-undef
if (workbox) {
  console.log('Workbox is loaded')

  self.__precacheManifest = [].concat(self.__precacheManifest || [])
  // eslint-disable-next-line no-undef
  workbox.precaching.precacheAndRoute(self.__precacheManifest)

  // eslint-disable-next-line no-undef
  workbox.routing.registerRoute(
    /^https:\/\/www\.fduhole\.com\/api\/.*/, // 匹配的路由
    // eslint-disable-next-line no-undef
    workbox.strategies.networkFirst({ cacheName: 'api' })
  )

  // eslint-disable-next-line no-undef
  workbox.routing.registerRoute(
    /^https:\/\/cdn\.jsdelivr\.net\/gh\/fduhole\/web@img\/.*/, // 匹配的路由
    // workbox.strategies.staleWhileRevalidate({cacheName: 'img'}),
    // eslint-disable-next-line no-undef
    new workbox.strategies.CacheFirst({
      plugins: [
        // eslint-disable-next-line no-undef
        new workbox.cacheableResponse.Plugin({
          statuses: [0, 200]
        })
      ]
    })
  )
} else {
  console.log('Workbox didn\'t load')
}
