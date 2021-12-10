import { Hole } from '@/models/hole'

export interface Division {
  divisionId: number
  description: string
  name: string
  pinned: Array<Hole>
}
