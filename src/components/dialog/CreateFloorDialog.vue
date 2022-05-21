<template>
  <v-dialog
    v-model="dialog"
    persistent
    :max-width="dialogWidth"
  >
    <template #activator="{ on, attrs }">
      <slot
        name="activator"
        v-bind="{ on, attrs }"
      />
    </template>

    <v-card>
      <v-card-title>
        <span class="headline">{{ this.operation === 'add' ? '发表回复' : '修改回复' }}</span>
      </v-card-title>

      <v-card-text>
        <mention-card
          v-if="!replyCancelled && replyFloor"
          :mention-floor="replyFloor"
          :cancel="
            () => {
              replyCancelled = true
            }
          "
        />

        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <app-editor
            ref="editor"
            :contentName="contentName"
            @error="messageError"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="closeDialog"
          >关闭</v-btn
        >
        <v-btn
          v-if="operation === 'reply' || operation === 'add'"
          color="primary"
          text
          :disabled="!valid"
          @click="addFloor"
        >
          发送
        </v-btn>
        <v-btn
          v-else-if="operation === 'edit'"
          color="primary"
          text
          :disabled="!valid"
          @click="editFloor"
        >
          修改
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Component, ModelSync, Prop, Ref } from 'vue-property-decorator'
import MentionCard from '@/components/card/MentionCard.vue'
import AppEditor from '@/components/app/AppEditor.vue'
import { DetailedFloor, Floor } from '@/models/floor'
import { dialogWidth } from '@/utils/style'
import { addFloor, modifyFloor } from '@/apis'

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

  @ModelSync('dialogProp', 'change', { type: Boolean, default: false }) dialog: boolean

  valid = true

  replyCancelled = false

  get dialogWidth() {
    return dialogWidth()
  }

  get contentName(): string {
    return `${this.operation}-${this.operation === 'add' ? this.holeId : this.floorId}`
  }

  closeDialog(): void {
    this.dialog = false
    this.valid = true
  }

  /**
   * Create a new floor.
   */
  async addFloor() {
    if (this.form.validate() && this.editor.validate()) {
      this.dialog = false
      const content = (!this.replyCancelled && this.replyFloor ? '##' + this.replyFloor.floorId + '\n\n' : '') + this.editor.getContent()

      const { message } = await addFloor({
        content: content,
        holeId: this.holeId
      })
      this.messageSuccess(message)
      this.editor.setContent('') // Clear the reply editor.
      this.$emit('continue-load')
    }
  }

  /**
   * Edit a floor.
   */
  async editFloor() {
    if (this.form.validate() && this.editor.validate()) {
      this.dialog = false
      const content = (!this.replyCancelled && this.replyFloor ? '##' + this.replyFloor.floorId + '\n\n' : '') + this.editor.getContent()

      const floor: DetailedFloor = await modifyFloor(this.floorId, content)
      this.messageSuccess('修改成功')
      this.editor.setContent('') // Clear the reply editor.
      this.$emit('update-floor', floor)
    }
  }
}
</script>

<style
  lang="scss"
  scoped
></style>
