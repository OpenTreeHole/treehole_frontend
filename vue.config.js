var webpack = require('webpack')

module.exports = {
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
