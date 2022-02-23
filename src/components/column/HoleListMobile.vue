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
          @open-hole='openHole'
        />
      </v-col>
    </v-row>
    <!-- 载入中信息 -->
    <v-row class='ma-0' justify='center'>
      <v-col>
        <!-- 载入中信息 -->
        <loading :request='[getHoles]' ref='loading' :pause-loading='!preloaded' />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
import HoleListMixin from '@/mixins/HoleListMixin.vue'
import Loading from '@/components/Loading.vue'
import HoleCard from '@/components/card/HoleCard.vue'
import { Component } from 'vue-property-decorator'
import { Hole } from '@/models/hole'
import { gotoHole } from '@/utils/floor'

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
   * @param hole - the hole.
   * @param displayFloorId - if this argument is set, the floor list will be scrolled to the specific floor after being loaded.
   */
  public openHole (hole: Hole, displayFloorId?: number): void {
    gotoHole(hole, displayFloorId)
  }
}
</script>
