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
    let curHole: WrappedHole | undefined, curIndex:number | undefined, mentionHole: WrappedHole | undefined, mentionIndex: number | undefined
    this.discussions.forEach((hole, index) => {
      if (hole.hole.holeId === curFloor.holeId) {
        curHole = hole
        curIndex = index
      } else if (hole.hole.holeId === mentionFloor.holeId) {
        mentionHole = hole
        mentionIndex = index
      }
    })
    if (curHole === undefined || curIndex === undefined) {
      console.error('Current Hole Not Found!')
      return
    }
    if (mentionHole === undefined || mentionIndex === undefined) {
      this.loading.loadCustomRequestOnce(async () => this.request.requestHole(mentionFloor.holeId, curIndex)).then(() => {
        mentionHole = this.discussions[curIndex as number]
        this.activate(mentionHole, mentionFloor.floorId)
      })
    } else {
      this.discussions.splice(mentionIndex, 1)
      this.discussions.splice(mentionIndex > curIndex ? curIndex : (curIndex - 1), 0, mentionHole)
      this.activate(mentionHole, mentionFloor.floorId)
    }
  }
}
</script>
