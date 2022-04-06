import { Hole, IHole } from '@/models/hole'

export interface IDivisionAdd {
  description: string
  name: string
}

export interface IDivisionModify{
  description?: string
  name?: string
  pinned?: number[]
}

export interface IDivision{
  description: string
  name: string
  pinned: IHole[]
  divisionId: number
}

export class Division implements IDivision {
  divisionId: number
  description: string
  name: string
  pinned: Hole[]

  constructor (division: IDivision) {
    this.description = division.description
    this.divisionId = division.divisionId
    this.name = division.name
    this.pinned = division.pinned.map(v => new Hole(v))
  }
}
