<template>
  <v-card :class='isActive ? "discussion-card--active" : "discussion-card"'>
    <!-- 标签栏 -->
    <v-card-actions class='pb-0 pt-2 pl-3 pr-3 font-weight-medium'>
      <v-chip
        v-for='(tag, tindex) in discussion.hole.tags'
        :key='tindex'
        color='red'
        outlined
        class='mx-1 my-1'
        small
        ripple
      >
        {{ tag.name }}
      </v-chip>
    </v-card-actions>
    <v-card-text class='folded-hint' v-if='discussion.isFolded' color='grey'>
      该内容已折叠：
      <span class='clickable' @click='displayIt = !displayIt'>
        {{ displayIt ? '收起' : '展开' }}
      </span>
    </v-card-text>
    <div class='post-content' v-if='displayIt'>
      <!-- 内容主体 -->
      <v-card-text
        @click='activate(discussion)'
        class='text--primary py-2 text-body-1 clickable'
        v-ripple
      >
        <div
          v-if='discussion.styleData.fold'
          :id="'p' + index"
          class='fold'
        >
          {{ discussion.firstFloor.content | plainText }}
        </div>
        <div v-else :id="'p' + index" class='unfold'>
          <div class='rich-text' v-html='discussion.firstFloor.content' />
        </div>
      </v-card-text>

      <!-- 展开折叠按钮 -->
      <div v-if='discussion.styleData.lines > 3'>
        <div v-if='discussion.styleData.fold'>
          <v-btn
            text
            block
            depressed
            x-small
            color='grey lighten-1'
            @click='unfold(index)'
          >
            <v-icon>mdi-chevron-double-down</v-icon>
          </v-btn>
        </div>

        <div v-else>
          <v-btn
            text
            block
            depressed
            x-small
            color='grey lighten-1'
            @click='fold(index)'
          >
            <v-icon>mdi-chevron-double-up</v-icon>
          </v-btn>
        </div>
      </div>
      <div v-else>
        <div style='height: 0.5rem'></div>
      </div>

      <v-card-text
        v-if='discussion.firstFloor.floorId !== discussion.lastFloor.floorId'
      >
        <v-row class='mx-3'>
          <span
            style='
              width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            '
          >
            RE：{{ discussion.lastFloor.content | plainText }}
          </span>
        </v-row>
      </v-card-text>

      <!-- 脚标 -->
      <v-card-actions class='pt-0 pb-0 caption'>
        <span>#{{ discussion.hole.holeId }}</span>
        <v-spacer />
        <span>{{ discussion.hole.timeUpdated | timeDifference }}</span>
        <v-spacer />
        <span>
          <v-icon small>mdi-message-processing-outline</v-icon>
          {{ discussion.hole.reply }}
        </span>
      </v-card-actions>
    </div>
  </v-card>
</template>

<script lang='ts'>
import { Component, Emit, Prop } from 'vue-property-decorator'
import { WrappedHole } from '@/api/hole'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'

@Component
export default class DiscussionCard extends BaseComponentOrView {
  @Prop({ required: true, type: WrappedHole }) readonly discussion: WrappedHole
  @Prop({ required: true, type: Number }) index: number
  @Prop({ required: true, type: Function }) activate: Function
  @Prop({ required: false, type: Boolean, default: false }) isActive: boolean

  displayIt: boolean = false

  @Emit('refresh')
  public refreshDiscussionList (): void {
  }

  @Emit()
  public addTag (tag: { color: string, count: number, name: string }): void {
  }

  public unfold (index: number): void {
    this.discussion.styleData.fold = false
  }

  public fold (index: number): void {
    this.discussion.styleData.fold = true
  }

  created () {
    this.displayIt = !this.discussion.isFolded
  }
}
</script>

<style lang='scss' scoped>
.discussion-card {
  transition: 1s;
}

.discussion-card--active {
  transition: 1s;
  background-color: #DFDFDF !important;
}
</style>
