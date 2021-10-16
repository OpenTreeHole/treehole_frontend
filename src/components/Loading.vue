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
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

@Component
export default class Loading extends Vue {
  @Prop({ required: true, type: Number }) length!: number
  @Prop({ required: true, type: Function }) readonly loadList!: Function

  // 加载状态
  public hasNext = true
  public isLoading = true

  public onIntersect (entries: IntersectionObserverEntry[], observer: IntersectionObserver): void {
    if (entries[0].isIntersecting) {
      this.load()
    }
  }

  public async load () {
    if (!this.hasNext) {
      return
    }
    this.isLoading = true
    const beforeLength = this.length
    await this.loadList()
    const afterLength = this.length
    this.isLoading = false
    if (afterLength < 10) {
      this.hasNext = false
      return
    }
    if (beforeLength === afterLength) {
      this.hasNext = false
      return
    }
    this.hasNext = true
  }

  @Watch('length')
  lengthChanged () {
    this.isLoading = false
    if (this.length % 10 !== 0) {
      this.hasNext = false
    }
  }
}
</script>
