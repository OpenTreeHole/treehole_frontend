<template>
  <v-container>
    <v-row
      v-for='(post, index) in posts'
      :key='index'
      justify='center'
      class='ma-0'
    >
      <v-col cols='12' sm='10' md='8' lg='6' xl='4'
      >
        <PostCard :post='post' :index='index' :post-list='instance'></PostCard
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
import debounce from 'lodash.debounce'

import PostCard from '@/components/PostCard.vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'

@Component({
  components: { PostCard }
})
export default class PostList extends BaseComponentOrView {
  @Prop({ required: true, type: String }) api: string
  @Prop(Object) requestParams: { search: string }
  // 回复列表
  public posts: Array<any> = []
  // 展开折叠样式数据
  public styleData: Array<any> = []
  public debouncedCalculateLines: Function
  public lineHeight: number
  public instance = this

  public calculateLines (): void {
    for (let i = 0; i < this.styleData.length; i++) {
      const element = document.getElementById('p' + i)
      const totalHeight = element ? element.scrollHeight : 0
      this.styleData[i].lines = totalHeight / this.lineHeight
    }
  }

  public getPosts (): void {
    this.$axios
      .get(this.api, { params: this.requestParams })
      .then((response) => {
        for (let i = 0; i < response.data.length; i++) {
          this.styleData.push({
            fold: true,
            lines: 3
          })
        }
        this.posts.push.apply(this.posts, response.data)
      })
      .catch((error) => {
        this.messageError(error.response.data.msg)
      })
  }

  @Watch('posts')
  postsChanged () {
    setTimeout(() => {
      const element = document.getElementById('p1')
      if (!element) return
      this.lineHeight = parseInt(
        window.getComputedStyle(element, null).getPropertyValue('line-height')
      )
      this.calculateLines()
    }, 100)
  }

  mounted () {
    window.onresize = () => {
      this.debouncedCalculateLines()
    }
  }

  created () {
    this.getPosts()
    this.debouncedCalculateLines = debounce(this.calculateLines, 300)
  }
}
</script>
