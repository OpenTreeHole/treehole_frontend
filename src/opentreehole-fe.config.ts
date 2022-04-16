import * as pksjson from '../package.json'

const baseUrl = process.env.BASE_URL

const config = {
  // Basic info
  feRepository: 'https://www.github.com/OpenTreeHole/vue',
  teamHomepage: 'https://www.github.com/OpenTreeHole',
  teamMail: 'danxi_dev@protonmail.com',
  latestReleasePkgJSON: 'https://cdn.jsdelivr.net/gh/OpenTreeHole/vue@master/package.json', // the latest version number of front end.
  feVersion: pksjson.version,
  backEndUrl: 'https://www.fduhole.com/api/',
  authUrl: 'https://auth.fduhole.com/api/',
  backEndWebsocketNotificationApi: 'wss://www.fduhole.com/api/ws/notification',
  backEndWebsocketImageApi: 'wss://www.fduhole.com/api/ws/images',

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
if (process.env.NODE_ENV !== 'production' || process.env.BASE_URL.include('test.fduhole.com')) {
  // development
  config.backEndUrl = 'https://hole.hath.top/api/'
  config.backEndWebsocketNotificationApi = 'wss://hole.hath.top/api/ws/notification'
  config.backEndWebsocketImageApi = 'wss://hole.hath.top/api/ws/images'
  config.authUrl = 'https://testAuth.fduhole.com/api/'
}

export default config
