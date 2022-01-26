<template>
  <v-row
    class='py-4'
    v-intersect='{
      handler: onIntersect,
      options: { threshold: [0,0.2] }
    }'
  >
    <v-col class='text-center'>
      <v-progress-linear
        :active='isLoading || pauseLoading'
        indeterminate
        absolute
        top
        color='teal'
      >
      </v-progress-linear>

      <div v-if='isLoading || pauseLoading'>
        <v-progress-circular indeterminate color='teal'></v-progress-circular>
      </div>
      <div v-if='!hasNext && !isLoading && !pauseLoading'>没有然后了......</div>
    </v-col>
  </v-row>
</template>

<script lang='ts'>
import { Component, Prop } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { sleep } from '@/utils/utils'

@Component
export default class Loading extends BaseComponentOrView {
  @Prop({ required: true, type: Array }) request: (() => Promise<boolean>)[]
  @Prop({ required: false, type: Boolean, default: false }) pauseLoading: boolean

  // 加载状态
  public hasNext = true
  public isLoading = false

  /**
   * Try to load when the loading intersected with the view component (i.e. comes into view).
   */
  public onIntersect (entries: IntersectionObserverEntry[]): void {
    if (entries[0].isIntersecting) {
      this.load()
    }
  }

  public async load (index: number = 0) {
    if (!this.hasNext || this.pauseLoading || this.request.length === 0) {
      return
    }

    this.isLoading = true
    this.hasNext = await this.request[index]()
    this.isLoading = false
  }

  public async loadOnce (index: number = 0) {
    if (this.pauseLoading) {
      console.error('Try to load when loading is paused.')
      return
    }

    this.isLoading = true
    this.hasNext = await this.request[index]()
    this.isLoading = false
  }

  /**
   * Manually set the request and load it.
   * @param customRequest
   */
  public async loadCustomRequestOnce (customRequest: () => Promise<void>) {
    await this.waitForUnpause(8)

    this.isLoading = true
    await customRequest()
    this.isLoading = false
  }

  /**
   * Block until the pause loading ends.
   * @param times - The max trial times. (Planned to be replaced with a timeout)
   */
  public async waitForUnpause (times: number) {
    if (this.pauseLoading && times > 0) {
      await sleep(500)
      await this.waitForUnpause(times - 1)
    }
    if (this.pauseLoading) console.error('Try to load when loading is paused.')
  }

  /**
   * Set hasNext to true and continue load.
   * @param index - The request index.
   */
  public continueLoad (index: number = 0) {
    if (!this.isLoading) {
      this.hasNext = true
      this.load(index)
    }
  }
}
</script>
