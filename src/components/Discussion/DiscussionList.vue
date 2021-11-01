<template>
  <v-container id='discussionList' class='pa-0'>
    <v-row
      v-for='(hole, index) in discussions'
      :key='index'
    >
      <v-col>
        <DiscussionCard
          :discussion='hole'
          :index='index'
          :activate='activate'
          :is-active='hole.hole.holeId === displayHoleId'
          @refresh='refresh'
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <!-- 载入中信息 -->
        <loading :request='[getHoles]' ref='loading' :pause-loading='pauseLoading' />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
import DiscussionCard from '@/components/Discussion/DiscussionCard.vue'
import DiscussionListMixin from '@/mixins/DiscussionListMixin.vue'
import Loading from '@/components/Loading.vue'
import { Component, Prop } from 'vue-property-decorator'
import { MarkedDetailedFloor, MarkedFloor, WrappedHole } from '@/api/hole'
import { EventBus } from '@/event-bus'

@Component({
  components: {
    DiscussionCard,
    Loading
  }
})
export default class DiscussionList extends DiscussionListMixin {
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
    this.discussions.forEach((hole, index) => {
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
    this.discussions.forEach((h, i) => {
      if (h.hole.holeId === holeId) {
        hole = h
        index = i
      }
    })

    if (hole === undefined || index === undefined) {
      this.loading.loadCustomRequestOnce(async () => this.request.requestHole(holeId, toIndex)).then(() => {
        hole = this.discussions[toIndex]
        if (floorId) this.activate(hole, floorId)
        else this.activate(hole)
      })
    } else {
      this.discussions.splice(index, 1)
      this.discussions.splice(index > toIndex ? toIndex : (toIndex - 1), 0, hole)
      this.activate(hole, floorId)
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
