import { assign, camelCase, keys, pick } from 'lodash'
import katex from 'katex'

const macros: any = []

const colorList = [
  'red',
  'pink',
  'purple',
  'deep-purple',
  'indigo',
  'blue',
  'light-blue',
  'cyan',
  'teal',
  'green',
  'light-green',
  'yellow',
  'amber',
  'orange',
  'deep-orange',
  'brown',
  'blue-grey',
  'grey'
]

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

export const scrollTo = (currentIndex: number, toIndex: number): void => {
  const currentOffsetTop = document.getElementById(currentIndex.toString())?.offsetTop
  const toOffsetTop = document.getElementById(toIndex.toString())?.offsetTop
  const scrollDistance = currentOffsetTop && toOffsetTop ? toOffsetTop - currentOffsetTop : 0
  window.scrollBy({
    top: scrollDistance,
    left: 0,
    behavior: 'smooth'
  })
}

/**
 * Randomly generate a specific color for a certain tag name.
 * @param tagName - the name of the tag.
 * @return - the generated color.
 */
export const parseTagColor = (tagName: string): string => {
  if (tagName === null) return ''
  if (tagName[0] === '*') return 'red'
  let num = 0
  for (let i = 0; i < tagName.length; i++) {
    num += tagName.charCodeAt(i)
  }
  num %= colorList.length
  return colorList[num]
}

export const delay = async (ms: number) => {
  // return await for better async stack trace support in case of errors.
  return await new Promise(resolve => setTimeout(resolve, ms))
}
