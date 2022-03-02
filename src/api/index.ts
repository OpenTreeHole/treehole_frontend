// noinspection DuplicatedCode

import { Hole } from '@/models/hole'
import { camelizeKeys } from '@/utils/utils'
import Vue from 'vue'
import { cloneDeep, remove } from 'lodash-es'
import { VueInstance } from '@/instance'
import { DetailedFloor, Floor } from '@/models/floor'
import { Tag } from '@/models/tag'

export abstract class ArrayRequest<T> {
  public datas: Array<T> = []

  public clear (): void {
    this.datas = []
  }

  public pushData (data: T) {
    this.datas.push(data)
  }

  /**
   * Request the backend to get array data.
   *
   * @returns if has next.
   */
  public abstract request(): Promise<boolean>
}

export abstract class PrefetchedArrayRequest<T> extends ArrayRequest<T> {
  public loadedLength = 0

  protected constructor (prefetchedDataSet: Array<T>) {
    super()
    this.datas = cloneDeep(prefetchedDataSet)
  }

  public clear () {
    super.clear()
    this.loadedLength = 0
  }

  /**
   * Push a new data item int the data set.
   * <p> If an index is given, the item will be pushed into the targeted position. (and replace the item at this position) </p>
   * <p> The replacement will be directly assign value to this position at default, but you can give a check method to decide whether to use Vue.set instead. </p>
   *
   * @param data
   * @param index
   * @param check - false: datas[index]=newVal; true: Vue.set(datas,index,newVal)
   */
  public pushData (data: T, index?: number, check?: (newVal: T, oldVal: T) => boolean) {
    if (index === undefined || index >= this.loadedLength) {
      if (this.loadedLength === this.datas.length) {
        this.datas.push(data)
        this.loadedLength++
      } else {
        if (check && check(data, this.datas[this.loadedLength])) {
          Vue.set(this.datas, this.loadedLength++, data)
        } else {
          this.datas[this.loadedLength++] = data
        }
      }
    } else {
      if (check && check(data, this.datas[index])) {
        Vue.set(this.datas, index, data)
      } else {
        this.datas[index] = data
      }
    }
  }
}

export abstract class HoleListRequest extends ArrayRequest<Hole> {
  public tag: Tag | null = null
  public pinCount: number = 0

  public clear () {
    super.clear()
    this.pinCount = 0
  }

  /**
   * Request the backend for a specific hole and add to the hole list.
   * @param holeId - the id of the specific hole.
   * @param position - the specific position at which the hole added. 0 if undefined.
   */
  public async requestHole (holeId: number, position: number = 0) {
    const response = await VueInstance.$axios?.get(`/holes/${holeId}`)
    const hole = new Hole(camelizeKeys(response.data))
    this.datas.splice(position, 0, hole)
  }

  public pushFront (data: Hole) {
    remove(this.datas, v => v.holeId === data.holeId)
    this.datas.splice(0, 0, data)
  }

  public pin (data: Hole) {
    this.pushFront(data)
    this.pinCount++
  }

  public pushData (data: Hole) {
    let flag = false
    this.datas.forEach((v) => {
      if (v.holeId === data.holeId) {
        flag = true
      }
    })
    if (flag) return
    super.pushData(data)
  }
}

export class HomeHoleListRequest extends HoleListRequest {
  public startTime: Date = new Date()

  public clear (): void {
    super.clear()
    this.startTime = new Date()
  }

  public async request (): Promise<boolean> {
    const params: any = {
      start_time: this.startTime.toISOString(),
      length: 10,
      prefetch_length: 10,
      division_id: 1
    }
    if (this.tag) {
      params.tag = this.tag.name
    }

    const response = await VueInstance.$axios?.get('/holes', {
      params: params
    })

    let hasNext = false
    response.data.forEach((holeItem: any) => {
      if (!holeItem.floors.first_floor || !holeItem.floors.last_floor || holeItem.reply < 0) return
      const hole = new Hole(camelizeKeys(holeItem))
      this.pushData(hole)
      hasNext = true
    })
    if (this.datas.length > 0) this.startTime = new Date(this.datas[this.datas.length - 1].timeUpdated)
    return hasNext
  }
}

export class DivisionHoleListRequest extends HoleListRequest {
  public startTime: Date = new Date()
  public divisionId: number

  constructor (divisionId: number) {
    super()
    this.divisionId = divisionId
  }

  public clear (): void {
    super.clear()
    this.startTime = new Date()
  }

  public async request (): Promise<boolean> {
    let hasNext = false
    const params: any = {
      start_time: this.startTime.toISOString(),
      length: 10,
      prefetch_length: 10,
      division_id: this.divisionId
    }
    if (this.tag) {
      params.tag = this.tag.name
    }
    const response = await VueInstance.$axios?.get('/holes', {
      params: params
    })

    response.data.forEach((holeItem: any) => {
      if (!holeItem.floors.first_floor || !holeItem.floors.last_floor || holeItem.reply < 0) return
      const hole = new Hole(camelizeKeys(holeItem))
      this.pushData(hole)
      hasNext = true
    })
    if (this.datas.length > 0) this.startTime = new Date(this.datas[this.datas.length - 1].timeUpdated)
    return hasNext
  }
}

export class CollectionHoleListRequest extends HoleListRequest {
  public async request (): Promise<boolean> {
    const response = await VueInstance.$axios?.get('/user/favorites')

    response.data.forEach((holeItem: any) => {
      if (!holeItem.floors.first_floor || !holeItem.floors.last_floor || holeItem.reply < 0) return
      const hole = new Hole(camelizeKeys(holeItem))
      this.pushData(hole)
    })
    return false
  }
}

export class SearchFloorListRequest extends ArrayRequest<Floor> {
  public searchStr: string

  public constructor (searchStr: string) {
    super()
    this.searchStr = searchStr
  }

  public async request (): Promise<boolean> {
    const response = await VueInstance.$axios?.get('/floors', {
      params: {
        s: this.searchStr
      }
    })
    response.data.forEach((floorItem: any) => {
      const floor: Floor = new Floor(camelizeKeys(floorItem))
      this.pushData(floor)
    })
    return false
  }
}

export class FloorListRequest extends PrefetchedArrayRequest<Floor> {
  public holeId: number

  public constructor (prefetchedDataSet: Array<Floor>, holeId: number) {
    super(prefetchedDataSet)
    this.holeId = holeId
  }

  public async request (): Promise<boolean> {
    const response = await VueInstance.$axios?.get('/floors', {
      params: {
        hole_id: this.holeId,
        start_floor: this.loadedLength,
        length: 10
      }
    })
    let index = response.config.params.start_floor
    let hasNext = false
    response.data.forEach((floorItem: any) => {
      console.log(floorItem)
      const floor: DetailedFloor = new DetailedFloor(camelizeKeys(floorItem))
      this.pushData(floor, index++, () => {
        return true
      })

      hasNext = true
    })
    return hasNext
  }
}
