import { AxiosStatic } from 'axios'
import { DetailedFloor, Floor, WrappedHole } from '@/components/Discussion/hole'
import { camelizeKeys } from '@/utils'
import cloneDeep from 'lodash.clonedeep'
import marked from 'marked'

let axios: AxiosStatic

export abstract class ArrayRequest<T> {
  public datas: Array<T> = []

  public clear (): void {
    this.datas.length = 0
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

  public pushData (data: T, index?: number) {
    if (index === undefined || index >= this.loadedLength) {
      if (this.loadedLength === this.datas.length) {
        this.datas.push(data)
        this.loadedLength++
      } else {
        this.datas[this.loadedLength++] = data
      }
    } else {
      this.datas[index] = data
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
    await axios.get('/holes', {
      params: {
        start_time: this.startTime.toISOString(),
        length: 10,
        prefetch_length: 8,
        division_id: 1
      }
    }).then((response) => {
      response.data.forEach((holeItem: any) => {
        if (!holeItem.floors.first_floor || !holeItem.floors.last_floor || holeItem.reply < 0) return
        console.log(holeItem)
        const hole = new WrappedHole(camelizeKeys(holeItem))
        this.pushData(hole)
        hasNext = true
      })
      this.startTime = new Date(this.datas[this.datas.length - 1].hole.timeUpdated)
    }).catch((error) => {
      throw new Error(error)
    })
    return hasNext
  }
}

export class CollectionHoleListRequest extends ArrayRequest<WrappedHole> {
  public async request (): Promise<boolean> {
    await axios.get('/user/favorites').then((response) => {
      response.data.forEach((holeItem: any) => {
        if (!holeItem.floors.first_floor || !holeItem.floors.last_floor || holeItem.reply < 0) return
        console.log(holeItem)
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

  public constructor (prefetchedDataSet: Array<Floor>, holeId: number) {
    super(prefetchedDataSet)
    this.holeId = holeId
  }

  public async request (): Promise<boolean> {
    let hasNext = false
    await axios
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
          this.pushData(floor, index++)
          hasNext = true
        })
      })
      .catch((error) => {
        throw new Error(error)
      })
    return hasNext
  }

  /**
   * Replace mention tags with empty divs with 'replyDiv' class and the mention id.
   *
   * @param str - the original string
   */
  public mentioned (str: string): string {
    console.log(str)
    str = str.replace(/#\w+/g, (v) => '\n\n<p mention="' + v + '"></p>\n\n')
    str = marked(str)
    str = str.replace(/<p mention="#\w+"><\/p>/g, (str) => {
      return str.replace('<p', '<div class="replyDiv"').replace('/p>', '/div>')
    })
    return str
  }
}

/**
 * Set global axios.
 * @param $axios - the global axios.
 */
export default function ($axios: AxiosStatic) {
  axios = $axios
}
