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
        :active='isLoading'
        indeterminate
        absolute
        top
        color='teal'
      >
      </v-progress-linear>

      <div v-if='isLoading'>
        <v-progress-circular indeterminate color='teal'></v-progress-circular>
      </div>
      <div v-if='!hasNext && !isLoading'>没有然后了......</div>
    </v-col>
  </v-row>
</template>

<script lang='ts'>
import { Component, Prop, Watch } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { ArrayRequest } from '@/api'

@Component
export default class Loading extends BaseComponentOrView {
  @Prop({ required: true, type: Object }) request: ArrayRequest<any>

  // 加载状态
  public hasNext = true
  public isLoading = true

  public onIntersect (entries: IntersectionObserverEntry[], observer: IntersectionObserver): void {
    if (entries[0].isIntersecting) {
      this.load().catch((error) => {
        console.log(error)
        if (error.response === undefined) this.messageError(JSON.stringify(error))
        else this.messageError(error.response.data.msg)
      })
    }
  }

  public async load () {
    if (!this.hasNext) {
      return
    }
    this.isLoading = true
    this.hasNext = await this.request.request()
    this.isLoading = false
  }

  @Watch('length')
  lengthChanged () {
    this.isLoading = false
  }
}
</script>
