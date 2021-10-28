import { assign, camelCase, keys, pick } from 'lodash'
import katex from 'katex'

const macros: any = []

export const convertDate = (v: any): string => {
  const date = new Date(v)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
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

export const convertKatex = (str: string) => {
  return str.replace(/\$\$\s([\s\S]+)\s\$\$/g, (ignore, k) => {
    return katex.renderToString(k, {
      displayMode: true,
      macros
    })
  }).replace(/\$\s([\s\S]+)\s\$/g, (ignore, k) => {
    return katex.renderToString(k, {
      displayMode: false
    })
  })
}
