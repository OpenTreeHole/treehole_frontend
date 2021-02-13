var webpack = require('webpack')

module.exports = {
  pwa: {
    name: 'FDU HOLE',
    themeColor: "#4278ce",
    msTileColor: "#4278ce",
    appleMobileWebAppCache: "yes",
    workboxPluginMode: 'InjectManifest',
        workboxOptions: {
            // swSrc is required in InjectManifest mode.
            swSrc: 'src/service-worker.js',
            // ...other Workbox options...
            exclude: [
              /\.map$/, 
              /manifest\.json$/,
              /online\.json/,
          ],
        },
    manifestOptions: {
      name: "FDU HOLE",
      short_name: "树洞",
      lang: "zh-CN",
      start_url: "/",
      display: "standalone",
      theme_color: "#4278ce",
      background_color: '#ffffff',
      icons: [
        {
          "src": "/img/icons/android-chrome-192x192.png",
          "sizes": "192x192",
          "type": "image/png"
        },
        {
          "src": "/img/icons/android-chrome-512x512.png",
          "sizes": "512x512",
          "type": "image/png"
        },
        {
          "src": "/img/icons/android-chrome-maskable-192x192.png",
          "sizes": "192x192",
          "type": "image/png"
        },
        {
          "src": "/img/icons/android-chrome-maskable-512x512.png",
          "sizes": "512x512",
          "type": "image/png"
        },
      ],
    },
  },
  lintOnSave: false,
  chainWebpack: config => {
    config.plugin('provide').use(webpack.ProvidePlugin, [{
      'window.Quill': 'quill/dist/quill.js',
      Quill: 'quill/dist/quill.js'
	    }])
  },
  transpileDependencies: [
    'vuetify'
  ]
}
