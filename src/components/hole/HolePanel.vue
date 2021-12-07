<template>
  <double-column-panel ref='doubleColumnPanel' @show-second-col-changed='showFloorListChanged'>
    <template #first>
      <HoleList
        :activate='openHole'
        :display-hole-id='displayHoleId'
        :fix-card-height='showFloorList'
        ref='holeList'
        @refresh='refresh'
      />
    </template>
    <template #second>
      <FloorList
        v-if='displayHoleId!==-1 && showFloorList'
        :key='displayHoleId'
        :display-floor-id='displayFloorId'
        :wrapped-hole-or-id='displayHole'
        ref='floorList'
        class='pa-0'
      />
    </template>
  </double-column-panel>
</template>

<script lang='ts'>
import HoleList from '@/components/hole/HoleList.vue'
import FloorList from '@/components/hole/FloorList.vue'

import { Component, Emit, Ref } from 'vue-property-decorator'
import { WrappedHole } from '@/api/hole'
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
  public displayHoleId = -1
  public isLoadingVisible = false
  public displayHole: WrappedHole | null = null
  public displayFloorId = -1

  public showFloorList = false

  @Ref() readonly holeList: HoleList
  @Ref() readonly floorList: FloorList
  @Ref() readonly doubleColumnPanel: DoubleColumnPanel

  public refresh (): void {
    this.deactivate()
    this.holeList.refresh()
  }

  public openHole (wrappedHole: WrappedHole, displayFloorId?: number, preventClose: boolean = false): void {
    this.displayHole = wrappedHole
    if (!preventClose || this.displayHoleId !== wrappedHole.hole.holeId) {
      this.activate(wrappedHole.hole.holeId)
    }
    if (displayFloorId) {
      this.displayFloorId = displayFloorId
      if (this.showFloorList && preventClose && this.displayHoleId === wrappedHole.hole.holeId) {
        this.floorList.tryScrollTo(0, this.floorList.getIndex(displayFloorId), 5, 350)
      }
    } else {
      this.displayFloorId = -1
    }
  }

  public activate (id: number): void {
    if (id === this.displayHoleId) {
      this.doubleColumnPanel.deactivate()
      this.displayHoleId = -1
    } else {
      this.doubleColumnPanel.activate()
      this.displayHoleId = id
      document.body.scrollTop = document.documentElement.scrollTop = 0
    }
  }

  public deactivate (): void {
    this.doubleColumnPanel.deactivate()
  }

  @Emit()
  public showFloorListChanged (show: boolean) {
    this.showFloorList = show
  }

  // public clickOutside (e: { path: HTMLElement[] }) {
  //   // The length of e.path will be 5 only when dragging cursor from the dialog to the overlay.
  //   // The floor list should not be closed in this situation.
  //   if (!e.path || e.path.length === 5 || !e.path[0].className.includes('main')) return
  //   let flag = true
  //   for (let i = 0; i < e.path.length; i++) {
  //     if (e.path[i].className && e.path[i].className.includes && (e.path[i].className.includes('navbar') ||
  //       e.path[i].className.includes('dialog') || e.path[i].className.includes('overlay'))) flag = false
  //   }
  //   if (flag) this.deactivate()
  // }
}
</script>

<style>
.holelist {
  position: fixed;
}

.holelist-right {
  transition: transform 0.5s, flex 0.5s, max-width 0.5s;
  transform: translateX(0);
  flex: 40vw;
  max-width: 40vw;
}

.holelist-left {
  transition: transform 0.5s, flex 0.5s, max-width 0.5s;
  transform: translateX(-18vw);
  flex: 28vw;
  max-width: 28vw;
}

</style>
