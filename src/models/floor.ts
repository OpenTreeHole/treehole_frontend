import marked from 'marked'
import { convertKatex } from '@/utils/utils'

export interface IFloor {
  anonyname: string
  content: string
  deleted: boolean
  floorId: number
  fold: Array<any>
  holeId: number
  like: number
  timeCreated: string
  timeUpdated: string
  specialTag: string
}

export class Floor implements IFloor {
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
  specialTag: string

  constructor (floor: IFloor) {
    Object.assign(this, floor)
    this.convertHtml()
  }

  public convertHtml () {
    this.html = marked(convertKatex(this.content))
  }
}

export interface IDetailedFloor extends IFloor {
  isMe: boolean
  liked: boolean
  mention: Array<IFloor>
}

export class DetailedFloor extends Floor implements IDetailedFloor {
  isMe: boolean
  liked: boolean
  mention: Array<IFloor>

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
