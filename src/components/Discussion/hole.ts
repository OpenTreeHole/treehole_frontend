import cloneDeep from 'lodash.clonedeep'
import marked from 'marked'
import CollectionStore from '@/store/modules/CollectionStore'

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

export class NativeFloor implements Floor {
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

export interface DetailedFloor extends Floor {
  isMe: boolean
  liked: boolean
  mention: Array<Floor>
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

export class WrappedHole {
  public readonly hole: Hole
  public styleData: {
    fold: boolean
    lines: number
  }

  public floors: Array<Floor>
  public firstFloor: Floor
  public lastFloor: Floor
  public isFolded: boolean
  public isStarred: boolean

  constructor (hole: Hole) {
    this.hole = hole
    this.styleData = {
      fold: true,
      lines: 3
    }
    this.floors = cloneDeep(hole.floors.prefetch)
    this.firstFloor = cloneDeep(hole.floors.firstFloor)
    this.lastFloor = cloneDeep(hole.floors.lastFloor)
    this.firstFloor.content = marked(this.firstFloor.content)
    this.lastFloor.content = marked(this.lastFloor.content)
    this.isFolded = this.firstFloor.fold.length > 0
    this.isStarred = CollectionStore.isStarred(hole.holeId)
    hole.tags.forEach((v: Tag) => {
      if (v.name.charAt(0) === '*') {
        this.isFolded = true
      }
    })
  }
}
