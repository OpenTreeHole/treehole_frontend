<template>
  <v-container class="search">
    <v-card>
      <v-card-title>搜索：{{ wd }}</v-card-title>
    </v-card>
    <PostList api="posts/" :requestParams="{ search: this.wd }"></PostList>
  </v-container>
</template>

<script>
import PostList from '@/components/PostList.vue'

export default {
  name: 'Search',
  components: { PostList },
  data() {
    return {
      wd: this.$route.query.wd,
    }
  },
}
</script>

<style scoped>
</style>
