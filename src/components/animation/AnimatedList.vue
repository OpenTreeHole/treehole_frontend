<template>
  <v-container class='pa-0 mb-3'>
    <v-row class='ma-0' v-for='(computedData, index) in computedDatas' :key='computedData.data[vkey]' :class='computedData.class'
           :id='"animated-"+computedData.data[vkey]'>
      <slot :data='computedData.data' :index='index' />
    </v-row>
  </v-container>
</template>

<script lang='ts'>

import { Component, Prop, Watch } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import anime from 'animejs'
import { sleep } from '@/utils/utils'

interface ComputedData {
  data: any
  class: string
}

@Component
export default class AnimatedList extends BaseComponentOrView {
  @Prop({ required: true, type: Array }) datas: any[]
  @Prop({ required: true, type: String }) vkey: string
  public computedDatas: ComputedData[] = []
  public intermediateDatas: any[] = []

  public animating = false
  public animatingCount = 0
  public completeCount = 0

  public computedHeight: Map<string, number> = new Map()
  public currentTop: Map<string, number> = new Map()
  public updatedTop: Map<string, number> = new Map()

  public generateComputedData (): ComputedData[] {
    const ret: ComputedData[] = []
    this.intermediateDatas.forEach(data => {
      ret.push({ data: data, class: '' })
    })
    return ret
  }

  public measureHeight () {
    this.computedDatas.forEach(computedData => {
      const element = document.getElementById('animated-' + computedData.data[this.vkey])
      if (element) {
        const height = parseInt(window.getComputedStyle(element).height)
        this.computedHeight.set(computedData.data[this.vkey], height)
      }
    })
  }

  public measureCurrentTop () {
    let top = 0
    this.currentTop = new Map()
    this.computedDatas.forEach(computedData => {
      this.currentTop.set(computedData.data[this.vkey], top)
      const height = this.computedHeight.get(computedData.data[this.vkey])
      if (!height) throw new Error('Computed Height Not Found!')
      top += height
    })
  }

  public measureUpdatedTop () {
    let top = 0
    this.updatedTop = new Map()
    this.intermediateDatas.forEach(data => {
      this.updatedTop.set(data[this.vkey], top)
      const height = this.computedHeight.get(data[this.vkey])
      if (!height) throw new Error('Computed Height Not Found!')
      top += height
    })
  }

  public getComputedDatasFromKey (key: string): ComputedData | null {
    let ret: ComputedData | null = null
    this.computedDatas.forEach(computedData => {
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
  public async waitForAnimatingFinish (times: number) {
    if (this.animating && times > 0) {
      await sleep(500)
      await this.waitForAnimatingFinish(times - 1)
    }
    if (this.animating) console.error('Animating Not Finished!')
  }

  public finishAnimation () {
    this.animating = false
    this.updateData()
  }

  /**
   * Called when each animation completed.
   * <p>Calculate how many animation is still running. When all animation is finished, it updates the datas to the intermediateDatas.</p>
   */
  public complete () {
    this.completeCount++
    if (this.completeCount === this.animatingCount) {
      this.computedDatas = this.generateComputedData()
      this.finishAnimation()
    }
  }

  public isDataUpToDate (): boolean {
    if (this.intermediateDatas.length !== this.datas.length) return false
    for (let i = 0; i < this.intermediateDatas.length && i < this.datas.length; i++) {
      if (this.intermediateDatas[i] !== this.datas[i]) return false
    }
    return true
  }

  public updateData () {
    if (this.isDataUpToDate()) return
    this.intermediateDatas = this.datas.map(v => v)
  }

  @Watch('datas')
  datasChanged () {
    if (!this.animating) this.updateData()
  }

  /**
   * Run animation when intermediateDatas changed.
   * <p>This method first added new datas with the style 'opacity: 0' to the DOM in order to get the computed style of the new element,
   * and then execute animation functions depended on the computed style in the next tick.</p>
   * <p>It runs when intermediateDatas changed instead of the data to ensure that every animation is finished with a complete lifecycle.</p>
   */
  @Watch('intermediateDatas', { immediate: true })
  async intermediateDatasChanged () {
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
    this.intermediateDatas.forEach(data => {
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
    this.computedDatas.forEach(computedData => {
      const from = this.currentTop.get(computedData.data[this.vkey])
      const to = this.updatedTop.get(computedData.data[this.vkey])
      if (from === undefined) throw new Error('Cannot Get From Data!')
      if (to === undefined) {
        anime({
          targets: document.getElementById('animated-' + computedData.data[this.vkey]),
          opacity: 0,
          translateX: 100,
          duration: 300,
          easing: 'cubicBezier(0.385, 0.900, 0.570, 1.010)'
        }).finished.then(() => {
          this.complete()
        })
        return
      }
      const animation = anime.timeline({
        targets: document.getElementById('animated-' + computedData.data[this.vkey])
      })

      if (!isPush) {
        animation.add({
          translateY: to - from,
          duration: 500
        })
      }
      if (computedData.class === 'invisible') {
        animation.add({
          translateX: -100,
          duration: 0
        })
      }
      animation.add({
        translateX: 0,
        opacity: 1,
        duration: 300,
        easing: 'cubicBezier(0.385, 0.900, 0.570, 1.010)'
      }, '+=50')
      animation.finished.then(() => {
        this.complete()
        const element = document.getElementById('animated-' + computedData.data[this.vkey])
        if (!element) return
        anime.remove(element)
        element.removeAttribute('style')
      })
    })
  }
}
</script>
