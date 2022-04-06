import marked from 'marked'
import { convertKatex } from '@/utils/utils'

export interface IFloorData {
  content: string
  holeId: number
  specialTag?: string
}

export interface IFloor {
  content: string
  holeId: number
  specialTag: string
  anonyname: string
  deleted: boolean
  floorId: number
  storey: number
  fold: string[]
  like: number
  timeCreated: Date | string
  timeUpdated: Date | string
}

export class Floor implements IFloor {
  anonyname: string
  content: string
  deleted: boolean
  floorId: number
  fold: string[]
  holeId: number
  like: number
  storey: number
  timeCreated: Date
  timeUpdated: Date
  html: string
  specialTag: string

  constructor (floor: IFloor) {
    this.anonyname = floor.anonyname
    this.content = floor.content
    this.deleted = floor.deleted
    this.floorId = floor.floorId
    this.fold = floor.fold
    this.holeId = floor.holeId
    this.storey = floor.storey
    this.like = floor.like
    this.timeCreated = new Date(floor.timeCreated)
    this.timeUpdated = new Date(floor.timeUpdated)
    this.specialTag = floor.specialTag
    this.convertHtml()
  }

  public convertHtml () {
    this.html = marked(convertKatex(this.content))
  }
}

export interface IDetailedFloor extends IFloor {
  isMe: boolean
  liked: boolean
  mention: IFloor[]
}

export class DetailedFloor extends Floor implements IDetailedFloor {
  isMe: boolean
  liked: boolean
  mention: Floor[]

  public constructor (floor: IDetailedFloor) {
    super(floor)
    this.liked = floor.liked
    this.isMe = floor.isMe
    this.mention = floor.mention.map(v => new Floor(v))
  }

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
