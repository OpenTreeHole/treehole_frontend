/* eslint-disable no-console */

import { register } from 'register-service-worker'

const notifyOffline = async function () {
  if(Notification.permission === 'default'){
    await Notification.requestPermission()
  }
  new Notification('网络已断开', {body: '正在以离线模式浏览'})
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
      document.dispatchEvent(
        new CustomEvent('offline', { detail: '网络已断开, 正在以离线模式浏览' })
      );
      console.log('No internet connection found. App is running in offline mode.')
    },
    error (error) {
      console.error('Error during service worker registration:', error)
    }
  })
}
