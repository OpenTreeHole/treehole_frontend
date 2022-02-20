import { Floor, IFloor } from '@/models/floor'

export interface IReport {
  reportId: number
  holeId: number
  floor: IFloor
  reason: string
  timeCreated: string
  timeUpdated: string
  dealed: boolean
  dealedBy: number | null
}

export class Report implements IReport {
  dealed: boolean
  dealedBy: number | null
  floor: Floor
  holeId: number
  reason: string
  reportId: number
  timeCreated: string
  timeUpdated: string

  constructor (report: IReport) {
    Object.assign(this, report)
    this.floor = new Floor(report.floor)
  }
}
