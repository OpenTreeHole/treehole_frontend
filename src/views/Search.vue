<template>
  <v-container class="search">
    <v-card>
      <v-card-title>搜索：{{ wd }}</v-card-title>
    </v-card>
    <PostList
      ref="posts"
      api="posts/"
      :requestParams="{ search: this.wd }"
    ></PostList>
  </v-container>
</template>

<script>
import PostList from '@/components/PostList.vue'

export default {
  name: 'Search',
  components: { PostList },
  computed: {
    wd() {
      return this.$route.query.wd
    },
  },
  methods: {
    reloadSearch() {
      this.$refs.posts.requestParams = { search: this.wd }
      this.$refs.posts.posts = []
      this.$refs.posts.styleData = []
      this.$refs.posts.getPosts()
    },
  },
  watch: {
    wd() {
      this.reloadSearch()
    },
  },
}
</script>

<style scoped>
</style>
