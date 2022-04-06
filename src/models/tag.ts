import { parseTagColor } from '@/utils/utils'

export interface ITag {
  name: string
  tagId: number
  temperature: number
}

export class Tag implements ITag {
  name: string
  tagId: number
  temperature: number
  color: string

  constructor (tag: ITag) {
    this.name = tag.name
    this.tagId = tag.tagId
    this.temperature = tag.temperature

    this.color = parseTagColor(this.name)
  }
}
