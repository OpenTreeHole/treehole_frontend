<script lang='ts'>
import { Component, Ref } from 'vue-property-decorator'
import Loading from '@/components/Loading.vue'
import Editor from '@/components/Editor.vue'
import { Floor, WrappedHole } from '@/api/hole'
import { camelizeKeys } from '@/utils'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { PrefetchedArrayRequest } from '@/api'

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

  public request: PrefetchedArrayRequest<Floor>

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
  public async getDiscussion (holeId: number) {
    try {
      const response = await this.$axios.get('/holes/' + holeId)
      if (response.data) {
        this.hole = new WrappedHole(camelizeKeys(response.data))
      }
    } catch (error) {
      if (error.response === undefined) this.messageError(JSON.stringify(error))
      else this.messageError(error.response.data.msg)
    }
  }

  public changeCollectionStatus (): void {
    if (this.hole.isStarred) {
      this.$axios.delete('/user/favorites', {
        data: {
          hole_id: this.hole.hole.holeId
        }
      }).then((response) => {
        this.messageSuccess(response.data.message)
        this.$user.collection.setCollection(response.data.data)
      }).catch((error) => {
        this.messageError(error.response.data.msg)
        this.hole.isStarred = !this.hole.isStarred
      })
    } else {
      this.$axios.post('/user/favorites', {
        hole_id: this.hole.hole.holeId
      }).then((response) => {
        this.messageSuccess(response.data.message)
        this.$user.collection.setCollection(response.data.data)
      }).catch((error) => {
        this.messageError(error.response.data.msg)
        this.hole.isStarred = !this.hole.isStarred
      })
    }
    this.hole.isStarred = !this.hole.isStarred
  }

  /**
   * Get floors from backend.
   */
  public async getFloors (): Promise<boolean> {
    if (!this.request) return false
    let hasNext = false
    await this.request.request().then((v) => {
      // this.floors.forEach((floor) => {
      //   if (!('mention' in floor) || (floor as DetailedFloor).mention.length === 0) return
      //   console.log(floor)
      //   setTimeout(() => this.renderMention(floor as DetailedFloor), 100)
      // })
      hasNext = v
    }).catch((error) => {
      if (error.response === undefined) this.messageError(JSON.stringify(error))
      else this.messageError(error.response.data.msg)
    })
    return hasNext
  }

  // Create a new floor.
  public addFloor (): void {
    if (this.form.validate() && this.editor.validate()) {
      this.dialog = false
      this.$axios
        .post('/floors', {
          content: (this.replyFloor ? '#' + this.replyFloor.floorId + ' ' : '') + this.editor.getContent(),
          hole_id: this.computedDiscussionId,
          mention: this.replyFloor ? [this.replyFloor.floorId] : []
        })
        .then(() => {
          this.loading.isLoading = true
          this.getFloors()
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
}
</script>
