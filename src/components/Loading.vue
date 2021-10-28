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
  @Prop({ required: true, type: Function }) request: () => Promise<boolean>
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

  public async load () {
    if (!this.hasNext || this.pauseLoading) {
      return
    }

    this.isLoading = true
    this.hasNext = await this.request()
    this.isLoading = false
  }

  public continueLoad () {
    this.hasNext = true
    this.load()
  }
}
</script>
