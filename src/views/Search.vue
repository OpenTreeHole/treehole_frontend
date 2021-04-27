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
}
</script>
