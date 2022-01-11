<template>
  <v-container class='pa-0'>
    <v-row
      v-for='(hole, index) in holes'
      :key='index'
      justify='center'
      class='ma-0'
    >
      <v-col class='py-1 px-1' cols='12' md='9'>
        <HoleCard
          :hole='hole'
          :index='index'
          :pinned='index < request.pinCount'
          :activate='toDiscussion'
        />
      </v-col>
    </v-row>
    <!-- 载入中信息 -->
    <v-row class='ma-0' justify='center'>
      <v-col>
        <!-- 载入中信息 -->
        <loading :request='[getHoles]' ref='loading' :pause-loading='pauseLoading' />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
import HoleListMixin from '@/mixins/HoleListMixin.vue'
import Loading from '@/components/Loading.vue'
import HoleCard from '@/components/hole/HoleCard.vue'
import { Component } from 'vue-property-decorator'
import { WrappedHole } from '@/models/hole'
import { MarkedDetailedFloor, MarkedFloor } from '@/models/floor'

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
          path: `/hole/${wrappedHole.holeId}`
        })
      } else {
        this.$router.push({
          path: `/hole/${wrappedHole.holeId}`,
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
