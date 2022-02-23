<script lang='ts'>
import { Component, Ref, Watch } from 'vue-property-decorator'
import { Hole } from '@/models/hole'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { CollectionHoleListRequest, DivisionHoleListRequest, HoleListRequest, HomeHoleListRequest } from '@/api'
import Loading from '@/components/Loading.vue'
import { EventBus } from '@/event-bus'
import UserStore from '@/store/modules/UserStore'
import { debounce } from 'lodash-es'
import { DetailedFloor, Floor } from '@/models/floor'
import { Division } from '@/models/division'

@Component
export default class HoleListMixin extends BaseComponentOrView {
  // 帖子列表
  public holes: Hole[] = []

  public startTime: Date = new Date()

  public collectionIds: number[] = []

  public debouncedCalculateLines: Function
  public lineHeight: number = 10

  public request: HoleListRequest

  public route: string

  @Ref() loading: Loading

  /**
   * Clear the hole list and reload.
   */
  public refresh () {
    this.request.clear()
    this.holes = this.request.datas
    this.loading.continueLoad()
    this.pin()
  }

  /**
   * Decide if pinned by hole id.
   */
  public isPinned (holeId: number) {
    for (let i = 0; i < this.request.pinCount; i++) {
      if (this.holes[i].holeId === holeId) return true
    }
    return false
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
    return await this.request.request()
  }

  public onGotoMentionFloor (curFloor: DetailedFloor, mentionFloor: Floor) {
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
  }

  destroyed () {
    UserStore.collection.unregisterUpdateHoleArray(this.$route.name as string)
    EventBus.$off('goto-mention-floor', this.onGotoMentionFloor)
  }

  get divisionId () {
    if (this.route.includes('division')) return parseInt(this.$route.params.id)
    else return 1
  }

  public getDivisionById (divisionId: number): Division | undefined {
    return UserStore.divisions.find(v => {
      return v.divisionId === divisionId
    })
  }

  pin () {
    const division = this.getDivisionById(this.divisionId)
    if (division && (this.request instanceof HomeHoleListRequest || this.request instanceof DivisionHoleListRequest)) {
      for (let i = division.pinned.length - 1; i >= 0; i--) {
        this.request.pin(new Hole(division.pinned[i]))
      }
    }
  }

  async onPreloaded () {
    this.pin()
    await this.$nextTick()
    this.loading.continueLoad()
  }

  created () {
    this.route = this.$route.path
    UserStore.collection.getCollections()
    this.debouncedCalculateLines = debounce(this.calculateLines, 300)
    if (this.route.includes('home')) {
      this.request = new HomeHoleListRequest()
    } else if (this.route.includes('collections')) {
      this.request = new CollectionHoleListRequest()
    } else if (this.route.includes('division')) {
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
