import marked from 'marked'
import { convertKatex } from '@/utils/utils'

export interface Floor {
  anonyname: string
  content: string
  deleted: boolean
  floorId: number
  fold: Array<any>
  holeId: number
  like: number
  timeCreated: string
  timeUpdated: string
}

export class MarkedFloor implements Floor {
  anonyname: string
  content: string
  deleted: boolean
  floorId: number
  fold: Array<any>
  holeId: number
  like: number
  timeCreated: string
  timeUpdated: string
  html: string

  constructor (floor: Floor) {
    Object.assign(this, floor)
    this.convertHtml()
  }

  public convertHtml () {
    this.html = marked(convertKatex(this.content))
  }
}

export interface DetailedFloor extends Floor {
  isMe: boolean
  liked: boolean
  mention: Array<Floor>
}

export class MarkedDetailedFloor extends MarkedFloor implements DetailedFloor {
  isMe: boolean
  liked: boolean
  mention: Array<Floor>

  public convertHtml () {
    this.html = this.signMention(convertKatex(this.content))
  }

  /**
   * Replace mention tags with empty divs with 'replyDiv' class and the mention id.
   *
   * @param str - the original string
   */
  public signMention (str: string): string {
    str = str.replace(/##?\d+/g, v => '\n\n<p mention="' + v + '"></p>\n\n')
    str = marked(convertKatex(str))
    str = str.replace(/<p mention="##?\d+"><\/p>/g, (str) => {
      return str.replace('<p', '<div class="replyDiv"').replace('/p>', '/div>')
    })
    return str
  }
}
