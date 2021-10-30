<template>
  <v-row
    class='py-4'
    v-intersect='{
      handler: onIntersect,
      options: { threshold: [0,0.2] },
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

@Component
export default class Loading extends BaseComponentOrView {
  @Prop({ required: true, type: Array }) request: (() => Promise<boolean>)[]
  @Prop({ required: false, type: Boolean, default: false }) pauseLoading: boolean

  // 加载状态
  public hasNext = true
  public isLoading = false

  public onIntersect (entries: IntersectionObserverEntry[]): void {
    if (entries[0].isIntersecting) {
      this.load().catch((error) => {
        console.log(error)
        if (error.response === undefined) this.messageError(JSON.stringify(error))
        else this.messageError(error.response.data.msg)
      })
    }
  }

  public async load (index: number = 0) {
    if (!this.hasNext || this.pauseLoading) {
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

  public async loadCustomRequestOnce (customRequest: () => Promise<void>) {
    if (this.pauseLoading) {
      console.error('Try to load when loading is paused.')
      return
    }

    this.isLoading = true
    await customRequest()
    this.isLoading = false
  }

  public continueLoad (index: number = 0) {
    this.hasNext = true
    this.load(index)
  }
}
</script>
