<template>
  <v-container class="search">
    <v-card>
      <v-card-title>搜索：{{ this.$route.query.wd }}</v-card-title>
    </v-card>
    <PostList
      ref="posts"
      api="posts/"
      :requestParams="{ search: this.$route.query.wd }"
    ></PostList>
  </v-container>
</template>

<script>
import PostList from '@/components/PostList.vue'

export default {
  name: 'Search',
  components: { PostList },
  // computed: {
  //   wd() {
  //     return this.$route.query.wd
  //   },
  // },
  // methods: {
  //   reloadSearch() {
  //     this.$refs.posts.requestParams = { search: this.wd }
  //     this.$refs.posts.posts = []
  //     this.$refs.posts.styleData = []
  //     this.$refs.posts.getPosts()
  //   },
  // },
  // watch: {
  //   wd() {
  //     this.reloadSearch()
  //   },
  // },
  // watch: {
  //   $route(to, from) {
  //     this.$forceUpdate()
  //   },
  // },
}
</script>

<style scoped>
</style>
