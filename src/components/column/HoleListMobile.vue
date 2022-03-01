<template>
  <v-container class='pa-0'>
    <hole-list
      ref='holeList'
      @refresh='refresh'
      @open-hole='openHole'
    />
  </v-container>
</template>

<script lang='ts'>
import Loading from '@/components/Loading.vue'
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
    Loading
  }
})
export default class HoleListMobile extends BaseComponentOrView {
  @Ref() readonly holeList!: HoleList

  public refresh() {
    this.holeList.refresh()
  }

  /**
   * Set router to the hole page.
   *
   * @param hole - the hole.
   * @param displayFloorId - if this argument is set, the floor list will be scrolled to the specific floor after being loaded.
   */
  public openHole(hole: Hole, displayFloorId?: number): void {
    gotoHole(hole, displayFloorId)
  }
}
</script>
