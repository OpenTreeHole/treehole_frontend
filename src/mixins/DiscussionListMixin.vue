<script lang='ts'>
import debounce from 'lodash.debounce'
import { Component, Watch } from 'vue-property-decorator'
import { WrappedHole } from '@/components/Discussion/hole'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { ArrayRequest, CollectionHoleListRequest, HomeHoleListRequest } from '@/api'

@Component
export default class DiscussionListMixin extends BaseComponentOrView {
  // 帖子列表
  public discussions: Array<WrappedHole> = []
  public startTime: Date = new Date()

  public debouncedCalculateLines: Function
  public lineHeight: number = 10

  public request: ArrayRequest<WrappedHole>

  public pauseLoading = true

  /**
   * Clear the hole list and reload.
   */
  public refresh (): void {
    this.request.clear()
    this.getHoles()
  }

  /**
   * Calculate the number of the total lines of the display (i.e. the first floor) of each hole.
   */
  public calculateLines (): void {
    for (let i = 0; i < this.discussions.length; i++) {
      const element = document.getElementById('p' + i)
      const totalHeight = element ? element.scrollHeight : 0
      this.discussions[i].styleData.lines = totalHeight / this.lineHeight
    }
  }

  public async getHoles (): Promise<boolean> {
    let hasNext = false
    await this.request.request().then((v) => {
      hasNext = v
    }).catch((error) => {
      if (error.response === undefined) this.messageError(JSON.stringify(error))
      else this.messageError(error.response.data.msg)
    })
    return hasNext
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
    if (this.$route.name === 'home') {
      this.request = new HomeHoleListRequest()
    } else if (this.$route.name === 'collections') {
      this.request = new CollectionHoleListRequest()
    }
    this.discussions = this.request.datas
    this.getHoles().then(() => {
      this.pauseLoading = false
    })
  }
}
</script>
