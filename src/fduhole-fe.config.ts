const pksjson = require('../package.json')

export default {
  // 基本信息配置
  feRepository: 'https://www.github.com/fduhole/vue',
  teamHomepage: 'https://www.github.com/fduhole',
  teamMail: 'fduhole@gmail.com',
  latestReleasePkgJSON: 'https://cdn.jsdelivr.net/gh/fduhole/vue@master/package.json', // 前端最新发布版版本号获取地址
  feVersion: pksjson.version,
  backEndApi: 'https://hole.hath.top/', // 后端 api 地址
  backEndWebsocketApi: 'wss://hole.hath.top/ws/notification',

  // 协议
  licenses: [
    {
      name: '社区公约',
      link: 'https://cdn.jsdelivr.net/gh/fduhole/vue@master/community-agreement.md'
    },
    {
      name: '使用条款',
      link: 'https://cdn.jsdelivr.net/gh/fduhole/vue@master/terms-of-use.md'
    },
    {
      name: '隐私政策',
      link: 'https://cdn.jsdelivr.net/gh/fduhole/vue@master/privacy-policy.md'
    },
    {
      name: '开源协议',
      link: 'https://cdn.jsdelivr.net/gh/fduhole/vue@master/open-source-licenses.md'
    }
  ],

  // 页面元素显示配置
  allowBackRoutes: ['discussion', 'license', 'search'], // 允许显示“返回”按钮的路由名称
  banMenuRoutes: ['login', 'register', 'license', 'discussion', 'search'], // 禁止显示“菜单”按钮的路由名称
  navItems: [ // 抽屉导航菜单
    {
      title: '首页',
      icon: 'mdi-home',
      route: '/home'
    },
    {
      title: '分区',
      icon: 'mdi-home',
      route: '/division',
      group: true
    },
    {
      title: '收藏',
      icon: 'mdi-star',
      route: '/collections'
    },
    {
      title: '我的',
      icon: 'mdi-account',
      route: '/me'
    },
    {
      title: '关于',
      icon: 'mdi-information',
      route: '/about'
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
