<template>
  <v-dialog
    content-class="my-n4 mx-3"
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
        <span class="headline">发表树洞</span>
      </v-card-title>

      <v-card-text>
        <!-- 发帖表单 -->
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <v-combobox
            v-model="selectedDivision"
            :items="divisions"
            :rules="[(v) => v != null]"
            item-text="name"
            label="分区"
            hide-selected
          />

          <tag-input
            v-model="selectedTags"
            :counter="5"
          />

          <!-- 富文本输入框 -->
          <app-editor
            ref="editor"
            :contentName="contentName"
          />
        </v-form>
      </v-card-text>

      <!-- 关闭对话框 -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="closeDialog"
        >
          关闭</v-btn
        >
        <v-btn
          color="primary"
          text
          @click="submit"
        >
          发送
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import UserStore from '@/store/modules/UserStore'
import { Component, ModelSync, Prop, Ref, Watch } from 'vue-property-decorator'
import AppEditor from '@/components/app/AppEditor.vue'
import { ITag } from '@/models/tag'
import { Division } from '@/models/division'
import { dialogWidth } from '@/utils/style'
import TagChip from '@/components/chip/TagChip.vue'
import { addHole } from '@/apis'
import TagInput from '@/components/input/TagInput.vue'

@Component({
  components: {
    TagInput,
    TagChip,
    AppEditor
  }
})
export default class CreateHoleDialog extends BaseComponentOrView {
  @Prop({ type: Number, default: 1 }) divisionId: number
  @ModelSync('dialogProp', 'change', { type: Boolean, default: false }) dialog: boolean

  content = ''

  selectedTags: ITag[] = []
  selectedDivision: Division | null = null

  valid = true

  @Ref() readonly editor!: AppEditor
  @Ref() readonly form!: HTMLFormElement

  get contentName(): string {
    return `division-${this.divisionId}-content`
  }

  get divisions() {
    return UserStore.divisions
  }

  get dialogWidth() {
    return dialogWidth()
  }

  @Watch('dialog')
  dialogChanged(newVal: boolean) {
    if (newVal) {
      this.selectedDivision = UserStore.divisions.find((v) => v.divisionId === this.divisionId) ?? null
    }
  }

  closeDialog() {
    this.dialog = false
    this.valid = true
  }

  /**
   * Send request to add a new hole.
   */
  async submit() {
    if (this.form.validate() && this.editor.validate()) {
      this.closeDialog()
      const { message } = await addHole(this.selectedDivision!.divisionId, this.editor.getContent(), this.selectedTags)
      this.messageSuccess(message)
      this.editor.setContent('')
      this.selectedTags = []
      this.$emit('refresh')
    }
  }
}
</script>

<style scoped>
.tag-icon {
  margin-left: 0.25rem;
}

.tag-count {
  margin-left: -0.25rem;
}
</style>
