<template>
  <v-container class="pa-0 mb-3">
    <v-row
      class="ma-0"
      v-for="(computedData, index) in computedDatas"
      :key="computedData.data[vkey]"
      :class="computedData.class"
      :id="'animated-' + computedData.data[vkey]"
    >
      <slot
        :data="computedData.data"
        :index="index"
      />
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { sleep } from '@/utils/utils'
import { CustomEase, gsap } from '@/plugins/gsap'
import { Power4 } from 'gsap/gsap-core'

interface ComputedData {
  data: any
  class: string
}

@Component
export default class AnimatedList extends BaseComponentOrView {
  @Prop({ required: true, type: Array }) datas: any[]
  @Prop({ required: true, type: String }) vkey: string

  computedDatas: ComputedData[] = []
  intermediateDatas: any[] = []

  animating = false
  animatingCount = 0
  completeCount = 0

  computedHeight: Map<string, number> = new Map()
  currentTop: Map<string, number> = new Map()
  updatedTop: Map<string, number> = new Map()

  generateComputedData() {
    const ret: ComputedData[] = []
    this.intermediateDatas.forEach((data) => {
      ret.push({ data: data, class: '' })
    })
    return ret
  }

  measureHeight() {
    this.computedDatas.forEach((computedData) => {
      const element = document.getElementById('animated-' + computedData.data[this.vkey])
      if (element) {
        const height = parseInt(window.getComputedStyle(element).height)
        this.computedHeight.set(computedData.data[this.vkey], height)
      }
    })
  }

  measureCurrentTop() {
    let top = 0
    this.currentTop = new Map()
    this.computedDatas.forEach((computedData) => {
      this.currentTop.set(computedData.data[this.vkey], top)
      const height = this.computedHeight.get(computedData.data[this.vkey])
      if (!height) throw new Error('Computed Height Not Found!')
      top += height
    })
  }

  measureUpdatedTop() {
    let top = 0
    this.updatedTop = new Map()
    this.intermediateDatas.forEach((data) => {
      this.updatedTop.set(data[this.vkey], top)
      const height = this.computedHeight.get(data[this.vkey])
      if (!height) throw new Error('Computed Height Not Found!')
      top += height
    })
  }

  getComputedDatasFromKey(key: string): ComputedData | null {
    let ret: ComputedData | null = null
    this.computedDatas.forEach((computedData) => {
      if (computedData.data[this.vkey] === key) {
        ret = computedData
      }
    })
    return ret
  }

  /**
   * Block until all animation is finished.
   * @param times - The max retry times. (Planned to be replaced with a timeout)
   */
  async waitForAnimatingFinish(times: number) {
    if (this.animating && times > 0) {
      await sleep(500)
      await this.waitForAnimatingFinish(times - 1)
    }
    if (this.animating) console.error('Animating Not Finished!')
  }

  finishAnimation() {
    this.animating = false
    this.updateData()
  }

  /**
   * Called when each animation completed.
   * <p>Calculate how many animation is still running. When all animation is finished, it updates the datas to the intermediateDatas.</p>
   */
  complete() {
    this.completeCount++
    if (this.completeCount === this.animatingCount) {
      this.computedDatas = this.generateComputedData()
      this.finishAnimation()
    }
  }

  isDataUpToDate(): boolean {
    if (this.intermediateDatas.length !== this.datas.length) return false
    for (let i = 0; i < this.intermediateDatas.length && i < this.datas.length; i++) {
      if (this.intermediateDatas[i] !== this.datas[i]) return false
    }
    return true
  }

  updateData() {
    if (this.isDataUpToDate()) return
    this.intermediateDatas = this.datas.map((v) => v)
  }

  @Watch('datas')
  datasChanged() {
    if (!this.animating) this.updateData()
  }

  /**
   * Run animation when intermediateDatas changed.
   * <p>This method first added new datas with the style 'opacity: 0' to the DOM in order to get the computed style of the new element,
   * and then execute animation functions depended on the computed style in the next tick.</p>
   * <p>It runs when intermediateDatas changed instead of the data to ensure that every animation is finished with a complete lifecycle.</p>
   */
  @Watch('intermediateDatas', { immediate: true })
  async intermediateDatasChanged() {
    if (!this.intermediateDatas || this.intermediateDatas.length === 0) {
      this.computedDatas = []
      return
    }
    let isPush = true
    for (let i = 0; i < this.computedDatas.length; i++) {
      if (!this.intermediateDatas[i] || this.computedDatas[i].data !== this.intermediateDatas[i]) {
        isPush = false
        break
      }
    }
    this.intermediateDatas.forEach((data) => {
      if (this.getComputedDatasFromKey(data[this.vkey]) === null) {
        this.computedDatas.push({ data: data, class: 'invisible' })
      }
    })
    await this.$nextTick()
    this.measureHeight()
    this.measureCurrentTop()
    this.measureUpdatedTop()
    this.completeCount = 0
    if (this.computedDatas.length > 0) {
      this.animating = true
      this.animatingCount = this.computedDatas.length
    }
    this.computedDatas.forEach(async (computedData) => {
      const from = this.currentTop.get(computedData.data[this.vkey])
      const to = this.updatedTop.get(computedData.data[this.vkey])
      const target = '#animated-' + computedData.data[this.vkey]
      if (from === undefined) return Promise.reject(new Error('Cannot Get From Data!'))
      if (to === undefined) {
        gsap.to(target, {
          opacity: 0,
          x: 100,
          duration: 0.55,
          ease: 'animatingListEase',
          onComplete: () => {
            this.complete()
          }
        })
        return
      }
      const timeline = gsap.timeline({
        onComplete: () => {
          this.complete()
          const element = document.getElementById('animated-' + computedData.data[this.vkey])
          if (!element) return
          gsap.set(target, { x: 0, y: 0 })
          timeline.kill()
          element.removeAttribute('style')
        }
      })

      if (!isPush) {
        timeline.to(target, {
          y: to - from,
          duration: 0.5,
          ease: Power4.easeOut
        })
      }
      if (computedData.class === 'invisible') {
        timeline.set(target, {
          x: -100
        })
      }
      timeline.to(
        target,
        {
          x: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'animatingListEase'
        },
        '+=0.05'
      )
    })
  }

  async created() {
    CustomEase.create('animatedListEase', '0.385, 0.900, 0.570, 1.010')
  }
}
</script>

<style
  scoped
  lang="scss"
>
.row {
  will-change: transform;
}
</style>
