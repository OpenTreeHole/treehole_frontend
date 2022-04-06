<template>
  <v-container id='holeList' class='pa-0'>
    <animated-list ref='animatedHoleList' :datas='allHoles' vkey='holeIdStr' v-slot='{ data, index }'>
      <v-col :class='colClass'>
        <hole-card
          :hole='data'
          :index='index'
          :is-active='data.holeId === displayHoleId'
          :fix-height='fixCardHeight'
          :pinned='index < pinnedHoles.length'
          @open-hole='openHole'
          @update-pin-info='refresh'
        />
      </v-col>
    </animated-list>
    <v-row>
      <v-col>
        <loading v-if='preloaded' ref='loading' :request='[getHoles]' />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
import HoleCard from '@/components/card/HoleCard.vue'
import Loading from '@/components/Loading.vue'
import { Component, Emit, Inject, Prop, Ref, Watch } from 'vue-property-decorator'
import { Hole } from '@/models/hole'
import { EventBus } from '@/event-bus'
import AnimatedList from '@/components/animation/AnimatedList.vue'
import { DetailedFloor, Floor } from '@/models/floor'
import { sleep } from '@/utils/utils'
import UserStore from '@/store/modules/UserStore'
import { debounce } from 'lodash-es'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { getHole, listHoles } from '@/apis/api'
import TagStore from '@/store/modules/TagStore'
import UtilStore from '@/store/modules/UtilStore'

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
  @Inject() holeListType: 'division' | 'collection'

  @Ref() readonly animatedHoleList: AnimatedList

  // 帖子列表
  holes: Hole[] = []
  pinnedHoles: Hole[] = []

  startTime: Date = new Date()

  debouncedCalculateLines: Function
  lineHeight: number = 10

  route: string

  @Ref() loading: Loading

  get allHoles () {
    return [...this.pinnedHoles, ...this.holes]
  }

  get getHoles () {
    return this.holeListType === 'division' ? this.getDivisionHoles : this.getCollectionHoles
  }

  get colClass () {
    if (this.isMobile) return 'px-1 py-1'
    else return 'px-1 py-2'
  }

  get divisionId () {
    return UtilStore.currentDivision?.divisionId
  }

  /**
   * Clear the hole list and reload.
   */
  refresh () {
    this.holes = []
    this.startTime = new Date()
    this.loading.continueLoad()
    this.pin()
  }

  /**
   * Decide if pinned by hole id.
   */
  isPinned (holeId: number) {
    return !!this.pinnedHoles.find(v => v.holeId === holeId)
  }

  /**
   * Calculate the number of the total lines of the display (i.e. the first floor) of each hole.
   */
  calculateLines (): void {
    for (let i = 0; i < this.holes.length; i++) {
      const element = document.getElementById('p' + i)
      const totalHeight = element?.scrollHeight ?? 0
      this.holes[i].styleData.lines = totalHeight / this.lineHeight
    }
  }

  async getDivisionHoles () {
    if (!this.divisionId) throw new Error('Cannot get division id!')
    const holes = await listHoles(this.divisionId, this.startTime, 10, TagStore.tagMap[this.route])
    const holesNotPinned = this.holes.filter(v => this.pinnedHoles.find(u => u.holeId === v.holeId))
    this.holes.push(...holesNotPinned)
    return holes.length > 0
  }

  async getCollectionHoles () {
    this.holes = UserStore.collection
    return false
  }

  async getHole (holeId: number, toIndex: number) {
    const hole = await getHole(holeId)
    this.holes.splice(toIndex, 0, hole)
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

  pin () {
    const division = UserStore.divisions.find(v => v.divisionId === this.divisionId)
    if (!division) throw new Error(`Division ${this.divisionId} Not Found!`)

    this.pinnedHoles = division.pinned
  }

  async onPreloaded () {
    this.pin()
    await this.$nextTick()
    this.loading.continueLoad()
  }

  created () {
    this.route = this.$route.path
    this.debouncedCalculateLines = debounce(this.calculateLines, 300)
  }

  @Watch('filteredTagMap', {
    deep: true
  })
  filteredTagMapChanged () {
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

  public async openNewOrExistHole (holeIdOrHole: number | Hole, floorId?: number, toIndex = 0) {
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
        await this.loading.loadCustomRequestOnce(async () => await this.getHole(holeId, toIndex))
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
    EventBus.$off('goto-mention-floor', this.onGotoMentionFloor)
    EventBus.$off('goto-hole', this.openNewOrExistHole)
  }
}
</script>
