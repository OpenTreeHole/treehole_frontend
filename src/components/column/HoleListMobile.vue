<template>
  <v-container class="pa-0">
    <hole-list
      ref="holeList"
      @refresh="refresh"
      @open-hole="openHole"
    />
  </v-container>
</template>

<script lang="ts">
import TheLoader from '@/components/TheLoader.vue'
import HoleCard from '@/components/card/HoleCard.vue'
import { Component, Ref } from 'vue-property-decorator'
import { Hole } from '@/models/hole'
import { gotoHole } from '@/utils/floor'
import HoleList from '@/components/column/HoleList.vue'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'

@Component({
  components: {
    HoleList,
    HoleCard,
    Loading: TheLoader
  }
})
export default class HoleListMobile extends BaseComponentOrView {
  @Ref() readonly holeList!: HoleList

  refresh() {
    this.holeList.refresh()
  }

  /**
   * Set router to the hole page.
   *
   * @param hole - the hole.
   * @param displayFloorId - if this argument is set, the floor list will be scrolled to the specific floor after being loaded.
   */
  openHole(hole: Hole, displayFloorId?: number): void {
    gotoHole(hole, displayFloorId)
  }
}
</script>
