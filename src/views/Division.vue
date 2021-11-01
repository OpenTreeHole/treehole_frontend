<template>
  <v-container>
    <!-- 帖子列表 -->
    <DiscussionComponent v-if='!isMobile' ref='holeComp'/>
    <DiscussionListMobile v-else ref='holeComp' />

    <!-- 新帖编辑器及浮动按钮 -->
    <div class='float-btn' v-show='showFloatBtn'>
      <v-btn fab color='secondary' @mousedown.prevent @click='reload'>
        <v-icon>mdi-autorenew</v-icon>
      </v-btn>
      <br />

      <v-dialog v-model='dialog' persistent max-width='600px'>
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
                :items='$user.divisions'
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
                    :key='JSON.stringify(data.item)'
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
                @error='editorError'
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
    </div>

  </v-container>
</template>

<script lang='ts'>
import { Component, Ref, Watch } from 'vue-property-decorator'
import HolePanel from '@/components/hole/HolePanel.vue'
import DiscussionListMobile from '@/components/hole/HoleListMobile.vue'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Division as IDivision, Tag } from '@/api/hole'
import Editor from '@/components/Editor.vue'

@Component({
  components: {
    Editor,
    DiscussionComponent: HolePanel,
    DiscussionListMobile
  }
})
export default class Division extends BaseComponentOrView {
  public lineHeight = 0
  public scrollTop = 0
  // 发帖表单
  public content = ''
  public tags: Array<Tag> = []
  public selectedTags: Array<Tag> = []
  public selectedDivision: IDivision = {
    divisionId: 0,
    description: '',
    name: '',
    pinned: []
  }

  public filtedTag: { color: string, count: number, name: string } | null = null
  public dialog = false
  public tagRules = [
    (v: string | any[]) => v.length <= 5 || '标签不能多于5个'
  ]

  public contentRules = [(v: string) => !!v.trim() || '内容不能为空']
  public errorMsg: any = {}
  public valid = true
  public params = {}
  public showFloatBtn = true

  @Ref() readonly holeComp!: HolePanel | DiscussionListMobile
  @Ref() readonly editor!: Editor
  @Ref() readonly form!: HTMLFormElement

  get contentName (): string {
    return 'home-content'
  }

  public reload (): void {
    this.filtedTag = null
    this.holeComp.refresh()
  }

  public editorError (msg: string): void {
    this.messageError(msg)
  }

  public randomColor (): string {
    const colorList = [
      'red',
      'pink',
      'purple',
      'deep-purple',
      'indigo',
      'blue',
      'light-blue',
      'cyan',
      'teal',
      'green',
      'light-green',
      'yellow',
      'amber',
      'orange',
      'deep-orange',
      'brown',
      'blue-grey',
      'grey'
    ]
    const index = Math.floor(Math.random() * colorList.length)
    return colorList[index]
  }

  public openDialog (): void {
    this.getTags()
    this.selectedDivision = this.$user.divisions[0]
    this.$user.divisions.forEach((v) => {
      if (v.divisionId.toString() === this.$route.params.id) {
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
  public addHole (): void {
    if (this.form.validate() && this.editor.validate()) {
      this.closeDialog()
      this.$axios
        .post('/holes', {
          content: this.editor.getContent(),
          division_id: this.selectedDivision.divisionId,
          tag_names: this.selectedTags.map(v => v.name)
        })
        .then((response) => {
          console.log(response.data)
          this.messageSuccess('发送成功')
          this.holeComp.refresh() // reload the hole list
          this.editor.setContent('')
          this.tags = []
          this.selectedTags = []
        })
        .catch((error) => {
          console.log(error.response)
          this.messageError(error.response.data.msg)
        })
    }
  }

  /**
   * Get the tag list from the backend.
   */
  public getTags (): void {
    this.$axios
      .get('/tags')
      .then((response) => {
        this.tags = response.data
      })
      .catch((response) => {
        console.log(response.data)
        this.messageError(response.data.msg)
      })
  }

  public mounted () {
    this.$nextTick(() => {
      this.checkDevice()
    })
    window.addEventListener('resize', () => {
      this.checkDevice()
    })
  }

  public destroyed () {
    window.removeEventListener('resize', this.checkDevice)
  }

  public onShowFloatBtnChanged (val: boolean): void {
    this.showFloatBtn = !val
  }

  @Watch('selectedTags')
  selectedTagsChanged () {
    for (let i = 0; i < this.selectedTags.length; i++) {
      if (typeof this.selectedTags[i] !== 'object') {
        const tagStr = this.selectedTags[i].name.trim()
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

<style lang='scss' scoped>
/* 浮动按钮 固定在右下角 */
.float-btn {
  position: fixed;
  right: 8px;
  bottom: 64px;

  .v-btn {
    margin: 5px;
  }
}

.tag-icon {
  margin-left: 0.25rem;
}

.tag-count {
  margin-left: -0.25rem;
}
</style>
