<template>
  <v-card>
    <div class="post-content">
      <!-- 内容主体 -->
      <v-card-text
        @click="toDiscussion(post.discussion)"
        class="text--primary py-2 text-body-1 clickable"
        v-ripple
      >
        <div
          v-if="this.$parent.styleData[index]['fold']"
          :id="'p' + index"
          class="fold"
        >
          {{ post.content | plainText }}
        </div>
        <div v-else :id="'p' + index" class="unfold">
          <div id="rich-text" v-html="post.content"></div>
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
        <span style="float: left">#{{ post.discussion + ':' + post.id }}</span>
        <span style="float: inherit">{{ post.username }}</span>
        <span style="float: right">{{
          post.date_created | timeDifference
        }}</span>
      </v-card-text>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'PostCard',
  props: {
    index: Number(),
    post: {
      id: Number(),
      content: '',
      username: '',
      reply_to: '',
      date_created: '',
      discussion: Number(),
    },
  },
  methods: {
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

<style scoped>
</style>
