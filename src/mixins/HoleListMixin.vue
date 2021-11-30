<script lang='ts'>
import debounce from 'lodash.debounce'
import { Component, Ref, Watch } from 'vue-property-decorator'
import { Division, MarkedDetailedFloor, MarkedFloor, WrappedHole } from '@/api/hole'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { CollectionHoleListRequest, DivisionHoleListRequest, HoleListRequest, HomeHoleListRequest } from '@/api'
import Loading from '@/components/Loading.vue'
import { EventBus } from '@/event-bus'
import UserStore from '@/store/modules/UserStore'

@Component
export default class HoleListMixin extends BaseComponentOrView {
  // 帖子列表
  public holes: WrappedHole[] = []
  public pinnedHoles: WrappedHole[] = []

  public startTime: Date = new Date()

  public collectionIds: number[] = []

  public debouncedCalculateLines: Function
  public lineHeight: number = 10

  public request: HoleListRequest

  public pauseLoading = true

  public route: string

  @Ref() loading: Loading

  /**
   * Clear the hole list and reload.
   */
  public refresh (): void {
    this.request.clear()
    this.holes = this.request.datas
    this.loading.continueLoad()
  }

  /**
   * decide if pinned by hole id.
   */
  public isPinned (holeId: number) {
    let ret = false
    this.pinnedHoles.forEach((v) => {
      if (v.holeId === holeId) {
        ret = true
      }
    })
    return ret
  }

  /**
   * Calculate the number of the total lines of the display (i.e. the first floor) of each hole.
   */
  public calculateLines (): void {
    for (let i = 0; i < this.holes.length; i++) {
      const element = document.getElementById('p' + i)
      const totalHeight = element?.scrollHeight ?? 0
      this.holes[i].styleData.lines = totalHeight / this.lineHeight
    }
  }

  public async getHoles (): Promise<boolean> {
    let hasNext = false
    await this.request.request().then((v) => {
      hasNext = v
    }).catch((error) => {
      console.log(error)
      if (error.response === undefined) this.messageError(JSON.stringify(error))
      else this.messageError(error.response.data.msg)
    })
    return hasNext
  }

  public onGotoMentionFloor (curFloor: MarkedDetailedFloor, mentionFloor: MarkedFloor) {
  }

  @Watch('holes')
  holesChanged () {
    setTimeout(() => {
      const element = document.getElementById('p1')
      this.lineHeight = (element ? parseInt(
        window.getComputedStyle(element, null).getPropertyValue('line-height')
      ) : 10)
      this.calculateLines()
    }, 100)
  }

  mounted () {
    window.addEventListener('resize', () => {
      this.debouncedCalculateLines()
    })
    EventBus.$on('goto-mention-floor', this.onGotoMentionFloor)

    const sLoading = this.loading
    this.getHoles().then((v) => {
      this.pauseLoading = false
      sLoading.hasNext = v
    })
  }

  destroyed () {
    UserStore.collection.unregisterUpdateHoleArray(this.$route.name as string)
    EventBus.$off('goto-mention-floor', this.onGotoMentionFloor)
  }

  get divisionId () {
    if (this.route === 'division') return parseInt(this.$route.params.id)
    else return 1
  }

  public getDivisionById (divisionId: number): Division | null {
    let retDivision: Division | null = null
    UserStore.divisions.forEach((v) => {
      if (v.divisionId === divisionId) {
        retDivision = v
      }
    })
    return retDivision
  }

  onPreloaded () {
    if (this.request instanceof HomeHoleListRequest || this.request instanceof DivisionHoleListRequest) {
      this.pinnedHoles = this.request.pinned = this.getDivisionById(this.divisionId)?.pinned.map((v) => {
        return new WrappedHole(v)
      }) ?? []
    }
  }

  created () {
    this.route = this.$route.name as string
    UserStore.collection.getCollections()
    this.debouncedCalculateLines = debounce(this.calculateLines, 300)
    if (this.route === 'home') {
      this.request = new HomeHoleListRequest()
    } else if (this.route === 'collections') {
      this.request = new CollectionHoleListRequest()
    } else if (this.route === 'division') {
      this.request = new DivisionHoleListRequest(this.divisionId)
    }
    this.holes = this.request.datas
    UserStore.collection.registerUpdateHoleArray(this.route, this.holes)
  }

  @Watch('filtedTagMap', {
    deep: true
  })
  filtedTagMapChanged () {
    this.request.tag = this.filtedTagMap[this.route] ? this.filtedTagMap[this.route] : null
    this.$emit('refresh')
  }
}
</script>
