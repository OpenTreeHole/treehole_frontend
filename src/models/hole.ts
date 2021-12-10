import UserStore from '@/store/modules/UserStore'
import { Floor, MarkedFloor } from '@/models/floor'
import { Tag } from '@/models/tag'

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

export class WrappedHole implements Hole {
  public styleData: {
    fold: boolean
    lines: number
    displayIt: boolean
  }

  public divisionId: number
  public floors: {
    firstFloor: Floor
    lastFloor: Floor
    prefetch: Array<Floor>
  }

  public markedFloors: Array<MarkedFloor> = []
  public firstFloor: MarkedFloor
  public lastFloor: MarkedFloor
  public isFolded: boolean
  public isStarred: boolean
  public holeId: number
  public holeIdStr: string
  public timeCreated: string
  public timeUpdated: string
  public reply: number
  public tags: Array<Tag>

  constructor (hole: Hole) {
    hole.floors.prefetch.forEach((floor: Floor) => {
      this.markedFloors.push(new MarkedFloor(floor))
    })
    this.divisionId = hole.divisionId
    this.floors = hole.floors
    this.firstFloor = new MarkedFloor(hole.floors.firstFloor)
    this.lastFloor = new MarkedFloor(hole.floors.lastFloor)
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
