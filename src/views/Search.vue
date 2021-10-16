<template>
  <v-container class='search'>
    <v-card>
      <v-card-title>搜索：{{ this.$route.query.wd }}</v-card-title>
    </v-card>
    <PostList
      ref='posts'
      api='posts/'
      :requestParams='{ search: this.$route.query.wd }'
    ></PostList>
  </v-container>
</template>

<script lang='ts'>
import PostList from '@/components/PostList.vue'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: { PostList }
})
export default class Search extends Vue {
}
</script>
