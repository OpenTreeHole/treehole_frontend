<template>
  <v-container v-click-outside='()=>deactivate(displayCardId)' style='overflow: visible'>
    <v-row justify='center' class='ma-0'>
      <v-col class='mb-5 holelist'
             :class='isActive ? "holelist-left" : "holelist-right"'
             id='transrow'
             :style="{marginTop: '-'+posY.toString()+'px'}"
             @transitionend='Fix'
             @wheel='ScrollDiscussionListWhenActive'
      >
        <DiscussionList
          :activate='openHole'
          ref='holeList'
        />
      </v-col>
      <v-col v-if='displayCardId!==-1 && showDiscussion' class='mb-5' cols='5' />

      <v-col class='mb-5' cols='6' id='discol'>
        <Discussion
          v-if='displayCardId!==-1 && showDiscussion'
          :key='displayCardId'
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
import { WrappedHole } from '@/components/Discussion/hole'
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
  public displayCardId = -1
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
    console.log(`activate: ${id}`)
    if (!this.isActive) {
      this.isActive = true
      this.isEnd = false
    }
    if (this.displayCardId !== id) {
      this.displayCardId = id
    } else {
      this.displayCardId = -1
      this.showDiscussion = false
      this.isActive = false
      this.isEnd = false
    }
    const elements = document.getElementsByClassName('discussion-card')
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].getAttribute('num') === this.displayCardId.toString()) {
        elements[i].classList.add('active')
      } else {
        elements[i].classList.remove('active')
      }
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
    if (this.displayCardId !== -1) {
      this.activate(id)
    }
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
  transition: all 0.5s ease;
  transform: translateX(0);
  flex: 40vw;
  max-width: 40vw;
}

.holelist-left {
  transition: all 0.5s ease;
  transform: translateX(-18vw);
  flex: 28vw;
  max-width: 28vw;
}

.discussion-card {
  transition: 1s;
}

.discussion-card.active {
  background-color: #DFDFDF !important;
}

</style>
