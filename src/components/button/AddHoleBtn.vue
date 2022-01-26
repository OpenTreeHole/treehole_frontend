<template>
  <v-dialog content-class='my-n4 mx-3' v-model='dialog' persistent :max-width='editorWidth'>
    <template v-slot:activator='{ on, attrs }'>
      <v-btn
        fab
        color='secondary'
        v-bind='attrs'
        v-on='on'
        @mousedown.prevent
        @click='openDialog'
      >
        <v-icon>mdi-message-plus</v-icon>
      </v-btn>
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
              <v-chip
                v-bind='data.attrs'
                :input-value='data.selected'
                :disabled='data.disabled'
                @click:close='data.parent.selectItem(data.item)'
                outlined
                color='red'
                small
              >
                {{ data.item.name }}
                <span class='tag-icon'>
                      <v-icon x-small>mdi-fire</v-icon>
                    </span>
                <span>
                      {{ data.item.temperature }}
                    </span>
              </v-chip>
            </template>

            <!-- 自定义下拉框样式 -->
            <template v-slot:item='data'>
              <v-list-item-content>
                    <span :class="'red' + '--text'">
                      {{ data.item.name }}
                      <v-icon color='red' class='tag-icon' small
                      >mdi-fire</v-icon
                      >
                      <span class='tag-count'>
                        {{ data.item.temperature }}
                      </span>
                    </span>
              </v-list-item-content>
            </template>
          </v-combobox>

          <!-- 富文本输入框 -->
          <editor
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
          :disabled='!valid'
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
import Editor from '@/components/Editor.vue'
import { Tag } from '@/models/tag'
import { Division } from '@/models/division'

@Component({
  components: {
    Editor
  }
})
export default class AddHoleBtn extends BaseComponentOrView {
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

  @Ref() readonly editor!: Editor
  @Ref() readonly form!: HTMLFormElement

  get contentName (): string {
    return `division-${this.divisionId}-content`
  }

  get divisions () {
    return UserStore.divisions
  }

  get editorWidth () {
    return this.isMobile ? '98vw' : '70vw'
  }

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
