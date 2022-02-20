import UserStore from '@/store/modules/UserStore'
import { IFloor, Floor } from '@/models/floor'
import { Tag } from '@/models/tag'

export interface IHole {
  divisionId: number
  holeId: number
  floors: {
    firstFloor: IFloor
    lastFloor: IFloor
    prefetch: Array<IFloor>
  }
  reply: number
  tags: Array<Tag>
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
    prefetch: Array<IFloor>
  }

  public markedFloors: Array<Floor> = []
  public firstFloor: Floor
  public lastFloor: Floor
  public isFolded: boolean
  public isStarred: boolean
  public holeId: number
  public holeIdStr: string
  public timeCreated: string
  public timeUpdated: string
  public reply: number
  public tags: Array<Tag>

  constructor (hole: IHole) {
    hole.floors.prefetch.forEach((floor: IFloor) => {
      this.markedFloors.push(new Floor(floor))
    })
    this.divisionId = hole.divisionId
    this.floors = hole.floors
    this.firstFloor = new Floor(hole.floors.firstFloor)
    this.lastFloor = new Floor(hole.floors.lastFloor)
    this.isFolded = this.firstFloor.fold.length > 0
    this.isStarred = UserStore.collection.isStarred(hole.holeId)
    this.holeId = hole.holeId
    this.holeIdStr = this.holeId.toString()
    this.timeCreated = hole.timeCreated
    this.timeUpdated = hole.timeUpdated
    this.reply = hole.reply
    this.tags = hole.tags

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
