export default {
  reloadAll () {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/'
    document.body.appendChild(form)
    form.submit()
    location.href = '/'
  },
  whichPlatform () { // 检测当前浏览器平台

  }
}
