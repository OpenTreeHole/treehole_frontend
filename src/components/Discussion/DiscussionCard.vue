<template>
  <v-card class='discussion-card' :num='discussion.id'>
    <!-- 标签栏 -->
    <v-card-text class='pb-0 pt-2 font-weight-medium'>
      <v-chip
        v-for='(tag, tindex) in discussion.tag'
        :key='tindex'
        :color='tag.color'
        outlined
        class='mx-1 my-1'
        small
        ripple
        @click='addTag(tag)'
      >
        {{ tag.name }}
      </v-chip>
    </v-card-text>
    <v-card-text class='folded-hint' v-if='discussion.is_folded' color='grey'>
      该内容已折叠：
      <span class='clickable' @click='switchIfDisplay'>
        {{ this.displayIt ? '收起' : '展开' }}
      </span>
    </v-card-text>
    <div class='post-content' v-if='this.displayIt'>
      <!-- 内容主体 -->
      <v-card-text
        @click='activate(discussion.id)'
        class='text--primary py-2 text-body-1 clickable'
        v-ripple
      >
        <div
          v-if='styleData.fold'
          :id="'p' + index"
          class='fold'
        >
          {{ discussion.first_post.content | plainText }}
        </div>
        <div v-else :id="'p' + index" class='unfold'>
          <div class='rich-text' v-html='discussion.first_post.content'></div>
        </div>
      </v-card-text>

      <!-- 展开折叠按钮 -->
      <div v-if='styleData.lines > 3'>
        <div v-if='styleData.fold'>
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
        v-if='
          discussion.first_post.id !== discussion.last_post.id &&
          !discussion.is_folded
        '
      >
        <v-row class='mx-3'>
          <span
            style='
              width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            '
          >RE：{{ discussion.last_post.content | plainText }}</span
          ></v-row
        >
      </v-card-text>

      <!-- 脚标 -->
      <v-card-text class='pt-0 pb-0 text-center caption'>
        <span class='clickable' style='float: left' @click='orderByTimeCreated'
        >#{{ discussion['id'] }}</span
        >
        <span
          class='clickable'
          style='float: inherit'
          @click='orderByTimeUpdated'
        >{{ discussion['date_updated'] | timeDifference }}</span
        >
        <span style='float: right'
        ><v-icon small>mdi-message-processing-outline</v-icon>
          {{ discussion['count'] }}
        </span>
      </v-card-text>
    </div>
  </v-card>
</template>

<script lang='ts'>
import Vue from 'vue'
import { Component, Emit, Prop } from 'vue-property-decorator'

@Component
export default class DiscussionCard extends Vue {
  @Prop({ required: true, type: Object }) readonly discussion: any
  @Prop({ required: true, type: Number }) index: number
  @Prop({ required: true, type: Function }) activate: Function
  @Prop({ required: true, type: Object }) styleData: { fold: boolean, lines: number }

  displayIt: boolean = false

  public orderByTimeCreated (): void {
    this.changeOrder('last_created')
    this.$store.dispatch('messageSuccess', '已按照发帖时间排序')
    // 刷新列表
    this.refreshDiscussionList()
  }

  @Emit()
  public changeOrder (order: string) {
  }

  @Emit()
  public changeFoldStatus (e: { index: number, fold: boolean }) {
    this.styleData.fold = e.fold
  }

  @Emit('refresh')
  public refreshDiscussionList (): void {
  }

  @Emit()
  public addTag (tag: { color: string, count: number, name: string }): void {
  }

  public orderByTimeUpdated (): void {
    this.changeOrder('')
    this.$store.dispatch('messageSuccess', '已按照最新回复时间排序')
    // 刷新列表
    this.refreshDiscussionList()
  }

  public unfold (index: number): void {
    this.changeFoldStatus({ index: index, fold: false })
  }

  public fold (index: number): void {
    this.changeFoldStatus({ index: index, fold: true })
  }

  public switchIfDisplay (): void {
    this.displayIt = !this.displayIt
  }

  created () {
    this.displayIt = !this.discussion.is_folded
  }
}
</script>
