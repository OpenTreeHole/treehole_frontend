<template>
  <v-dialog content-class='my-n4 mx-3' v-model='dialog' persistent :max-width='dialogWidth'>
    <template #activator='{ on, attrs }'>
      <slot
        name='activator'
        v-bind='{ on: {...on, click: e=>{on.click(e);openDialog()}}, attrs }'
      />
    </template>

    <v-card>
      <v-card-title>
        <span class='headline'>发表树洞</span>
      </v-card-title>

      <v-card-text>
        <!-- 发帖表单 -->
        <v-form ref='form' v-model='valid' lazy-validation>
          <v-combobox
            v-model='selectedDivision'
            :items='divisions'
            item-text='name'
            label='分区'
            hide-selected
          />
          <!-- 标签输入框 -->
          <v-combobox
            v-model='selectedTags'
            :items='tags'
            item-text='name'
            item-value='name'
            label='标签'
            hint='回车新增标签'
            :rules='tagRules'
            :error-messages="errorMsg['tags']"
            :counter='5'
            hide-selected
            clearable
            multiple
          >
            <!-- 自定义标签样式 -->
            <template v-slot:selection='data'>
              <tag-chip
                :tag='data.item'
                @click='selectedTags=selectedTags.filter(v=>v!==data.item)'
              >
                <span class='tag-icon'>
                  <v-icon x-small color='red'>mdi-fire</v-icon>
                </span>
                <span class='red--text'>
                  {{ data.item.temperature }}
                </span>
              </tag-chip>
            </template>

            <!-- 自定义下拉框样式 -->
            <template v-slot:item='data'>
              <v-list-item-content>
                <span :class="parseTagColor(data.item.name) + '--text'">
                  {{ data.item.name }}
                  <v-icon color='red' class='tag-icon' small>
                    mdi-fire
                  </v-icon>
                  <span class='tag-count red--text'>
                    {{ data.item.temperature }}
                  </span>
                </span>
              </v-list-item-content>
            </template>
          </v-combobox>

          <!-- 富文本输入框 -->
          <app-editor
            ref='editor'
            :contentName='contentName'
          />
        </v-form>
      </v-card-text>

      <!-- 关闭对话框 -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color='primary' text @click='closeDialog'> 关闭</v-btn>
        <v-btn
          color='primary'
          text
          @click='addHole'
        >
          发送
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang='ts'>
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import UserStore from '@/store/modules/UserStore'
import { Component, Prop, Ref, Watch } from 'vue-property-decorator'
import AppEditor from '@/components/app/AppEditor.vue'
import { Tag } from '@/models/tag'
import { Division } from '@/models/division'
import { parseTagColor } from '@/utils/utils'
import { dialogWidth } from '@/utils/style'
import TagChip from '@/components/chip/TagChip.vue'

@Component({
  components: {
    TagChip,
    AppEditor
  }
})
export default class CreateHoleDialog extends BaseComponentOrView {
  @Prop({ type: Number, default: 1 }) divisionId: number

  public content = ''
  public tags: Array<Tag> = []
  public selectedTags: Array<Tag> = []
  public selectedDivision: Division = {
    divisionId: 0,
    description: '',
    name: '',
    pinned: []
  }

  public dialog = false
  public tagRules = [
    (v: string | any[]) => v.length <= 5 || '标签不能多于5个',
    (v: string | any[]) => v.length >= 1 || '请至少选择1个标签'
  ]

  public errorMsg: any = {}
  public valid = true

  @Ref() readonly editor!: AppEditor
  @Ref() readonly form!: HTMLFormElement

  get coloredTags (): Array<any> {
    return this.tags.map(v => {
      return { ...v, color: parseTagColor(v.name) }
    })
  }

  get contentName (): string {
    return `division-${this.divisionId}-content`
  }

  get divisions () {
    return UserStore.divisions
  }

  get dialogWidth () {
    return dialogWidth()
  }

  public parseTagColor = parseTagColor

  public openDialog (): void {
    this.getTags()
    this.selectedDivision = UserStore.divisions[0]
    UserStore.divisions.forEach((v) => {
      if (v.divisionId === this.divisionId) {
        this.selectedDivision = v
      }
    })
  }

  public closeDialog (): void {
    this.dialog = false
    // 重置表单验证
    this.errorMsg = {}
    this.valid = true
  }

  /**
   * Send request to add a new hole.
   */
  public async addHole () {
    if (this.form.validate() && this.editor.validate()) {
      this.closeDialog()
      await this.$axios
        .post('/holes', {
          content: this.editor.getContent(),
          division_id: this.selectedDivision.divisionId,
          tags: this.selectedTags.map(v => {
            return { name: v.name }
          })
        })
      this.messageSuccess('发送成功')
      this.editor.setContent('')
      this.selectedTags = []
      this.$emit('refresh')
    }
  }

  /**
   * Get the tag list from the backend.
   */
  public async getTags () {
    const response = await this.$axios
      .get('/tags')
    this.tags = response.data
  }

  @Watch('selectedTags')
  selectedTagsChanged () {
    for (let i = 0; i < this.selectedTags.length; i++) {
      if (typeof this.selectedTags[i] !== 'object') {
        const tagStr = (this.selectedTags[i] as unknown as string).trim()
        // 校验新增的 tag
        if (tagStr.length > 8) {
          this.errorMsg.tags = '标签不能超过8个字符'
          this.selectedTags.pop()
          break
        } else if (
          this.tags.find(
            (tag) => tag.name.toLowerCase() === tagStr.toLowerCase()
          )
        ) {
          this.errorMsg.tags = '标签不能重复'
          this.selectedTags.pop()
          break
        } else if (tagStr.length === 0) {
          this.errorMsg.tags = '标签不能为空'
          this.selectedTags.pop()
          break
        } else {
          this.errorMsg.tags = ''
          this.selectedTags[i] = {
            name: tagStr,
            temperature: 0,
            tagId: -1
          }
        }
      }
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
