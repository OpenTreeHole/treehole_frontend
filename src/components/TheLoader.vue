<template>
  <div>
    <v-row
      v-if='hasNext && !isLoading'
      class='py-4'
      v-intersect='{
        handler: onIntersect,
        options: { threshold: [0,0.2] }
      }'
    >
    </v-row>
    <v-row
      v-else
      class='py-4'
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
  </div>
</template>

<script lang='ts'>
import { Component, Prop } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { debounce } from 'lodash-es'

@Component
export default class TheLoader extends BaseComponentOrView {
  @Prop({ required: true, type: Array }) request: (() => Promise<boolean>)[]

  hasNext = true
  isLoading = false
  debounceLoad = debounce(this.load, 200)

  /**
   * Try to load when the loading intersected with the view component (i.e. comes into view).
   */
  onIntersect (entries: IntersectionObserverEntry[]): void {
    if (entries[0].isIntersecting) {
      this.load()
    }
  }

  async load (index: number = 0) {
    if (!this.hasNext || this.request.length === 0) {
      return
    }

    this.isLoading = true
    this.hasNext = await this.request[index]()
    this.isLoading = false
  }

  async loadOnce (index: number = 0) {
    this.isLoading = true
    this.hasNext = await this.request[index]()
    this.isLoading = false
  }

  /**
   * Manually set the request and load it.
   * @param customRequest
   */
  async loadCustomRequestOnce (customRequest: () => Promise<void>) {
    this.isLoading = true
    await customRequest()
    this.isLoading = false
  }

  /**
   * Set hasNext to true and continue load.
   * @param index - The request index.
   */
  continueLoad (index: number = 0) {
    if (!this.isLoading) {
      this.hasNext = true
      this.load(index)
    }
  }
}
</script>
