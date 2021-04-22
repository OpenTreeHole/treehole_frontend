<template>
  <v-container>
    <v-row
      v-for="(discussion, index) in discussions"
      :key="index"
      justify="center"
      class="ma-0"
    >
      <v-col cols="12" sm="10" md="8" lg="6" xl="4"
        ><Postcard :discussion="discussion" :index="index"></Postcard
      ></v-col>
    </v-row>
    <!-- 载入中信息 -->
    <loading :length="discussions.length" :loadList="getDiscussions"></loading>
  </v-container>
</template>

<script>
import debounce from 'lodash.debounce'

import Loading from '@/components/Loading.vue'
import Postcard from '@/components/DiscussionCard.vue'

export default {
  name: 'postslist',
  components: { Postcard, Loading },
  props: {
    api: '',
  },
  data() {
    return {
      // 帖子列表
      discussions: [],
      page: 1,
      // 展开折叠样式数据
      styleData: [],
    }
  },
  methods: {
    calcuteLines() {
      for (let i = 0; i < this.styleData.length; i++) {
        const element = document.getElementById('p' + i)
        const totalHeight = element.scrollHeight
        this.styleData[i].lines = totalHeight / this.lineHeight
      }
    },
    getDiscussions() {
      return this.$axios
        .get(this.api, { params: { page: this.page } })
        .then((response) => {
          for (let i = 0; i < response.data.length; i++) {
            this.styleData.push({ fold: true, lines: 3 })
          }
          this.discussions.push.apply(this.discussions, response.data)
          if (response.data.length > 0) {
            this.page++
          }
        })
        .catch((error) => {
          this.$refs.message.error(error.response.data.msg)
        })
    },
  },
  watch: {
    discussions: function () {
      setTimeout(() => {
        const element = document.getElementById('p1')
        this.lineHeight = parseInt(
          window.getComputedStyle(element, null).getPropertyValue('line-height')
        )
        this.calcuteLines()
      }, 100)
    },
  },
  mounted() {
    window.onresize = () => {
      this.debouncedCalculateLines()
    }
  },
  created() {
    this.debouncedCalculateLines = debounce(this.calcuteLines, 300)
    // this.getTags()
  },
}
</script>
