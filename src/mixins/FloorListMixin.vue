<script lang='ts'>
import { Component, Prop, Ref } from 'vue-property-decorator'
import Loading from '@/components/Loading.vue'
import Editor from '@/components/Editor.vue'
import { WrappedHole } from '@/models/hole'
import { camelizeKeys } from '@/utils/utils'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { FloorListRequest } from '@/api'
import Vue from 'vue'
import UserStore from '@/store/modules/UserStore'
import { renderFloor } from '@/utils/floor'
import { MarkedDetailedFloor, MarkedFloor } from '@/models/floor'

@Component
export default class FloorListMixin extends BaseComponentOrView {
  // 帖子列表
  public hole: WrappedHole
  public floors: Array<MarkedFloor> = []
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
    this.loading.continueLoad()
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

  public removeReplyFloor () {
    this.replyFloor = null
  }

  /**
   * Get the hole object by hole id from the backend.
   * <p> the hole object contains only brief information of the prefetched floors.
   *
   * @param holeId - the hole id
   */
  public async getHole (holeId: number) {
    try {
      const response = await this.$axios.get('/holes/' + holeId)
      if (response.data) {
        this.hole = new WrappedHole(camelizeKeys(response.data))
      }
    } catch (error) {
      if (error.response === undefined) this.messageError(JSON.stringify(error))
      else this.messageError(error.response.data.message)
    }
  }

  public async changeCollectionStatus () {
    this.hole.isStarred = !this.hole.isStarred
    try {
      let response
      if (this.hole.isStarred) {
        response = await this.$axios.delete('/user/favorites', {
          data: {
            hole_id: this.hole.holeId
          }
        })
      } else {
        response = await this.$axios.post('/user/favorites', {
          hole_id: this.hole.holeId
        })
      }
      this.messageSuccess(response.data.message)
      UserStore.collection.setCollection(response.data.data)
    } catch (error) {
      this.messageError(error.response.data.message)
      this.hole.isStarred = !this.hole.isStarred
    }
  }

  /**
   * Get floors from backend.
   */
  public async getFloors (): Promise<boolean> {
    if (!this.request) return false
    let hasNext = false
    try {
      hasNext = await this.request.request()
    } catch (error) {
      if (error.response === undefined) this.messageError(JSON.stringify(error))
      else this.messageError(error.response.data.message)
    }
    return hasNext
  }

  /**
   * Create a new floor.
   */
  public async addFloor () {
    if (this.form.validate() && this.editor.validate()) {
      this.dialog = false
      const sLoading = this.loading
      const sEditor = this.editor
      const content = (this.replyFloor ? '##' + this.replyFloor.floorId + '\n\n' : '') + this.editor.getContent()
      try {
        const response = await this.$axios
          .post('/floors', {
            content: content,
            hole_id: this.computedDiscussionId
          })
        this.messageSuccess(response.data.message)
        sLoading.continueLoad()
        this.replyFloor = null // Clear the reply info.
        sEditor.setContent('') // Clear the reply editor.
      } catch (error) {
        console.log(error)
        this.messageError(error)
      }
    }
  }

  /**
   * Edit a floor.
   */
  public async editFloor () {
    if (this.form.validate() && this.editor.validate()) {
      this.dialog = false
      const sEditor = this.editor
      const content = (this.replyFloor ? '##' + this.replyFloor.floorId + '\n\n' : '') + this.editor.getContent()

      try {
        const response = await this.$axios
          .put(`/floors/${this.editingFloorId}`, {
            content: content
          })
        this.messageSuccess('修改成功')
        const floor: MarkedDetailedFloor = new MarkedDetailedFloor(camelizeKeys(response.data))
        this.renderFloor(floor).then()
        this.checkAndRerenderFloors(floor)
        Vue.set(this.floors, this.getIndex(floor.floorId), floor)
        this.replyFloor = null // Clear the reply info.
        sEditor.setContent('') // Clear the reply editor.
      } catch (error) {
        console.log(error)
        this.messageError(error)
      }
    }
  }

  public checkAndRerenderFloors (mentionFloor: MarkedFloor) {
    this.floors.forEach((floor, index) => {
      if (floor instanceof MarkedDetailedFloor && floor.mention.length !== 0) {
        let flag = false
        for (let i = 0; i < floor.mention.length; i++) {
          if (floor.mention[i].floorId === mentionFloor.floorId) {
            floor.mention[i] = mentionFloor
            flag = true
          }
        }
        if (flag) {
          floor.html += ' '
          this.renderFloor(floor)
          Vue.set(this.floors, index, floor)
        }
      }
    })
  }

  async renderFloor (curFloor: MarkedDetailedFloor) {
    await renderFloor(curFloor, this)
  }

  get contentName (): string {
    return 'discussion-' + this.computedDiscussionId + '-content'
  }
}
</script>
