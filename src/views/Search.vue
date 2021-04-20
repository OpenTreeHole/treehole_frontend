<template>
  <v-container class="search"> Searched: {{ wd }} </v-container>
</template>

<script>
export default {
  name: 'Search',
  data() {
    return {
      wd: this.$route.query.wd,
    }
  },
}
</script>

<style scoped>
</style>