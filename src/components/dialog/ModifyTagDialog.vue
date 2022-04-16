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
        <span class="headline">修改标签及分区</span>
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
          <!-- 标签输入框 -->
          <tag-input
            v-model="selectedTags"
            :counter="5"
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
          修改
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Component, ModelSync, Prop, Ref, Watch } from 'vue-property-decorator'
import { Division } from '@/models/division'
import UserStore from '@/store/modules/UserStore'
import { modifyHoleDivision, modifyHoleTag } from '@/apis'
import { Hole } from '@/models/hole'
import TagChip from '@/components/chip/TagChip.vue'
import { dialogWidth } from '@/utils/style'
import TagInput from '@/components/input/TagInput.vue'
import { ITag } from '@/models/tag'

@Component({
  components: { TagInput, TagChip }
})
export default class ModifyTagDialog extends BaseComponentOrView {
  @Prop({ required: true }) hole: Hole | null
  @ModelSync('dialogProp', 'change', { type: Boolean, default: false }) dialog: boolean

  content = ''

  selectedDivision: Division | null = null
  selectedTags: ITag[] = []

  valid = true

  @Ref() readonly form!: HTMLFormElement

  get divisions() {
    return UserStore.divisions
  }

  get dialogWidth() {
    return dialogWidth()
  }

  @Watch('dialog')
  dialogChanged(newVal: boolean) {
    if (newVal) {
      if (!this.hole) {
        this.messageError('未找到该主题帖，请稍后再试')
      }
      this.selectedDivision = UserStore.divisions.find((v) => v.divisionId === this.hole!.divisionId) ?? null
      this.selectedTags = this.hole!.tags
    }
  }

  closeDialog() {
    this.dialog = false
    this.valid = true
  }

  async submit() {
    if (this.form.validate()) {
      this.closeDialog()
      await modifyHoleTag(
        this.hole!.holeId,
        this.selectedTags.map((v) => v.name)
      )
      const hole = await modifyHoleDivision(this.hole!.holeId, this.selectedDivision!.divisionId)
      this.messageSuccess('修改成功！')
      this.selectedTags = []
      this.$emit('submit', hole)
    }
  }
}
</script>
