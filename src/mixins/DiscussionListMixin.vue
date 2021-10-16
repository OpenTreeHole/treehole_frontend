<script lang='ts'>
import debounce from 'lodash.debounce'
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'

@Component
export default class DiscussionListMixin extends Vue {
  @Prop({ required: true, type: String }) readonly api: string

  // 帖子列表
  public discussions = []
  public page = 1
  // 展开折叠样式数据
  public styleData: Array<{
    fold: boolean
    lines: number
  }> = []

  public order = ''
  public tagName = null
  public debouncedCalculateLines: Function
  lineHeight: number = 10

  public refresh (): void {
    // 刷新列表
    this.discussions = []
    this.page = 1
    this.getDiscussions()
  }

  public addTag (tag: { color: string, count: number, name: string }): void {
    if (this.$route.name === 'home') {
      this.$emit('add-tag', tag)
    }
  }

  public calculateLines (): void {
    for (let i = 0; i < this.styleData.length; i++) {
      const element = document.getElementById('p' + i)
      const totalHeight = element ? element.scrollHeight : 0
      this.styleData[i].lines = totalHeight / this.lineHeight
    }
  }

  public getDiscussions () {
    const marked = this.$marked
    return this.$axios
      .get(this.api, {
        params: {
          page: this.page,
          order: this.order,
          tag_name: this.tagName
        }
      })
      .then((response) => {
        for (let i = 0; i < response.data.length; i++) {
          this.styleData.push({
            fold: true,
            lines: 3
          })
        }
        response.data.forEach(function (discussionItem: any) {
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
        if (error.response.data) this.$store.dispatch('messageError', error.response.data.msg)
      })
  }

  public changeFoldStatus (e: { index: number, fold: boolean }) {
    this.styleData[e.index].fold = e.fold
  }

  @Watch('discussions')
  discussionsChanged () {
    setTimeout(() => {
      const element = document.getElementById('p1')
      this.lineHeight = (element ? parseInt(
        window.getComputedStyle(element, null).getPropertyValue('line-height')
      ) : 10)
      this.calculateLines()
    }, 100)
  }

  mounted () {
    window.onresize = () => {
      this.debouncedCalculateLines()
    }
  }

  created () {
    this.debouncedCalculateLines = debounce(this.calculateLines, 300)
  }
}
</script>
