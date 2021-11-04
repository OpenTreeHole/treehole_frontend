<template>
  <v-container v-click-outside='clickOutside' style='overflow: visible'>
    <v-row justify='center' class='ma-0'>
      <v-col class='mb-5 holelist'
             :class='isActive ? "holelist-left" : "holelist-right"'
             :style="{marginTop: '-'+posY.toString()+'px'}"
             @transitionend='onActivationEnd'
             @wheel='scrollHoleListWhenActive'
      >
        <HoleList
          :activate='openHole'
          :display-hole-id='displayHoleId'
          ref='holeList'
        />
      </v-col>
      <v-col v-if='displayHoleId!==-1 && showFloorList' class='mb-5' cols='5' />

      <v-col class='mb-5' cols='6'>
        <FloorList
          v-if='displayHoleId!==-1 && showFloorList'
          :key='displayHoleId'
          :display-floor-id='displayFloorId'
          :wrapped-hole-or-id='displayHole'
          ref='floorList'
          class='pa-0'
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
import HoleList from '@/components/hole/HoleList.vue'
import FloorList from '@/components/hole/FloorList.vue'

import { gsap } from 'gsap'
import { Component, Emit, Ref, Watch } from 'vue-property-decorator'
import { WrappedHole } from '@/api/hole'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'

@Component({
  components: {
    FloorList,
    HoleList
  }
})
export default class HolePanel extends BaseComponentOrView {
  public isActive = false
  public isEnd = true
  public showFloorList = false
  public displayHoleId = -1
  public posY = 0
  public marginTopY = 0
  public viewport = 0
  public isLoadingVisible = false
  public displayHole: WrappedHole | null = null
  public displayFloorId = -1

  @Ref() readonly holeList: HoleList
  @Ref() readonly floorList: FloorList

  public refresh (): void {
    this.holeList.refresh()
  }

  public openHole (wrappedHole: WrappedHole, displayFloorId?: number, preventClose: boolean = false): void {
    this.displayHole = wrappedHole
    if (!this.isActive || !preventClose || this.displayHoleId !== wrappedHole.hole.holeId) {
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
    if (!this.isActive) {
      this.isActive = true
      this.isEnd = false
    }
    if (this.displayHoleId !== id) {
      this.displayHoleId = id
      document.body.scrollTop = document.documentElement.scrollTop = 0
    } else {
      this.displayHoleId = -1
      this.showFloorList = false
      this.isActive = false
      this.isEnd = false
    }
  }

  public onActivationEnd (e: TransitionEvent): void {
    if (e.propertyName === 'transform') {
      this.isEnd = true
      if (this.isActive) {
        document.body.scrollTop = document.documentElement.scrollTop = 0
        this.showFloorList = true
      }
    }
  }

  public scrollHoleList (e: WheelEvent): void {
    const ratio = 0.7
    this.marginTopY = (this.marginTopY > -e.deltaY * ratio ? this.marginTopY + e.deltaY * ratio : 0)

    const height = this.holeList.getHeight()

    if (this.marginTopY + this.viewport > height + 200) {
      this.marginTopY = height - this.viewport + 200
    }
  }

  public wheelListener (e: WheelEvent) {
    if (!this.isActive && this.isEnd) {
      this.scrollHoleList(e)
    }
  }

  public scrollHoleListWhenActive (e: any): void {
    if (this.isActive || !this.isEnd) {
      e.preventDefault()
      this.scrollHoleList(e)
    }
  }

  public deactivate (id: number): void {
    if (this.displayHoleId !== -1) {
      this.activate(id)
    }
  }

  public clickOutside (e: { path: HTMLElement[] }) {
    // The length of e.path will be 5 only when dragging cursor from the dialog to the overlay.
    // The floor list should not be closed in this situation.
    if (!e.path || e.path.length === 5 || !e.path[0].className.includes('main')) return
    let flag = true
    for (let i = 0; i < e.path.length; i++) {
      if (e.path[i].className && e.path[i].className.includes && (e.path[i].className.includes('navbar') ||
        e.path[i].className.includes('dialog') || e.path[i].className.includes('overlay'))) flag = false
    }
    if (flag) this.deactivate(this.displayHoleId)
  }

  mounted () {
    this.viewport = window.innerHeight
    window.addEventListener('wheel', this.wheelListener)
    window.addEventListener('resize', () => {
      this.viewport = window.innerHeight
    })
  }

  destroyed () {
    window.removeEventListener('wheel', this.wheelListener)
  }

  @Watch('showDiscussion')
  @Emit()
  showDiscussionChanged (_val: boolean) {
  }

  @Watch('marginTopY')
  marginTopYChanged (newVal: number) {
    gsap.to(this.$data, {
      duration: 0.2,
      posY: newVal
    })
  }
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
