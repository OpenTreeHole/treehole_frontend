<template>
  <v-container class="search">
    <v-card>
      <v-card-title>搜索：{{ wd }}</v-card-title>
      <v-list> </v-list>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'Search',
  data() {
    return {
      wd: this.$route.query.wd,
      posts: [
        {
          id: String(),
          content: String(),
          username: String(),
          reply_to: String(),
          date_created: String(),
          discussion: String(),
        },
      ],
    }
  },
}
</script>

<style scoped>
</style>
