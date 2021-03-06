// noinspection NpmUsedModulesInstalled

// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require('webpack')

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  pwa: {
    name: 'FDU Hole',
    themeColor: '#3175D0',
    msTileColor: '#3175D0',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black-translucent',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      // swSrc is required in InjectManifest mode.
      swSrc: 'src/service-worker.js',
      // ...other Workbox options...
      exclude: [/\.map$/, /manifest\.json$/, /online\.json/]
    },
    manifestOptions: {
      short_name: 'FDUHole',
      lang: 'zh-CN',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff'
      // icons: [
      //   {
      //     "src": "/img/icons/icon-192x192.png",
      //     "sizes": "192x192",
      //     "type": "image/png"
      //   },
      //   {
      //     "src": "/img/icons/icon-512x512.png",
      //     "sizes": "512x512",
      //     "type": "image/png"
      //   },
      // ]
    }
    // iconPaths: {
    //   faviconSVG: '/img/icons/favicon.svg',
    //   favicon32: '/img/icons/favicon-32x32.png',
    //   favicon16: '/img/icons/favicon-16x16.png',
    //   appleTouchIcon: '/img/icons/apple-touch-icon-152x152.png',
    //   maskIcon: '/img/icons/safari-pinned-tab.svg',
    //   msTileImage: '/img/icons/msapplication-icon-144x144.png'
    // }
  },
  lintOnSave: false,
  chainWebpack: (config) => {
    config.plugin('provide').use(webpack.ProvidePlugin, [
      {
        'window.Quill': 'quill/dist/quill.js',
        Quill: 'quill/dist/quill.js'
      }
    ])
  },
  transpileDependencies: ['vuetify']
}
