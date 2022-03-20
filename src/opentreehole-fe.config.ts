const pksjson = require('../package.json')
const baseUrl = process.env.BASE_URL

const config = {
  // 基本信息配置
  feRepository: 'https://www.github.com/OpenTreeHole/vue',
  teamHomepage: 'https://www.github.com/OpenTreeHole',
  teamMail: 'fduhole@gmail.com',
  latestReleasePkgJSON: 'https://cdn.jsdelivr.net/gh/OpenTreeHole/vue@master/package.json', // 前端最新发布版版本号获取地址
  feVersion: pksjson.version,
  backEndApi: 'https://www.fduhole.com/api/', // 后端 api 地址
  backEndWebsocketNotificationApi: 'wss://www.fduhole.com/ws/notification',
  backEndWebsocketImageApi: 'wss://www.fduhole.com/ws/images',

  // 协议
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
  friendLinks: [ // 友链
    {
      siteName: '旦夕 App',
      author: 'DanXi-Dev',
      link: 'https://danxi-dev.github.io'
    }
  ]
}
if (process.env.NODE_ENV !== 'production') { // development
  config.backEndApi = 'https://hole.hath.top/'
  config.backEndWebsocketNotificationApi = 'wss://hole.hath.top/ws/notification'
  config.backEndWebsocketImageApi = 'wss://hole.hath.top/ws/images'
}

export default config
