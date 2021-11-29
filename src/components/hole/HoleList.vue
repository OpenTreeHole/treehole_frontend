<template>
  <v-container id='holeList' class='pa-0'>
    <animated-list :datas='holes' vkey='holeIdStr' v-slot='{ data, index }'>
      <v-col class='py-2'>
        <HoleCard
          :hole='data'
          :index='index'
          :activate='activate'
          :is-active='data.holeId === displayHoleId'
          @refresh='refresh'
        />
      </v-col>
    </animated-list>
    <v-row>
      <v-col>
        <!-- 载入中信息 -->
        <loading :request='[getHoles]' ref='loading' :pause-loading='pauseLoading' />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
import HoleCard from '@/components/hole/HoleCard.vue'
import HoleListMixin from '@/mixins/HoleListMixin.vue'
import Loading from '@/components/Loading.vue'
import { Component, Prop } from 'vue-property-decorator'
import { MarkedDetailedFloor, MarkedFloor, WrappedHole } from '@/api/hole'
import { EventBus } from '@/event-bus'
import AnimatedList from '@/components/animation/AnimatedList.vue'

@Component({
  components: {
    HoleCard,
    Loading,
    AnimatedList
  }
})
export default class HoleList extends HoleListMixin {
  @Prop({
    required: true,
    type: Function
  }) readonly activate: Function

  @Prop({ required: false, type: Number, default: -1 }) displayHoleId: number

  /**
   * Calculate the height of the hole list.
   */
  public getHeight (): number {
    const holeListElement = document.getElementById('holeList')
    if (!holeListElement) return 0
    return parseInt(window.getComputedStyle(holeListElement).height)
  }

  public onGotoMentionFloor (curFloor: MarkedDetailedFloor, mentionFloor: MarkedFloor) {
    let curHole: WrappedHole | undefined, curIndex: number | undefined
    this.holes.forEach((hole, index) => {
      if (hole.hole.holeId === curFloor.holeId) {
        curHole = hole
        curIndex = index
      }
    })
    if (curHole === undefined || curIndex === undefined) {
      console.error('Current Hole Not Found!')
      return
    }
    this.openNewOrExistHole(mentionFloor.holeId, curIndex, mentionFloor.floorId)
  }

  public openNewOrExistHole (holeId: number, toIndex = 0, floorId?: number) {
    let hole: WrappedHole | undefined, index: number | undefined
    this.holes.forEach((h, i) => {
      if (h.hole.holeId === holeId) {
        hole = h
        index = i
      }
    })

    if (hole === undefined || index === undefined) {
      this.loading.loadCustomRequestOnce(async () => this.request.requestHole(holeId, toIndex)).then(() => {
        hole = this.holes[toIndex]
        if (floorId) this.activate(hole, floorId, true)
        else this.activate(hole)
      })
    } else {
      if (index !== toIndex) {
        this.holes.splice(index, 1)
        this.holes.splice(index > toIndex ? toIndex : (toIndex - 1), 0, hole)
      }
      this.activate(hole, floorId, true)
    }
  }

  mounted () {
    EventBus.$on('goto-hole', this.openNewOrExistHole)
  }

  destroyed () {
    EventBus.$off('goto-hole', this.openNewOrExistHole)
  }
}
</script>
