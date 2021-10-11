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
        <PostCard :post='post' :index='index'></PostCard
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import debounce from 'lodash.debounce'

import PostCard from '@/components/PostCard'

export default {
  name: 'PostList',
  components: { PostCard },
  props: {
    api: null,
    requestParams: { search: '' }
  },
  data () {
    return {
      // 回复列表
      posts: [],
      // 展开折叠样式数据
      styleData: []
    }
  },
  methods: {
    calculateLines () {
      for (let i = 0; i < this.styleData.length; i++) {
        const element = document.getElementById('p' + i)
        const totalHeight = element.scrollHeight
        this.styleData[i].lines = totalHeight / this.lineHeight
      }
    },
    getPosts () {
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
          this.$store.dispatch('messageError', error.response.data.msg)
        })
    }
  },
  watch: {
    posts: function () {
      setTimeout(() => {
        const element = document.getElementById('p1')
        this.lineHeight = parseInt(
          window.getComputedStyle(element, null).getPropertyValue('line-height')
        )
        this.calculateLines()
      }, 100)
    }
  },
  mounted () {
    window.onresize = () => {
      this.debouncedCalculateLines()
    }
  },
  created () {
    this.getPosts()
    this.debouncedCalculateLines = debounce(this.calculateLines, 300)
  }
}
</script>
