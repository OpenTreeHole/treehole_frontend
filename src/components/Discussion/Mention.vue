<template>
  <v-card v-if='mentionFloor' class='reply'>
    <!-- 回复框顶栏 -->
    <v-card-text class='pb-1 pt-2 text-body-2'>
      <span>
        {{ mentionFloor.anonyname }}
      </span>
      <v-divider
        class="mx-4"
        vertical
      ></v-divider>
      {{ mentionFloorInfo }}
      <v-icon
        v-if='gotoMentionFloor'
        @click='gotoMentionFloor'
        small
        style='float: right'
      >
        mdi-arrow-collapse-up
      </v-icon>
    </v-card-text>
    <v-card-text class='reply-text'>
      {{ mentionFloor.content | plainText }}
    </v-card-text>
  </v-card>
</template>

<script lang='ts'>
import { Component, Prop } from 'vue-property-decorator'
import { Floor } from '@/components/Discussion/hole'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'

@Component
export default class Mention extends BaseComponentOrView {
  @Prop({ required: true }) mentionFloor: Floor | null
  @Prop({ type: Function }) gotoMentionFloor?: Function
  /**
   * Info which indicates the place where the floor is published.
   * <p> The info will be displayed after the anonyname. </p>
   * e.g. 6L, #12354
   */
  @Prop({ type: String }) mentionFloorInfo?: string
}
</script>

<style scoped>

</style>
