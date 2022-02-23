<template>
  <v-dialog v-model='dialog' persistent :max-width='dialogWidth'>
    <!-- 浮动按钮 -->
    <template #activator='{ on, attrs }'>
      <slot name='activator' v-bind='{on,attrs}' />
    </template>

    <v-card>
      <v-card-title>
        <span class='headline'>{{ this.operation==='add' ? '发表回复' : '修改回复'}}</span>
      </v-card-title>

      <v-card-text>
        <!-- 回复内容 -->
        <mention-card v-if='!replyCancelled && replyFloor' :mention-floor='replyFloor' :cancel='()=>{replyCancelled=true}' />

        <v-form ref='form' v-model='valid' lazy-validation>
          <!-- 回贴表单 -->

          <!-- 富文本输入框 -->
          <app-editor
            ref='editor'
            :contentName='contentName'
            @error='messageError'
          />
        </v-form>
      </v-card-text>

      <!-- 下方按钮 -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color='primary' text @click='closeDialog'>关闭</v-btn>
        <v-btn v-if='operation === "reply" || operation === "add"' color='primary' text :disabled='!valid' @click='addFloor'>
          发送
        </v-btn>
        <v-btn v-else-if='operation === "edit"' color='primary' text :disabled='!valid' @click='editFloor'>
          修改
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang='ts'>
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Component, Prop, Ref } from 'vue-property-decorator'
import MentionCard from '@/components/card/MentionCard.vue'
import AppEditor from '@/components/app/AppEditor.vue'
import { DetailedFloor, Floor } from '@/models/floor'
import { camelizeKeys } from '@/utils/utils'
import { dialogWidth } from '@/utils/style'

@Component({
  components: {
    MentionCard,
    AppEditor
  }
})
export default class CreateFloorDialog extends BaseComponentOrView {
  @Prop({ required: false }) replyFloor: Floor
  @Prop({ required: false }) holeId: number
  @Prop({ required: false }) floorId: number
  @Prop({ required: false, type: String, default: 'add' }) operation: string

  @Ref() readonly editor: AppEditor
  @Ref() readonly form: HTMLFormElement

  public valid = true
  public dialog = false
  public replyCancelled = false

  get dialogWidth () {
    return dialogWidth()
  }

  public closeDialog (): void {
    this.dialog = false
    this.valid = true
  }

  /**
   * Create a new floor.
   */
  public async addFloor () {
    if (this.form.validate() && this.editor.validate()) {
      this.dialog = false
      const content = (!this.replyCancelled && this.replyFloor ? '##' + this.replyFloor.floorId + '\n\n' : '') + this.editor.getContent()

      const response = await this.$axios
        .post('/floors', {
          content: content,
          hole_id: this.holeId
        })
      this.messageSuccess(response.data.message)
      this.editor.setContent('') // Clear the reply editor.
      this.$emit('continue-load')
    }
  }

  /**
   * Edit a floor.
   */
  public async editFloor () {
    if (this.form.validate() && this.editor.validate()) {
      this.dialog = false
      const content = (!this.replyCancelled && this.replyFloor ? '##' + this.replyFloor.floorId + '\n\n' : '') + this.editor.getContent()

      const response = await this.$axios
        .put(`/floors/${this.floorId}`, {
          content: content
        })
      this.messageSuccess('修改成功')
      const floor: DetailedFloor = new DetailedFloor(camelizeKeys(response.data))

      this.editor.setContent('') // Clear the reply editor.
      this.$emit('update-floor', floor)
    }
  }

  get contentName (): string {
    return `${this.operation}-${this.operation === 'add' ? this.holeId : this.floorId}`
  }
}
</script>

<style lang='scss' scoped>

</style>
