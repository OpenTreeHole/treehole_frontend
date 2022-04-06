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
    this.reportId = report.reportId
    this.holeId = report.holeId
    this.reason = report.reason
    this.timeCreated = report.timeCreated
    this.timeUpdated = report.timeUpdated
    this.dealed = report.dealed
    this.dealedBy = report.dealedBy
    this.floor = new Floor(report.floor)
  }
}

export interface IReportDeal {
  fold?: string[],
  delete?: string
  silent?: number,
  notDeal?: boolean
}
