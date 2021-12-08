import { convertKatex } from '@/utils/utils'
import marked from 'marked'
import UserStore from '@/store/modules/UserStore'

export interface Tag {
  name: string
  tagId: number
  temperature: number
}

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
    str = str.replace(/(^|\s)(#\d+)\b/g, (ignore1, ignore2, v) => '\n\n<p mention="' + v + '"></p>\n\n')
    str = marked(convertKatex(str))
    str = str.replace(/<p mention="#\w+"><\/p>/g, (str) => {
      return str.replace('<p', '<div class="replyDiv"').replace('/p>', '/div>')
    })
    return str
  }
}

export interface Hole {
  divisionId: number
  holeId: number
  floors: {
    firstFloor: Floor
    lastFloor: Floor
    prefetch: Array<Floor>
  }
  reply: number
  tags: Array<Tag>
  timeCreated: string
  timeUpdated: string
}

export interface Division {
  divisionId: number
  description: string
  name: string
  pinned: Array<Hole>
}

export class WrappedHole {
  public readonly hole: Hole
  public styleData: {
    fold: boolean
    lines: number
    displayIt: boolean
  }

  public floors: Array<MarkedFloor> = []
  public firstFloor: MarkedFloor
  public lastFloor: MarkedFloor
  public isFolded: boolean
  public isStarred: boolean
  public holeId: number
  public holeIdStr: string

  constructor (hole: Hole) {
    this.hole = hole
    hole.floors.prefetch.forEach((floor: Floor) => {
      this.floors.push(new MarkedFloor(floor))
    })
    this.firstFloor = new MarkedFloor(hole.floors.firstFloor)
    this.lastFloor = new MarkedFloor(hole.floors.lastFloor)
    this.isFolded = this.firstFloor.fold.length > 0
    this.isStarred = UserStore.collection.isStarred(hole.holeId)
    this.holeId = this.hole.holeId
    this.holeIdStr = this.holeId.toString()
    hole.tags.forEach((v: Tag) => {
      if (v.name.charAt(0) === '*') {
        this.isFolded = true
      }
    })
    this.styleData = {
      fold: true,
      lines: 3,
      displayIt: !this.isFolded
    }
  }
}
