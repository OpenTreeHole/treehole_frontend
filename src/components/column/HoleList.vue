<template>
  <v-container id='holeList' class='pa-0'>
    <animated-list ref='animatedHoleList' :datas='holes' vkey='holeIdStr' v-slot='{ data, index }'>
      <v-col class='py-2 px-1'>
        <HoleCard
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
        <loading :request='[getHoles]' ref='loading' :pause-loading='!preloaded' />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
import HoleCard from '@/components/card/HoleCard.vue'
import HoleListMixin from '@/mixins/HoleListMixin.vue'
import Loading from '@/components/Loading.vue'
import { Component, Emit, Prop, Ref } from 'vue-property-decorator'
import { Hole } from '@/models/hole'
import { EventBus } from '@/event-bus'
import AnimatedList from '@/components/animation/AnimatedList.vue'
import { DetailedFloor, Floor } from '@/models/floor'
import { sleep } from '@/utils/utils'

@Component({
  components: {
    HoleCard,
    Loading,
    AnimatedList
  }
})
export default class HoleList extends HoleListMixin {
  @Prop({ required: false, type: Number, default: -1 }) displayHoleId: number
  @Prop({ type: Boolean, default: false }) fixCardHeight: boolean

  @Ref() readonly animatedHoleList: AnimatedList

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

  mounted () {
    EventBus.$on('goto-hole', this.openNewOrExistHole)
  }

  destroyed () {
    EventBus.$off('goto-hole', this.openNewOrExistHole)
  }
}
</script>
