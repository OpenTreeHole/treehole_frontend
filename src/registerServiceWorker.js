/* eslint-disable no-console */

import { register } from 'register-service-worker'

// eslint-disable-next-line no-unused-vars
const notifyOffline = async function (data) {
  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }
  // eslint-disable-next-line no-new
  new Notification('网络已断开', { body: '正在以离线模式浏览' })
}

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready () {
      console.log(
        'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB'
      )
    },
    registered () {
      console.log('Service worker has been registered.')
      navigator.serviceWorker.addEventListener('message', function (event) {
        if (event.data.status === 'success') {
          document.dispatchEvent(
            new CustomEvent('onlined', { detail: event.data.msg })
          )
        }
        if (event.data.status === 'warning') {
          document.dispatchEvent(
            new CustomEvent('offlined', { detail: event.data.msg })
          )
        }
      })
    },
    cached () {
      console.log('Content has been cached for offline use.')
    },
    updatefound () {
      console.log('New content is downloading.')
    },
    updated () {
      console.log('New content is available; please refresh.')
    },
    offline () {
      // notifyOffline()
      console.log('No internet connection found. App is running in offline mode.')
      // document.dispatchEvent(
      //   new CustomEvent('offline', { detail: '网络已断开, 正在以离线模式浏览' })
      // );
    },
    error (error) {
      console.error('Error during service worker registration:', error)
    }
  })
}
