<template>
  <div :style="style">
    <slot />
  </div>
</template>

<script lang="ts">
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Component, Prop } from 'vue-property-decorator'
import { debounce } from 'lodash-es'

@Component
export default class FixHeightDiv extends BaseComponentOrView {
  @Prop({ required: false, default: true, type: Boolean }) fix: boolean
  fixedHeight = '4.5rem'
  resizeObserver: ResizeObserver

  get style() {
    return this.fix ? `max-height: ${this.fixedHeight};` : ''
  }

  computeFixHeight() {
    const element = this.$el as HTMLElement
    this.fixedHeight = window.getComputedStyle(element).height
  }

  async mounted() {
    this.computeFixHeight()
    this.resizeObserver = new ResizeObserver(debounce(this.computeFixHeight, 100))
    this.resizeObserver.observe(this.$el)
  }
}
</script>

<style
  lang="scss"
  scoped
></style>
