import { Floor, IFloor } from '@/models/floor'

export interface IReport {
  reportId: number
  holeId: number
  floor: IFloor
  reason: string
  timeCreated: Date | string
  timeUpdated: Date | string
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
  timeCreated: Date
  timeUpdated: Date

  constructor(report: IReport) {
    this.reportId = report.reportId
    this.holeId = report.holeId
    this.reason = report.reason
    this.timeCreated = new Date(report.timeCreated)
    this.timeUpdated = new Date(report.timeUpdated)
    this.dealed = report.dealed
    this.dealedBy = report.dealedBy
    this.floor = new Floor(report.floor)
  }
}

export interface IReportDeal {
  fold?: string[]
  delete?: string
  silent?: number
  notDeal?: boolean
}
