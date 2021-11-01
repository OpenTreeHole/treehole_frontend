<template>
  <v-container id='holeList' class='pa-0'>
    <transition-group name='slide-fade'>
      <v-row
        v-for='(hole, index) in holes'
        :key='hole.hole.holeId'
      >
        <v-col>
          <HoleCard
            :hole='hole'
            :index='index'
            :activate='activate'
            :is-active='hole.hole.holeId === displayHoleId'
            @refresh='refresh'
          />
        </v-col>
      </v-row>
    </transition-group>
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

@Component({
  components: {
    HoleCard,
    Loading
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
    const holeListElement = document.getElementById('discussionList')
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
    super.destroyed()
    EventBus.$off('goto-hole', this.openNewOrExistHole)
  }
}
</script>

<style lang='scss'>
.slide-fade-enter-active {
  transition: all .3s ease;
}

.slide-fade-leave-active {
  transition: all .1s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter, .slide-fade-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}
</style>
