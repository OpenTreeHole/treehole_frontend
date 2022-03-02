<template>
  <v-container id='holeList' class='pa-0'>
    <animated-list ref='animatedHoleList' :datas='holes' vkey='holeIdStr' v-slot='{ data, index }'>
      <v-col :class='colClass'>
        <hole-card
          :hole='data'
          :index='index'
          :is-active='data.holeId === displayHoleId'
          :fix-height='fixCardHeight'
          :pinned='index < request.pinCount'
          @open-hole='openHole'
          @update-pin-info='refresh'
        />
      </v-col>
    </animated-list>
    <v-row>
      <v-col>
        <!-- 载入中信息 -->
        <loading ref='loading' :pause-loading='!preloaded' :request='[getHoles]' />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
import HoleCard from '@/components/card/HoleCard.vue'
import Loading from '@/components/Loading.vue'
import { Component, Emit, Prop, Ref, Watch } from 'vue-property-decorator'
import { Hole } from '@/models/hole'
import { EventBus } from '@/event-bus'
import AnimatedList from '@/components/animation/AnimatedList.vue'
import { DetailedFloor, Floor } from '@/models/floor'
import { sleep } from '@/utils/utils'
import { CollectionHoleListRequest, DivisionHoleListRequest, HoleListRequest, HomeHoleListRequest } from '@/api'
import UserStore from '@/store/modules/UserStore'
import { Division } from '@/models/division'
import { debounce } from 'lodash-es'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'

@Component({
  components: {
    HoleCard,
    Loading,
    AnimatedList
  }
})
export default class HoleList extends BaseComponentOrView {
  @Prop({ required: false, type: Number, default: -1 }) displayHoleId: number
  @Prop({ type: Boolean, default: false }) fixCardHeight: boolean

  @Ref() readonly animatedHoleList: AnimatedList

  // 帖子列表
  public holes: Hole[] = []

  public startTime: Date = new Date()

  public collectionIds: number[] = []

  public debouncedCalculateLines: Function
  public lineHeight: number = 10

  public request: HoleListRequest

  public route: string

  @Ref() loading: Loading

  get colClass () {
    if (this.isMobile) return 'px-1 py-1'
    else return 'px-1 py-2'
  }

  get divisionId () {
    if (this.route.includes('division')) return parseInt(this.$route.params.id)
    else return 1
  }

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

  /**
   * Calculate the height of the hole list.
   */
  public getHeight (): number {
    const holeListElement = document.getElementById('holeList')
    if (!holeListElement) return 0
    return parseInt(window.getComputedStyle(holeListElement).height)
  }

  public onGotoMentionFloor (curFloor: DetailedFloor, mentionFloor: Floor) {
    if (this.isPinned(curFloor.holeId)) {
      this.openNewOrExistHole(mentionFloor.holeId, mentionFloor.floorId)
      return
    }
    let curHole: Hole | undefined, curIndex: number | undefined
    this.holes.forEach((hole, index) => {
      if (hole.holeId === curFloor.holeId) {
        curHole = hole
        curIndex = index
      }
    })
    if (curHole === undefined || curIndex === undefined) {
      console.error('Current Hole Not Found!')
      return
    }
    this.openNewOrExistHole(mentionFloor.holeId, mentionFloor.floorId, curIndex)
  }

  public async openNewOrExistHole (holeIdOrHole: number | Hole, floorId?: number, toIndex = this.request.pinCount) {
    await this.loading.waitForUnpause(8)

    const holeId = (typeof holeIdOrHole === 'number') ? holeIdOrHole : holeIdOrHole.holeId

    let hole: Hole | undefined, index: number | undefined
    this.holes.forEach((h, i) => {
      if (h.holeId === holeId) {
        hole = h
        index = i
      }
    })

    if (hole === undefined || index === undefined) {
      if (typeof holeIdOrHole !== 'number') {
        hole = holeIdOrHole
        this.holes.splice(toIndex, 0, hole)
      } else {
        await this.loading.loadCustomRequestOnce(async () => this.request.requestHole(holeId, toIndex))
        hole = this.holes[toIndex]
      }
    } else {
      if (!this.isPinned(holeId) && index !== toIndex) {
        this.holes.splice(index, 1)
        this.holes.splice(index > toIndex ? toIndex : (toIndex - 1), 0, hole)
      }
    }
    if (floorId) this.openHole(hole, floorId, true)
    else this.openHole(hole, undefined, true)
    await sleep(50) // wait for animation start.
    await this.animatedHoleList.waitForAnimatingFinish(8)
    EventBus.$emit('scroll-to-hole', holeId)
  }

  @Emit()
  public openHole (_hole: Hole, _floorId?: number, _preventClose?: boolean) {
  }

  async mounted () {
    window.addEventListener('resize', () => {
      this.debouncedCalculateLines()
    })
    EventBus.$on('goto-mention-floor', this.onGotoMentionFloor)
    EventBus.$on('goto-hole', this.openNewOrExistHole)
    await this.$nextTick()
  }

  destroyed () {
    UserStore.collection.unregisterUpdateHoleArray(this.$route.name as string)
    EventBus.$off('goto-mention-floor', this.onGotoMentionFloor)
    EventBus.$off('goto-hole', this.openNewOrExistHole)
  }
}
</script>
