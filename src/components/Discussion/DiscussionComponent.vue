<template>
  <v-container v-click-outside='clickOutside' style='overflow: visible'>
    <v-row justify='center' class='ma-0'>
      <v-col class='mb-5 holelist'
             :class='isActive ? "holelist-left" : "holelist-right"'
             :style="{marginTop: '-'+posY.toString()+'px'}"
             @transitionend='Fix'
             @wheel='ScrollDiscussionListWhenActive'
      >
        <DiscussionList
          :activate='openHole'
          :display-hole-id='displayHoleId'
          ref='holeList'
        />
      </v-col>
      <v-col v-if='displayHoleId!==-1 && showDiscussion' class='mb-5' cols='5' />

      <v-col class='mb-5' cols='6' id='discol'>
        <Discussion
          v-if='displayHoleId!==-1 && showDiscussion'
          :key='displayHoleId'
          :wrapped-hole-or-id='displayHole'
          class='pa-0'
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
import DiscussionList from '@/components/Discussion/DiscussionList.vue'
import Discussion from '@/components/Discussion/DiscussionCol.vue'

import { gsap } from 'gsap'
import { Component, Emit, Ref, Watch } from 'vue-property-decorator'
import { WrappedHole } from '@/api/hole'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'

@Component({
  components: {
    Discussion,
    DiscussionList
  }
})
export default class DiscussionComponent extends BaseComponentOrView {
  public isActive = false
  public isEnd = true
  public showDiscussion = false
  public displayHoleId = -1
  public posY = 0
  public marginTopY = 0
  public viewport = 0
  public isLoadingVisible = false
  public displayHole: WrappedHole | null = null

  @Ref() readonly holeList: DiscussionList

  public refresh (): void {
    this.holeList.refresh()
  }

  public openHole (wrappedHole: WrappedHole): void {
    this.displayHole = wrappedHole
    this.activate(wrappedHole.hole.holeId)
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
      this.showDiscussion = false
      this.isActive = false
      this.isEnd = false
    }
  }

  public Fix (e: TransitionEvent): void {
    if (e.propertyName === 'transform') {
      this.isEnd = true
      if (this.isActive) {
        document.body.scrollTop = document.documentElement.scrollTop = 0
        this.showDiscussion = true
      }
    }
  }

  public ScrollDiscussionList (e: WheelEvent): void {
    const ratio = 0.7
    this.marginTopY = (this.marginTopY > -e.deltaY * ratio ? this.marginTopY + e.deltaY * ratio : 0)

    const height = this.holeList.getHeight()

    // console.log('1: ' + this.marginTopY + ';2: ' + this.viewport + ';3: ' + height)
    if (this.marginTopY + this.viewport > height + 300) {
      this.marginTopY = height - this.viewport + 300
    }
  }

  public wheelListener (e: WheelEvent) {
    if (!this.isActive && this.isEnd) {
      this.ScrollDiscussionList(e)
    }
  }

  public ScrollDiscussionListWhenActive (e: any): void {
    if (this.isActive || !this.isEnd) {
      e.preventDefault()
      this.ScrollDiscussionList(e)
    }
  }

  public deactivate (id: number): void {
    if (this.displayHoleId !== -1) {
      this.activate(id)
    }
  }

  public clickOutside (e: { path: HTMLElement[] }) {
    let flag = true
    console.log(e.path)
    for (let i = 0; i < e.path.length; i++) {
      if (e.path[i].className && e.path[i].className.includes && (e.path[i].className.includes('navbar') ||
        e.path[i].className.includes('vditor') || e.path[i].className.includes('overlay'))) flag = false
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
