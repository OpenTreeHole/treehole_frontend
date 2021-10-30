<template>
  <v-card v-if='mentionFloor' class='reply' :class='additionalClass'>
    <!-- 回复框顶栏 -->
    <v-card-actions class='pb-0 pl-4 pr-4 pt-2 text-body-2'>
      <span style='color: rgba(85,93,86,0.48); '>
        <b>{{ mentionFloor.anonyname }}</b> {{ mentionFloorInfo }}
      </span>
      <v-spacer/>
      <v-icon
        v-if='gotoMentionFloor'
        @click='gotoMentionFloor'
        small
      >
        {{ gotoMentionFloorIcon }}
      </v-icon>
    </v-card-actions>
    <v-card-text class='reply-text pt-2 pb-2' v-html='mentionFloor.html' :class='clipClass'/>
    <v-btn
      v-if='needClip'
      text
      block
      depressed
      x-small
      class='btn-fixed-br'
      color='grey lighten-1'
      @click='isClipped=!isClipped'
    >
      <v-spacer></v-spacer>
      <v-icon v-if='isClipped'>mdi-chevron-double-down</v-icon>
      <v-icon v-else>mdi-chevron-double-up</v-icon>
    </v-btn>
  </v-card>
</template>

<script lang='ts'>
import { Component, Prop } from 'vue-property-decorator'
import { MarkedFloor } from '@/api/hole'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import hljs from 'highlight.js'

@Component
export default class Mention extends BaseComponentOrView {
  @Prop({ required: true }) mentionFloor: MarkedFloor | null
  @Prop({ type: Function }) gotoMentionFloor?: Function
  @Prop({ type: String, default: 'mdi-arrow-collapse-up' }) gotoMentionFloorIcon: string
  /**
   * Info which indicates the place where the floor is published.
   * <p> The info will be displayed after the anonyname. </p>
   * e.g. 6L, #12354
   */
  @Prop({ type: String, default: '' }) mentionFloorInfo: string
  @Prop({ type: String, default: '' }) additionalClass: string
  public maxHeight = 200
  public needClip = false
  public isClipped = false
  get clipClass () {
    return this.isClipped ? ' reply-clip' : ''
  }

  mounted () {
    hljs.highlightAll()
    if (!this.$el) return
    const height = parseInt(window.getComputedStyle(this.$el).height)
    if (height > this.maxHeight) {
      this.needClip = true
      this.isClipped = true
    }
  }
}
</script>

<style scoped>
.btn-fixed-br {
  position: absolute;
  bottom: 5px;
  right: 5px;
}
</style>
