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
import { Component, Prop } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { debounce } from 'lodash-es'

@Component
export default class Loading extends BaseComponentOrView {
  @Prop({ required: true, type: Array }) request: (() => Promise<boolean>)[]

  hasNext = true
  isLoading = false
  debounceLoad = debounce(this.load, 100)

  /**
   * Try to load when the loading intersected with the view component (i.e. comes into view).
   */
  public onIntersect (entries: IntersectionObserverEntry[]): void {
    if (entries[0].isIntersecting) {
      this.debounceLoad()
    }
  }

  public async load (index: number = 0) {
    if (!this.hasNext || this.request.length === 0) {
      return
    }

    this.isLoading = true
    this.hasNext = await this.request[index]()
    this.isLoading = false
  }

  public async loadOnce (index: number = 0) {
    this.isLoading = true
    this.hasNext = await this.request[index]()
    this.isLoading = false
  }

  /**
   * Manually set the request and load it.
   * @param customRequest
   */
  public async loadCustomRequestOnce (customRequest: () => Promise<void>) {
    this.isLoading = true
    await customRequest()
    this.isLoading = false
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
