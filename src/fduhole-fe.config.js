var pksjson = require('../package.json');

export default {
    // 基本信息配置
    feRepository: 'https://www.github.com/fduhole/vue',
    teamHomepage: 'https://www.github.com/fduhole',
    teamMail: 'fduhole@gmail.com',
    latestReleasePkgJSON: 'https://cdn.jsdelivr.net/gh/fduhole/vue@master/package.json',     // 前端最新发布版版本号获取地址
    feVersion: pksjson.version,
    //配套后端的源码请移步 https://github.com/fduhole/fduhole
    backEndApi: 'https://www.fduhole.tk/api/',                                               // 后端 api 地址

    // 协议
    licences: [
        {
            name: '社区公约',
            link: 'https://cdn.jsdelivr.net/gh/fduhole/vue@master/community-agreement.md',
        },
        {
            name: '使用条款',
            link: 'https://cdn.jsdelivr.net/gh/fduhole/vue@master/terms-of-use.md',
        },
        {
            name: '隐私政策',
            link: 'https://cdn.jsdelivr.net/gh/fduhole/vue@master/privacy-policy.md',
        },
        {
            name: '开源协议',
            link: 'https://cdn.jsdelivr.net/gh/fduhole/vue@master/open-source-licences.md',
        },
    ],

    // 页面元素显示配置
    allowBackRoutes: ['discussion', 'licence'],                         // 允许显示“返回”按钮的路由名称
    banMenuRoutes: ['login', 'register', 'licence', 'discussion'],      // 禁止显示“菜单”按钮的路由名称
    navItems: [                                                         // 抽屉导航菜单
        {
            title: '首页',
            icon: 'mdi-home',
            route: 'home',
        },
        // {
        //   title: '账户',
        //   icon:'',
        //   route: '/user'
        // },
        {
            title: '关于',
            icon: 'mdi-information',
            route: 'about',
        },
    ],
    friendLinks: [                                                      // 友链
        {
            siteName: '旦兮 App',
            author: 'DanXi-Dev',
            link: 'https://danxi-dev.github.io'
        }
    ]
}
