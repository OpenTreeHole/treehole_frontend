// noinspection DuplicatedCode

import { Floor, MarkedDetailedFloor, MarkedFloor, WrappedHole } from '@/api/hole'
import { camelizeKeys, scrollTo } from '@/utils'
import cloneDeep from 'lodash.clonedeep'
import Vue from 'vue'
import Mention from '@/components/Discussion/Mention.vue'
import vuetify from '@/plugins/vuetify'
import UtilStore from '@/store/modules/UtilStore'
import { EventBus } from '@/event-bus'

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

export abstract class HoleListRequest extends ArrayRequest<WrappedHole> {
  /**
   * Request the backend for a specific hole and add to the hole list.
   * @param holeId - the id of the specific hole.
   * @param position - the specific position at which the hole added. 0 if undefined.
   */
  public async requestHole (holeId: number, position: number = 0) {
    await UtilStore.axios.get(`/holes/${holeId}`).then((response) => {
      const hole = new WrappedHole(camelizeKeys(response.data))
      this.datas.splice(position, 0, hole)
    }).catch(error => {
      throw new Error(error)
    })
  }

  public pushData (data: WrappedHole) {
    let flag = false
    this.datas.forEach((v) => {
      if (v.hole.holeId === data.hole.holeId) {
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
    let hasNext = false
    await UtilStore.axios.get('/holes', {
      params: {
        start_time: this.startTime.toISOString(),
        length: 10,
        prefetch_length: 10,
        division_id: 1
      }
    }).then((response) => {
      response.data.forEach((holeItem: any) => {
        if (!holeItem.floors.first_floor || !holeItem.floors.last_floor || holeItem.reply < 0) return
        const hole = new WrappedHole(camelizeKeys(holeItem))
        this.pushData(hole)
        hasNext = true
      })
      if (this.datas.length > 0) this.startTime = new Date(this.datas[this.datas.length - 1].hole.timeUpdated)
    }).catch((error) => {
      throw new Error(error)
    })
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
    await UtilStore.axios.get('/holes', {
      params: {
        start_time: this.startTime.toISOString(),
        length: 10,
        prefetch_length: 10,
        division_id: this.divisionId
      }
    }).then((response) => {
      response.data.forEach((holeItem: any) => {
        if (!holeItem.floors.first_floor || !holeItem.floors.last_floor || holeItem.reply < 0) return
        const hole = new WrappedHole(camelizeKeys(holeItem))
        this.pushData(hole)
        hasNext = true
      })
      if (this.datas.length > 0) this.startTime = new Date(this.datas[this.datas.length - 1].hole.timeUpdated)
    }).catch((error) => {
      throw new Error(error)
    })
    return hasNext
  }
}

export class CollectionHoleListRequest extends HoleListRequest {
  public async request (): Promise<boolean> {
    await UtilStore.axios.get('/user/favorites').then((response) => {
      response.data.forEach((holeItem: any) => {
        if (!holeItem.floors.first_floor || !holeItem.floors.last_floor || holeItem.reply < 0) return
        const hole = new WrappedHole(camelizeKeys(holeItem))
        this.pushData(hole)
      })
    }).catch((error) => {
      throw new Error(error)
    })
    return false
  }
}

export class SearchFloorListRequest extends ArrayRequest<MarkedFloor> {
  public searchStr: string

  public constructor (searchStr: string) {
    super()
    this.searchStr = searchStr
  }

  public async request (): Promise<boolean> {
    await UtilStore.axios.get('/floors', {
      params: {
        s: this.searchStr
      }
    }).then(response => {
      response.data.forEach((floorItem: any) => {
        const floor: MarkedFloor = new MarkedFloor(camelizeKeys(floorItem))
        this.pushData(floor)
      })
    })
    return false
  }
}

export class FloorListRequest extends PrefetchedArrayRequest<MarkedFloor> {
  public holeId: number
  public getIndex: (id: number) => number

  public constructor (prefetchedDataSet: Array<MarkedFloor>, holeId: number, getIndex: (id: number) => number) {
    super(prefetchedDataSet)
    this.holeId = holeId
    this.getIndex = getIndex
  }

  public async request (): Promise<boolean> {
    let hasNext = false
    await UtilStore.axios
      .get('/floors', {
        params: {
          hole_id: this.holeId,
          start_floor: this.loadedLength,
          length: 30
        }
      })
      .then((response) => {
        let index = response.config.params.start_floor
        response.data.forEach((floorItem: any) => {
          const floor: MarkedDetailedFloor = new MarkedDetailedFloor(camelizeKeys(floorItem))
          if (('mention' in floor) && floor.mention.length !== 0) {
            setTimeout(() => this.renderMention(floor), 100)
          }
          this.pushData(floor, index++, (newVal: MarkedFloor, oldVal: MarkedFloor) => {
            return newVal.html !== oldVal.html
          })

          hasNext = true
        })
      })
    return hasNext
  }

  /**
   * Render the empty divs with 'replyDiv' class and 'mention' attr with the specific floor.
   * <p> This method should be called after the original divs being rendered. </p>
   *
   * @param curFloor - the current floor (waiting the mention part in it to be re-rendered).
   */
  public renderMention (curFloor: MarkedDetailedFloor): void {
    const curIndex = this.getIndex(curFloor.floorId)
    const elements = document.querySelectorAll('div[index="' + curIndex + '"] > div.replyDiv')
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].innerHTML) continue
      const mentionAttr = elements[i].getAttribute('mention')
      if (!mentionAttr) continue
      const mentionId = parseInt(mentionAttr.substring(1))
      let mentionFloorOrNull: Floor | null = null
      curFloor.mention.forEach((mFloor) => {
        if (mFloor.floorId === mentionId) mentionFloorOrNull = mFloor
      })
      if (!mentionFloorOrNull) continue
      const mentionFloor: MarkedFloor = new MarkedFloor(mentionFloorOrNull)
      let gotoMentionFloor: Function | undefined
      const mentionIndex = this.getIndex(mentionId)
      if (mentionIndex !== -1) {
        gotoMentionFloor = () => {
          scrollTo(curIndex, mentionIndex)
        }
      } else {
        gotoMentionFloor = () => {
          EventBus.$emit('goto-mention-floor', curFloor, mentionFloor)
        }
      }
      let additionalClass = ''
      if (elements[i].parentElement && (elements[i].parentElement as HTMLElement).firstChild !== elements[i]) {
        additionalClass += 'mt-3 '
      }
      if (elements[i].parentElement && (elements[i].parentElement as HTMLElement).lastChild !== elements[i]) {
        additionalClass += 'mb-3 '
      }
      additionalClass = additionalClass.trimEnd()
      new Mention({
        propsData: {
          mentionFloor: mentionFloor,
          gotoMentionFloor: gotoMentionFloor,
          gotoMentionFloorIcon: 'mdi-arrow-collapse-up',
          mentionFloorInfo: (mentionIndex === -1 ? ('#' + mentionFloor.floorId) : (mentionIndex.toString() + 'L')),
          additionalClass: additionalClass
        },
        vuetify
      }).$mount(elements[i])
    }
  }
}
