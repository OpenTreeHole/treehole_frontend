import { Floor, IFloor } from '@/models/floor'
import { ITag, Tag } from '@/models/tag'
import { PrefetchedArray } from '@/utils/structs'

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
  timeCreated: string
  timeUpdated: string
}

export class Hole implements IHole {
  public styleData: {
    fold: boolean
    lines: number
    displayIt: boolean
  }

  public divisionId: number
  public floors: {
    firstFloor: IFloor
    lastFloor: IFloor
    prefetch: IFloor[]
  }

  public cFloors: PrefetchedArray<Floor>
  public firstFloor: Floor
  public lastFloor: Floor
  public holeId: number
  public timeCreated: string
  public timeUpdated: string
  public reply: number
  public tags: Tag[]

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
    this.cFloors = new PrefetchedArray<Floor>(...hole.floors.prefetch.map(v => new Floor(v)))
    this.divisionId = hole.divisionId
    this.floors = hole.floors
    this.firstFloor = new Floor(hole.floors.firstFloor)
    this.lastFloor = new Floor(hole.floors.lastFloor)
    this.holeId = hole.holeId
    this.timeCreated = hole.timeCreated
    this.timeUpdated = hole.timeUpdated
    this.reply = hole.reply
    this.tags = hole.tags.map(v => new Tag(v))

    this.styleData = {
      fold: true,
      lines: 3,
      displayIt: !this.isFolded
    }
  }
}
