<template>
  <v-card>
    <!-- 标签栏 -->
    <v-card-text class="pb-0 pt-2 font-weight-medium">
      <v-chip
        v-for="(tag, tindex) in discussion.tag"
        :key="tindex"
        :color="tag.color"
        outlined
        class="mx-1 my-1"
        small
        ripple
        @click.stop="addTag(tag)"
      >
        {{ tag.name }}
      </v-chip>
    </v-card-text>
    <v-card-text
      class="folded-hint"
      v-if="discussion.is_folded"
      color="grey" 
    >该内容已折叠：<span
    @click="displayIt=!displayIt"
    >{{
      displayIt ? '收起' : '展开'
    }}</span></v-card-text>
    <div class="post-content" v-show="displayIt">
      <!-- 内容主体 -->
      <v-card-text
        @click="toDiscussion(discussion.id, index)"
        class="text--primary py-2 text-body-1 clickable"
        v-ripple
      >
        <div
          v-if="this.$parent.styleData[index]['fold']"
          :id="'p' + index"
          class="fold"
        >
          {{ discussion.first_post.content | plainText }}
        </div>
        <div v-else :id="'p' + index" class="unfold">
          <div id="rich-text" v-html="discussion.first_post.content"></div>
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
            color="grey lighten-1"
            @click="unfold(index)"
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
            color="grey lighten-1"
            @click="fold(index)"
          >
            <v-icon>mdi-chevron-double-up</v-icon>
          </v-btn>
        </div>
      </div>
      <div v-else>
        <div style="height: 0.5rem"></div>
      </div>

      <!-- 脚标 -->
      <v-card-text class="pt-0 pb-0 text-center caption">
        <span style="float: left">#{{ discussion['id'] }}</span>
        <span style="float: inherit">{{
          discussion['date_updated'] | timeDifference
        }}</span>
        <span style="float: right">
          {{ discussion['count'] }}
          <v-icon small>mdi-message-processing-outline</v-icon>
        </span>
      </v-card-text>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'postcard',
  props: {
    discussion: {},
    index: '',
  },
  data() {
    return {
      displayIt: !this.discussion.is_folded,
      // displayIt: true,
    }
  },
  methods: {
    addTag(tag) {
      this.$parent.addTag(tag)
    },
    toDiscussion(discussion_id) {
      setTimeout(() => {
        this.$router.push({
          path: `/discussion/${discussion_id}`,
        })
      }, 50)
    },
    unfold(index) {
      this.scrollTop = document.documentElement.scrollTop
      this.$parent.styleData[index]['fold'] = false
    },
    fold(index) {
      this.$parent.styleData[index]['fold'] = true
      let scrollDistance = this.scrollTop - document.documentElement.scrollTop
      window.scrollBy({
        top: scrollDistance, //  正值向下
        left: 0,
        behavior: 'smooth',
      })
    },
  },
}
</script>

<style>
</style>
