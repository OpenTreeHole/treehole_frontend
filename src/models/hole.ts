import { Floor, IFloor } from '@/models/floor'
import { ITag, Tag } from '@/models/tag'

export interface IHole {
  divisionId: number
  holeId: number
  floors: {
    firstFloor: IFloor
    lastFloor: IFloor
    prefetch: IFloor[]
  }
  reply: number
  tags: ITag[]
  timeCreated: Date | string
  timeUpdated: Date | string
}

export class Hole implements IHole {
  styleData: {
    fold: boolean
    lines: number
    displayIt: boolean
  }

  divisionId: number
  floors: {
    firstFloor: IFloor
    lastFloor: IFloor
    prefetch: IFloor[]
  }

  cFloors: Floor[]
  firstFloor: Floor
  lastFloor: Floor
  holeId: number
  timeCreated: Date
  timeUpdated: Date
  reply: number
  tags: Tag[]

  get isFolded () {
    for (const tag of this.tags) {
      if (tag.name[0] === '*') {
        return true
      }
    }
  }

  get holeIdStr () {
    return this.holeId.toString()
  }

  constructor (hole: IHole) {
    this.cFloors = hole.floors.prefetch.map(v => new Floor(v))
    this.divisionId = hole.divisionId
    this.floors = hole.floors
    this.firstFloor = new Floor(hole.floors.firstFloor)
    this.lastFloor = new Floor(hole.floors.lastFloor)
    this.holeId = hole.holeId
    this.timeCreated = new Date(hole.timeCreated)
    this.timeUpdated = new Date(hole.timeUpdated)
    this.reply = hole.reply
    this.tags = hole.tags.map(v => new Tag(v))

    this.styleData = {
      fold: true,
      lines: 3,
      displayIt: !this.isFolded
    }
  }
}
