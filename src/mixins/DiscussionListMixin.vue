<script lang='ts'>
import debounce from 'lodash.debounce'
import { Component, Ref, Watch } from 'vue-property-decorator'
import { MarkedDetailedFloor, MarkedFloor, WrappedHole } from '@/api/hole'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import {
  CollectionHoleListRequest,
  DivisionHoleListRequest,
  HoleListRequest,
  HomeHoleListRequest
} from '@/api'
import Loading from '@/components/Loading.vue'
import { EventBus } from '@/event-bus'

@Component
export default class DiscussionListMixin extends BaseComponentOrView {
  // 帖子列表
  public discussions: Array<WrappedHole> = []
  public startTime: Date = new Date()

  public collectionIds: Array<number> = []

  public debouncedCalculateLines: Function
  public lineHeight: number = 10

  public request: HoleListRequest

  public pauseLoading = true

  public route: string

  @Ref() loading: Loading

  /**
   * Clear the hole list and reload.
   */
  public refresh (): void {
    this.request.clear()
    this.discussions = this.request.datas
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
      console.log(error)
      if (error.response === undefined) this.messageError(JSON.stringify(error))
      else this.messageError(error.response.data.msg)
    })
    return hasNext
  }

  public onGotoMentionFloor (curFloor: MarkedDetailedFloor, mentionFloor: MarkedFloor) {
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
    window.addEventListener('resize', () => { this.debouncedCalculateLines() })
    EventBus.$on('goto-mention-floor', this.onGotoMentionFloor)

    const sLoading = this.loading
    this.getHoles().then((v) => {
      this.pauseLoading = false
      sLoading.hasNext = v
    })
  }

  destroyed () {
    this.$user.collection.unregisterUpdateHoleArray(this.$route.name as string)
    EventBus.$off('goto-mention-floor', this.onGotoMentionFloor)
  }

  created () {
    this.route = this.$route.name as string
    this.$user.collection.getCollections()
    this.debouncedCalculateLines = debounce(this.calculateLines, 300)
    if (this.route === 'home') {
      this.request = new HomeHoleListRequest()
    } else if (this.route === 'collections') {
      this.request = new CollectionHoleListRequest()
    } else if (this.route === 'division') {
      this.request = new DivisionHoleListRequest(parseInt(this.$route.params.id))
    }
    this.discussions = this.request.datas
    this.$user.collection.registerUpdateHoleArray(this.route, this.discussions)
  }
}
</script>
