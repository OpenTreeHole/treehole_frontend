<script lang='ts'>
import debounce from 'lodash.debounce'
import { camelizeKeys } from '@/utils'
import { Component, Watch } from 'vue-property-decorator'
import { WrappedHole } from '@/components/Discussion/hole'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'

@Component
export default class DiscussionListMixin extends BaseComponentOrView {
  // 帖子列表
  public discussions: Array<WrappedHole> = []
  public startTime: Date = new Date()

  public tagName = null
  public debouncedCalculateLines: Function
  lineHeight: number = 10

  /**
   * Clear the hole list and reload.
   */
  public refresh (): void {
    this.discussions = []
    this.startTime = new Date()
    this.getDiscussions()
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

  public getDiscussions () {
    return this.$axios
      .get('holes', {
        params: {
          start_time: this.startTime.toISOString(),
          length: 10,
          prefetch_length: 8,
          division_id: 1
        }
      })
      .then((response) => {
        response.data.forEach((holeItem: any) => {
          if (!holeItem.floors.first_floor || !holeItem.floors.last_floor || holeItem.reply < 0) return
          const hole = new WrappedHole(camelizeKeys(holeItem))
          this.discussions.push(hole)
        })
        this.startTime = new Date(this.discussions[this.discussions.length - 1].hole.timeUpdated)
      })
      .catch((error) => {
        if (error.response === undefined) this.messageError('data: ' + JSON.stringify(error))
        else if (error.response.data) this.messageError(error.response.data.msg)
      })
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
