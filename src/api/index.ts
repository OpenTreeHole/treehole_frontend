// noinspection DuplicatedCode

import { AxiosStatic } from 'axios'
import { DetailedFloor, Floor, WrappedHole } from '@/api/hole'
import { camelizeKeys } from '@/utils'
import cloneDeep from 'lodash.clonedeep'
import marked from 'marked'
import Vue from 'vue'
import Mention from '@/components/Discussion/Mention.vue'
import vuetify from '@/plugins/vuetify'
import UtilStore from '@/store/modules/UtilStore'

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

export class HomeHoleListRequest extends ArrayRequest<WrappedHole> {
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
        prefetch_length: 8,
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

export class DivisionHoleListRequest extends ArrayRequest<WrappedHole> {
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
        prefetch_length: 8,
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

export class CollectionHoleListRequest extends ArrayRequest<WrappedHole> {
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

export class FloorListRequest extends PrefetchedArrayRequest<Floor> {
  public holeId: number
  public getIndex: (id: number) => number

  public constructor (prefetchedDataSet: Array<Floor>, holeId: number, getIndex: (id: number) => number) {
    prefetchedDataSet.forEach((floor: Floor) => {
      floor.content = marked(floor.content)
    })
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
          length: 10
        }
      })
      .then((response) => {
        let index = response.config.params.start_floor
        response.data.forEach((floorItem: any) => {
          const floor: DetailedFloor = camelizeKeys(floorItem)
          floor.mention.push(floor)
          floor.content = this.mentioned(floor.content)
          if (!('mention' in floor) || (floor as DetailedFloor).mention.length === 0) return
          setTimeout(() => this.renderMention(floor as DetailedFloor), 100)
          this.pushData(floor, index++, (newVal:Floor, oldVal:Floor) => {
            return newVal.content !== oldVal.content
          })

          hasNext = true
        })
      })
      .catch((error) => {
        throw new Error(error)
      })
    return hasNext
  }

  /**
   * Render the empty divs with 'replyDiv' class and 'mention' attr with the specific floor.
   * <p> This method should be called after the original divs being rendered. </p>
   *
   * @param curFloor - the current floor (waiting the mention part in it to be re-rendered).
   */
  public renderMention (curFloor: DetailedFloor): void {
    const curIndex = this.getIndex(curFloor.floorId)
    const elements = document.querySelectorAll('div[index="' + curIndex + '"] > div.replyDiv')
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].innerHTML) continue
      const mentionAttr = elements[i].getAttribute('mention')
      if (!mentionAttr) continue
      const mentionId = parseInt(mentionAttr.substring(1))
      let mentionFloor: Floor | null = null
      curFloor.mention.forEach((mFloor) => {
        if (mFloor.floorId === mentionId) mentionFloor = mFloor
      })
      if (!mentionFloor) continue
      let gotoMentionFloor: Function | undefined
      const mentionIndex = this.getIndex(mentionId)
      if (mentionIndex !== -1) {
        gotoMentionFloor = () => {
          this.scrollTo(curIndex, mentionIndex)
        }
      }
      new Mention({
        propsData: {
          mentionFloor: mentionFloor,
          gotoMentionFloor: gotoMentionFloor,
          mentionFloorInfo: (mentionIndex === -1 ? ('#' + (mentionFloor as Floor).floorId) : (mentionIndex.toString() + 'L'))
        },
        vuetify
      }).$mount(elements[i])
    }
  }

  /**
   * Replace mention tags with empty divs with 'replyDiv' class and the mention id.
   *
   * @param str - the original string
   */
  public mentioned (str: string): string {
    str = str.replace(/#\w+/g, (v) => '\n\n<p mention="' + v + '"></p>\n\n')
    str = marked(str)
    str = str.replace(/<p mention="#\w+"><\/p>/g, (str) => {
      return str.replace('<p', '<div class="replyDiv"').replace('/p>', '/div>')
    })
    return str
  }

  public scrollTo (currentId: number, toId: number): void {
    const currentOffsetTop = document.getElementById(currentId.toString())?.offsetTop
    const toOffsetTop = document.getElementById(toId.toString())?.offsetTop
    const scrollDistance = currentOffsetTop && toOffsetTop ? toOffsetTop - currentOffsetTop : 0
    window.scrollBy({
      top: scrollDistance, //  正值向下
      left: 0,
      behavior: 'smooth'
    })
  }
}
