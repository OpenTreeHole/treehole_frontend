<template>
  <v-card>
    <div class='post-content'>
      <!-- 内容主体 -->
      <v-card-text
        @click='toDiscussion(post.discussion)'
        class='text--primary py-2 text-body-1 clickable'
        v-ripple
      >
        <div
          v-if="this.$parent.styleData[index]['fold']"
          :id="'p' + index"
          class='fold'
        >
          {{ post.content | plainText }}
        </div>
        <div v-else :id="'p' + index" class='unfold'>
          <div class='rich-text' v-html='post.content'></div>
        </div>
      </v-card-text>

      <!-- 展开折叠按钮 -->
      <div v-if="this.$parent.styleData[index]['lines'] > 3">
        <div v-if="this.$parent.styleData[index]['fold']">
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

      <!-- 脚标 -->
      <v-card-text class='pt-0 pb-0 text-center caption'>
        <span style='float: left'>#{{ post.discussion + ':' + post.id }}</span>
        <span style='float: inherit'>{{ post.username }}</span>
        <span style='float: right'>{{
            post.date_created | timeDifference
          }}</span>
      </v-card-text>
    </div>
  </v-card>
</template>

<script lang='ts'>

import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import PostList from '@/components/PostList.vue'

@Component
export default class PostCard extends Vue {
  @Prop(Number) public index: number
  @Prop(Object) public post: {
    id: number
    content: string
    username: string
    // eslint-disable-next-line camelcase
    reply_to: string
    // eslint-disable-next-line camelcase
    date_created: string
    discussion: number
  }

  @Prop({ required: true, type: Vue }) public postList: PostList

  public toDiscussion (discussionId: number): void {
    setTimeout(() => {
      this.$router.push({
        path: `/discussion/${discussionId}`
      })
    }, 50)
  }

  public unfold (index: number): void {
    (this as unknown as HTMLElement).scrollTop = document.documentElement.scrollTop
    this.postList.styleData[index].fold = false
  }

  public fold (index: number): void {
    this.postList.styleData[index].fold = true
    const scrollDistance = (this as unknown as HTMLElement).scrollTop - document.documentElement.scrollTop
    window.scrollBy({
      top: scrollDistance, //  正值向下
      left: 0,
      behavior: 'smooth'
    })
  }
}
</script>
