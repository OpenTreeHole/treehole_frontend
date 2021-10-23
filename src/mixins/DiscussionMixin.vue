<script lang='ts'>
import marked from 'marked'
import { Component, Ref } from 'vue-property-decorator'
import Loading from '@/components/Loading.vue'
import Editor from '@/components/Editor.vue'
import { DetailedFloor, Floor, WrappedHole } from '@/components/Discussion/hole'
import { camelizeKeys } from '@/utils'
import Mention from '@/components/Discussion/Mention.vue'
import vuetify from '@/plugins/vuetify'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { ArrayRequest } from '@/api'

@Component
export default class DiscussionMixin extends BaseComponentOrView {
  // 帖子列表
  public hole: WrappedHole
  public floors: Array<Floor> = []
  public loadedLength: number = 0
  // 回复信息（可选回复）
  public replyFloor: Floor | null = null
  // 发帖表单
  public dialog = false
  // content: '',
  public requiredRules = [(v: any) => !!v || '内容不能为空']
  public valid = true

  public request: ArrayRequest<Floor>

  @Ref() readonly form!: HTMLFormElement
  @Ref() readonly editor!: Editor
  @Ref() readonly loading!: Loading

  get computedDiscussionId (): number {
    return -1
  }

  public editorError (msg: string): void {
    this.messageError(msg)
  }

  public closeDialog (): void {
    this.dialog = false
    this.replyFloor = null
  }

  /**
   * Get the index of a floor in the current hole by its floor id.
   *
   * @param floorId - the floor id.
   * @returns the index, or -1 if the floor doesn't exist in the current hole.
   */
  public getIndex (floorId: number): number {
    for (let i = 0; i < this.floors.length; i++) {
      if (this.floors[i].floorId === floorId) {
        return i
      }
    }
    return -1
  }

  public scrollTo (currentId: number, toId: number): void {
    const currentOffsetTop = document.getElementById(currentId.toString())?.offsetTop
    const toOffsetTop = document.getElementById(toId.toString())?.offsetTop
    const scrollDistance = currentOffsetTop && toOffsetTop ? toOffsetTop - currentOffsetTop : 0
    window.scrollBy({
      top: scrollDistance, //  正值向下
      left: 0,
      behavior: 'smooth'
    })
  }

  /**
   * Set the reply target and open the reply dialog.
   *
   * @param floorId - the id of the floor to reply
   */
  public reply (floorId: number): void {
    this.replyFloor = this.floors[this.getIndex(floorId)]
    this.dialog = true
  }

  /**
   * Get the hole object by hole id from the backend.
   * <p> the hole object contains only brief information of the prefetched floors.
   *
   * @param holeId - the hole id
   */
  public getDiscussion (holeId: number): void {
    this.$axios
      .get('/holes/' + holeId)
      .then((response) => {
        if (response.data) {
          this.hole = new WrappedHole(camelizeKeys(response.data))
          this.floors = this.hole.floors
        }
      })
      .catch((error) => {
        if (error.response === undefined) this.messageError(JSON.stringify(error))
        else this.messageError(error.response.data.msg)
      })
  }

  /**
   * Replace mention tags with empty divs with 'replyDiv' class and the mention id.
   *
   * @param str - the original string
   */
  public mentioned (str: string): string {
    console.log(str)
    str = str.replace(/#\w+/g, (v) => '\n\n<p mention="' + v + '"></p>\n\n')
    str = marked(str)
    str = str.replace(/<p mention="#\w+"><\/p>/g, (str) => {
      return str.replace('<p', '<div class="replyDiv"').replace('/p>', '/div>')
    })
    return str
  }

  /**
   * Get floors from backend.
   */
  public getPosts (): void {
    this.request.request().then(() => {
      this.floors.forEach((floor) => {
        if (!('mention' in floor) || (floor as DetailedFloor).mention.length === 0) return
        setTimeout(() => this.renderMention(floor as DetailedFloor), 100)
      })
    }).catch((error) => {
      if (error.response === undefined) this.messageError(JSON.stringify(error))
      else this.messageError(error.response.data.msg)
    })
  }

  // Create a new floor.
  public addFloor (): void {
    if (this.form.validate() && this.editor.validate()) {
      this.dialog = false
      this.$axios
        .post('/floors', {
          content: (this.replyFloor ? '#' + this.replyFloor.floorId + ' ' : '') + this.editor.getContent(),
          hole_id: this.computedDiscussionId,
          mention: [this.replyFloor?.floorId]
        })
        .then(() => {
          this.loading.isLoading = true
          this.getPosts()
          this.replyFloor = null // Clear the reply info.
          this.editor.setContent('') // Clear the reply editor.
        })
        .catch((error) => {
          console.log(error.response)
          this.messageError(error.response.data.msg)
        })
    }
  }

  /**
   * Send a report.
   *
   * @param floorId - the id of the floor being reported.
   */
  public report (floorId: number): void {
    const msg = prompt('输入举报理由')
    if (msg === '') {
      this.messageError('举报理由不能为空！')
    }
    this.$axios
      .post('/reports', {
        floor_id: floorId,
        reason: msg
      })
      .then((response) => {
        if (response.status === 200) {
          this.messageSuccess('举报成功')
        } else {
          this.messageError(response.data.msg)
        }
      })
  }

  get contentName (): string {
    return 'discussion-' + this.computedDiscussionId + '-content'
  }

  /**
   * Render the empty divs with 'replyDiv' class and 'mention' attr with the specific floor.
   * <p> This method should be called after the original divs being rendered. </p>
   *
   * @param curFloor - the current floor (waiting the mention part in it to be re-rendered).
   */
  public renderMention (curFloor: DetailedFloor): void {
    const curIndex = this.getIndex(curFloor.floorId)
    const elements = document.querySelectorAll('div[index="' + curIndex + '"] > div.replyDiv')
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].innerHTML) continue
      const mentionAttr = elements[i].getAttribute('mention')
      if (!mentionAttr) continue
      const mentionId = parseInt(mentionAttr.substring(1))
      let mentionFloor: Floor | null = null
      curFloor.mention.forEach((mFloor) => {
        if (mFloor.floorId === mentionId) mentionFloor = mFloor
      })
      if (!mentionFloor) continue
      let gotoMentionFloor: Function | undefined
      const mentionIndex = this.getIndex(mentionId)
      if (mentionIndex !== -1) {
        gotoMentionFloor = () => {
          this.scrollTo(curIndex, mentionIndex)
        }
      }
      new Mention({
        propsData: {
          mentionFloor: mentionFloor,
          gotoMentionFloor: gotoMentionFloor,
          mentionFloorInfo: (mentionIndex === -1 ? ('#' + (mentionFloor as Floor).floorId) : (mentionIndex.toString() + 'L'))
        },
        vuetify
      }).$mount(elements[i])
    }
  }
}
</script>
