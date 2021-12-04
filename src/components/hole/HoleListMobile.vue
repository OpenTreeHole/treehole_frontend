<template>
  <v-container class='pa-0'>
    <v-row
      v-for='(hole, index) in holes'
      :key='index'
      justify='center'
      class='ma-0'
    >
      <v-col class='py-1 px-1' cols='12'>
        <HoleCard
          :hole='hole'
          :index='index'
          @refresh='refresh'
          :activate='toDiscussion'
        />
      </v-col>
    </v-row>
    <!-- 载入中信息 -->
    <loading :request='[getHoles]' ref='loading' :pause-loading='pauseLoading'/>
  </v-container>
</template>

<script lang='ts'>
import HoleListMixin from '@/mixins/HoleListMixin.vue'
import Loading from '@/components/Loading.vue'
import HoleCard from '@/components/hole/HoleCard.vue'
import { Component } from 'vue-property-decorator'
import { MarkedDetailedFloor, MarkedFloor, WrappedHole } from '@/api/hole'

@Component({
  components: {
    HoleCard,
    Loading
  }
})
export default class HoleListMobile extends HoleListMixin {
  /**
   * Set router to the hole page.
   *
   * @param wrappedHole - the hole.
   * @param displayFloorId - if this argument is set, the floor list will be scrolled to the specific floor after being loaded.
   */
  public toDiscussion (wrappedHole: WrappedHole, displayFloorId?: number): void {
    setTimeout(() => {
      if (!displayFloorId) {
        this.$router.push({
          path: `/hole/${wrappedHole.hole.holeId}`
        })
      } else {
        this.$router.push({
          path: `/hole/${wrappedHole.hole.holeId}`,
          query: { mention: displayFloorId.toString() }
        })
      }
    }, 50)
  }

  public onGotoMentionFloor (curFloor: MarkedDetailedFloor, mentionFloor: MarkedFloor) {
    this.$router.push({
      path: `/hole/${mentionFloor.holeId}`,
      query: { mention: mentionFloor.floorId.toString() }
    })
  }
}
</script>
