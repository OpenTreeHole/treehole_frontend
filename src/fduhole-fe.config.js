var pksjson = require('../package.json');

export default {
    // 后端 api 地址，配套后端的源码请移步 https://github.com/fduhole/fduhole
    backEndApi: 'https://www.fduhole.tk/api/',
    // 前端版本号
    feVersion: pksjson.version,
    // 涉及的协议
    licences: [
        {
            name: '社区公约',
            link: '/docs/community-agreement.html',
        },
        {
            name: '使用条款',
            link: '/docs/terms-of-use.html',
        },
        {
            name: '隐私政策',
            link: '/docs/privacy-policy.html',
        },
        // {
        //   name: '开源协议',
        //   link: '/docs/open-source-licences.html',
        // },
    ],
    // 允许显示返回按钮的路由名称
    allowBackRoutes: ['discussion', 'licence'],
    // 禁止显示菜单按钮的路由名称
    banMenuRoutes: ['login', 'register', 'licence', 'discussion'],
    // 抽屉菜单导航列表
    navItems: [
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
    friendLinks: [
        {
            siteName: '旦兮',
            author: 'DanXi-Dev',
            link: 'https://danxi-dev.github.io'
        }
    ]
}
