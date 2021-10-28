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
        mdi-arrow-collapse-up
      </v-icon>
    </v-card-actions>
    <v-card-text class='reply-text pt-2 pb-2' v-html='mentionFloor.html'>
    </v-card-text>
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
  /**
   * Info which indicates the place where the floor is published.
   * <p> The info will be displayed after the anonyname. </p>
   * e.g. 6L, #12354
   */
  @Prop({ type: String, default: '' }) mentionFloorInfo: string
  @Prop({ type: String, default: '' }) additionalClass: string

  mounted () {
    hljs.highlightAll()
  }
}
</script>

<style scoped>

</style>
