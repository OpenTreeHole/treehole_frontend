<template>
  <v-container>
    <v-row v-for='(computedData, index) in computedDatas' :key='computedData.data[vkey]' :class='computedData.class'
           :id='"animated-"+computedData.data[vkey]'>
      <slot :data='computedData.data' :index='index' />
    </v-row>
  </v-container>
</template>

<script lang='ts'>

import { Component, Prop, Watch } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import anime from 'animejs'

interface ComputedData {
  data: any
  class: string
}

@Component
export default class AnimatedList extends BaseComponentOrView {
  @Prop({ required: true, type: Array }) datas: any[]
  @Prop({ required: true, type: String }) vkey: string
  public computedDatas: ComputedData[] = []

  public computedHeight: Map<string, number> = new Map()
  public currentTop: Map<string, number> = new Map()
  public updatedTop: Map<string, number> = new Map()
  public completeCount: 0

  public generateComputedData (): ComputedData[] {
    const ret: ComputedData[] = []
    this.datas.forEach(data => {
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
    this.computedDatas.forEach(computedData => {
      this.currentTop.set(computedData.data[this.vkey], top)
      const height = this.computedHeight.get(computedData.data[this.vkey])
      if (!height) throw new Error('Computed Height Not Found!')
      top += height
    })
  }

  public measureUpdatedTop () {
    let top = 0
    this.datas.forEach(data => {
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

  public complete () {
    this.completeCount++
    if (this.completeCount === this.datas.length) {
      this.computedDatas = this.generateComputedData()
    }
  }

  @Watch('datas', { immediate: true })
  async datasChanged () {
    const isFirst = this.computedDatas.length === 0
    this.datas.forEach(data => {
      if (this.getComputedDatasFromKey(data[this.vkey]) === null) {
        this.computedDatas.push({ data: data, class: 'invisible' })
      }
    })
    await this.$nextTick()
    this.measureHeight()
    this.measureCurrentTop()
    this.measureUpdatedTop()
    this.completeCount = 0
    this.computedDatas.forEach(computedData => {
      const from = this.currentTop.get(computedData.data[this.vkey])
      const to = this.updatedTop.get(computedData.data[this.vkey])
      if (from === undefined) throw new Error('Cannot Get From Data!')
      if (to === undefined) {
        anime({
          targets: document.getElementById('animated-' + computedData.data[this.vkey]),
          opacity: 0
        })
        return
      }
      const animation = anime.timeline({
        targets: document.getElementById('animated-' + computedData.data[this.vkey])
      })

      if (!isFirst) {
        animation.add({
          translateY: to - from,
          duration: 900
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
        duration: 550,
        easing: 'cubicBezier(0.385, 0.900, 0.570, 1.010)'
      }, '+=50')
      animation.finished.then(() => {
        const element = document.getElementById('animated-' + computedData.data[this.vkey])
        if (!element) return
        anime.remove(element)
        element.removeAttribute('style')
        this.complete()
      })
    })
  }
}
</script>

<style scoped>
.invisible {
  opacity: 0
}
</style>
