<template>
  <double-column-panel ref='doubleColumnPanel' @show-second-col-changed='showFloorListChanged'>
    <template #first>
      <HoleList
        :display-hole-id='displayHoleId'
        :fix-card-height='true'
        ref='holeList'
        @refresh='refresh'
        @open-hole='openHole'
      />
    </template>
    <template #second>
      <FloorList
        v-if='displayHoleId && showFloorList'
        :key='displayHoleId'
        :display-floor-id='displayFloorId'
        :wrapped-hole-or-id='displayHole'
        @refresh='refresh'
        @modify-hole='modifyHole'
        ref='floorList'
        class='pa-0'
      />
    </template>
  </double-column-panel>
</template>

<script lang='ts'>
import HoleList from '@/components/column/HoleList.vue'
import FloorList from '@/components/column/FloorList.vue'

import { Component, Emit, Ref } from 'vue-property-decorator'
import { Hole } from '@/models/hole'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import DoubleColumnPanel from '@/components/animation/DoubleColumnPanel.vue'

@Component({
  components: {
    DoubleColumnPanel,
    FloorList,
    HoleList
  }
})
export default class HolePanel extends BaseComponentOrView {
  displayHoleId: number | null = null
  isLoadingVisible = false
  displayHole: Hole | null = null
  displayFloorId: number | null = null

  showFloorList = false

  @Ref() readonly holeList: HoleList
  @Ref() readonly floorList: FloorList
  @Ref() readonly doubleColumnPanel: DoubleColumnPanel

  refresh () {
    this.deactivate()
    this.holeList.refresh()
  }

  openHole (hole: Hole, displayFloorId: number | null = null, preventClose: boolean = false) {
    this.displayHole = hole
    if (displayFloorId) {
      this.displayFloorId = displayFloorId
      if (this.showFloorList && preventClose && this.displayHoleId === hole.holeId) {
        this.floorList.getAndScrollToFloor(displayFloorId)
      }
    } else {
      this.displayFloorId = null
    }
    if (!preventClose || this.displayHoleId !== hole.holeId) {
      this.activate(hole.holeId)
    }
  }

  modifyHole (hole: Hole) {
    this.holeList.modifyHole(hole)
    if (hole.holeId === this.displayHole?.holeId) {
      this.openHole(hole, null, true)
    }
  }

  activate (id: number) {
    if (id === this.displayHoleId) {
      this.doubleColumnPanel.deactivate()
      this.displayHoleId = null
    } else {
      this.doubleColumnPanel.activate()
      this.displayHoleId = id
      document.body.scrollTop = document.documentElement.scrollTop = 0
    }
  }

  deactivate (): void {
    this.displayHoleId = null
    this.doubleColumnPanel.deactivate()
  }

  @Emit()
  showFloorListChanged (show: boolean) {
    this.showFloorList = show
  }
}
</script>
