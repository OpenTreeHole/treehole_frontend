import * as pksjson from '../package.json'
import { pickBy } from 'lodash-es'

const baseUrl = process.env.BASE_URL

const config = {
  // Basic info
  feRepository: 'https://www.github.com/OpenTreeHole/vue',
  teamHomepage: 'https://www.github.com/OpenTreeHole',
  teamMail: 'danxi_dev@protonmail.com',
  latestReleasePkgJSON: 'https://cdn.jsdelivr.net/gh/OpenTreeHole/vue@master/package.json', // the latest version number of front end.
  feVersion: pksjson.version,
  backEndUrl: '/api/',
  authUrl: 'https://auth.fduhole.com/api/',
  authBaseUrl: 'https://auth.fduhole.com/',
  backEndWebsocketNotificationApi: 'wss://www.fduhole.com/api/ws/notification',

  // licenses
  licenses: [
    {
      name: '社区公约',
      type: 'pdf',
      link: `${baseUrl}licenses/fduhole-norms.pdf`
    },
    {
      name: '使用条款',
      type: 'markdown',
      link: `${baseUrl}licenses/terms-of-use.md`
    },
    {
      name: '隐私政策',
      type: 'markdown',
      link: `${baseUrl}licenses/privacy-policy.md`
    },
    {
      name: '开源协议',
      type: 'markdown',
      link: `${baseUrl}licenses/open-source-licenses.md`
    }
  ],
  friendLinks: [
    {
      siteName: '旦夕 App',
      author: 'DanXi-Dev',
      link: 'https://danxi-dev.github.io'
    }
  ]
}

// env

const envConfig = pickBy({
  backEndUrl: process.env.VUE_APP_BACKEND_URL,
  backEndWebsocketNotificationApi: process.env.VUE_APP_BACKEND_WEBSOCKET_NOTIFICATION_API,
  authUrl: process.env.VUE_APP_AUTH_URL,
  authBaseUrl: process.env.VUE_APP_AUTH_BASE_URL
})

export default { ...config, ...envConfig }
