import { camelCase, assign, pick, keys } from 'lodash'

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

export const camelizeKeys = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => camelizeKeys(v))
  } else if (obj != null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [camelCase(key)]: camelizeKeys(obj[key])
      }),
      {}
    )
  }
  return obj
}

export const reduceKeys = (reduced: any, before: any): any => {
  assign(reduced, pick(before, keys(reduced)))
  return reduced
}
