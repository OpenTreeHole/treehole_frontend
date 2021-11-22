<script lang='ts'>
import { Component, Prop, Ref } from 'vue-property-decorator'
import Loading from '@/components/Loading.vue'
import Editor from '@/components/Editor.vue'
import { MarkedDetailedFloor, MarkedFloor, WrappedHole } from '@/api/hole'
import { camelizeKeys, scrollTo } from '@/utils'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { FloorListRequest } from '@/api'

@Component
export default class FloorListMixin extends BaseComponentOrView {
  // 帖子列表
  public hole: WrappedHole
  public floors: Array<MarkedFloor> = []
  public loadedLength: number = 0
  // 回复信息（可选回复）
  public replyFloor: MarkedFloor | null = null
  // 发帖表单
  public dialog = false
  /**
   * 本次dialog的操作
   * 'add': 新增回帖
   * 'reply': 回复某帖
   * 'edit': 修改回帖
   */
  public operation = 'add'
  public editingFloorId: number = 0
  // content: '',
  public requiredRules = [(v: any) => !!v || '内容不能为空']
  public valid = true

  public request: FloorListRequest

  @Prop({ type: Number, default: -1 }) displayFloorId: number

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
    this.operation = 'add'
  }

  /**
   * Clear the floor list and reload.
   */
  public refresh (): void {
    this.request.clear()
    this.floors = this.request.datas
    this.loading.hasNext = true
    this.loading.load()
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
    this.operation = 'reply'
    this.dialog = true
  }

  public edit (floorId: number): void {
    const curFloor = this.floors[this.getIndex(floorId)]
    if (curFloor instanceof MarkedDetailedFloor && curFloor.mention[0]) {
      this.replyFloor = new MarkedFloor(curFloor.mention[0])
    }
    this.operation = 'edit'
    this.editingFloorId = floorId
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
      hasNext = v
    }).catch((error) => {
      if (error.response === undefined) this.messageError(JSON.stringify(error))
      else this.messageError(error.response.data.msg)
    })
    return hasNext
  }

  /**
   * Create a new floor.
   */
  public addFloor (): void {
    if (this.form.validate() && this.editor.validate()) {
      this.dialog = false
      const sLoading = this.loading
      const sEditor = this.editor
      const content = (this.replyFloor ? '#' + this.replyFloor.floorId + '\n\n' : '') + this.editor.getContent()
      const mention: number[] = []
      content.replace(/(^|\s)#(\w+)/g, (original, ignore, v) => {
        mention.push(parseInt(v))
        return original
      })
      this.$axios
        .post('/floors', {
          content: content,
          hole_id: this.computedDiscussionId,
          mention: mention
        })
        .then((response) => {
          this.messageSuccess(response.data.message)
          sLoading.continueLoad()
          this.replyFloor = null // Clear the reply info.
          sEditor.setContent('') // Clear the reply editor.
        })
        .catch((error) => {
          console.log(error)
          this.messageError(error)
        })
    }
  }

  /**
   * Edit a floor.
   */
  public editFloor (): void {
    if (this.form.validate() && this.editor.validate()) {
      this.dialog = false
      const sEditor = this.editor
      const content = (this.replyFloor ? '#' + this.replyFloor.floorId + '\n\n' : '') + this.editor.getContent()
      const mention: number[] = []
      content.replace(/(^|\s)#(\w+)/g, (original, ignore, v) => {
        mention.push(parseInt(v))
        return original
      })
      this.$axios
        .put(`/floors/${this.editingFloorId}`, {
          content: content,
          mention: mention
        })
        .then(() => {
          this.messageSuccess('修改成功')
          this.refresh()
          this.replyFloor = null // Clear the reply info.
          sEditor.setContent('') // Clear the reply editor.
        })
        .catch((error) => {
          console.log(error)
          this.messageError(error)
        })
    }
  }

  mounted () {
    if (this.displayFloorId !== -1) {
      scrollTo(0, this.getIndex(this.displayFloorId))
    }
  }

  get contentName (): string {
    return 'discussion-' + this.computedDiscussionId + '-content'
  }
}
</script>
