<script>
import debounce from 'lodash.debounce'
import Vue from 'vue'

export default {
  props: {
    api: null,
    discussionComponent: Vue
  },
  data () {
    return {
      // 帖子列表
      discussions: [],
      page: 1,
      // 展开折叠样式数据
      styleData: [],
      order: '',
      tag_name: null
    }
  },
  methods: {
    refresh () {
      // 刷新列表
      this.discussions = []
      this.page = 1
      this.getDiscussions()
    },
    addTag (tag) {
      if (this.$route.name === 'home') {
        this.discussionComponent.$parent.addTag(tag)
      }
    },
    calculateLines () {
      for (let i = 0; i < this.styleData.length; i++) {
        const element = document.getElementById('p' + i)
        const totalHeight = element.scrollHeight
        this.styleData[i].lines = totalHeight / this.lineHeight
      }
    },
    getDiscussions () {
      const marked = this.$marked
      return this.$axios
        .get(this.api, {
          params: {
            page: this.page,
            order: this.order,
            tag_name: this.tag_name
          }
        })
        .then((response) => {
          for (let i = 0; i < response.data.length; i++) {
            this.styleData.push({
              fold: true,
              lines: 3
            })
          }
          response.data.forEach(function (discussionItem) {
            discussionItem.first_post.content = marked(
              discussionItem.first_post.content
            )
            discussionItem.last_post.content = marked(
              discussionItem.last_post.content
            )
          })
          this.discussions.push.apply(this.discussions, response.data)

          if (response.data.length > 0) {
            this.page++
          }
        })
        .catch((error) => {
          this.$store.dispatch('messageError', error.response.data.msg)
        })
    }
  },
  watch: {
    discussions () {
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
    this.debouncedCalculateLines = debounce(this.calculateLines, 300)
    // this.getTags()
  }
}
</script>
