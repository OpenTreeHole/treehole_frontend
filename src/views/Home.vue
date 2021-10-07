<template>
  <v-container>
    <!-- 警告信息 -->
    <message ref="message"></message>

    <!-- 新用户欢迎信息 -->
    <newcomer></newcomer>

    <!-- 标签筛选器 -->
    <v-row align="top" justify="center" class="ma-0" v-if="filtedTag">
      <v-col cols="12" sm="10" md="9" lg="7" xl="5">
        <v-card>
          <v-card-text>
            <v-chip
              :color="filtedTag.color"
              outlined
              class="mx-1 my-1"
              small
              ripple
              @click.stop="reloadHome()"
            >
              {{ filtedTag.name }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 帖子列表 -->
    <DiscussionList v-if="!_isMobile" ref="discussions" api="discussions/" />
    <DiscussionListMobile v-else ref="discussions" api="discussions/" />

    <!-- 新帖编辑器及浮动按钮 -->
    <div class="float-btn" v-show="showFloatBtn">
      <v-btn fab color="secondary" @click="reloadHome()">
        <v-icon>mdi-autorenew</v-icon>
      </v-btn>
      <br />

      <v-dialog v-model="dialog" persistent max-width="600px">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            color="secondary"
            v-bind="attrs"
            v-on="on"
            @click="openDialog"
          >
            <v-icon>mdi-message-plus</v-icon>
          </v-btn>
        </template>

        <v-card>
          <v-card-title>
            <span class="headline">发表树洞</span>
          </v-card-title>

          <v-card-text>
            <!-- 发帖表单 -->
            <v-form ref="form" v-model="valid" lazy-validation>
              <!-- 标签输入框 -->
              <v-combobox
                v-model="selectedTags"
                :items="tags"
                item-text="name"
                item-value="name"
                label="标签"
                hint="回车新增标签"
                :rules="tagRules"
                :error-messages="errorMsg['tags']"
                :counter="5"
                hide-selected
                clearable
                multiple
              >
                <!-- 自定义标签样式 -->
                <template v-slot:selection="data">
                  <v-chip
                    :key="JSON.stringify(data.item)"
                    v-bind="data.attrs"
                    :input-value="data.selected"
                    :disabled="data.disabled"
                    @click:close="data.parent.selectItem(data.item)"
                    outlined
                    :color="data.item.color"
                    small
                  >
                    {{ data.item.name }}
                    <span class="tag-icon">
                      <v-icon x-small>mdi-fire</v-icon>
                    </span>
                    <span>
                      {{ data.item.count }}
                    </span>
                  </v-chip>
                </template>

                <!-- 自定义下拉框样式 -->
                <template v-slot:item="data">
                  <v-list-item-content>
                    <span :class="data.item.color + '--text'">
                      {{ data.item.name }}
                      <v-icon :color="data.item.color" class="tag-icon" small
                        >mdi-fire</v-icon
                      >
                      <span class="tag-count">
                        {{ data.item.count }}
                      </span>
                    </span>
                  </v-list-item-content>
                </template>
              </v-combobox>

              <!-- 富文本输入框 -->
              <editor
                ref="editor"
                :contentName="contentName"
                @error="editorError"
              ></editor>
            </v-form>
          </v-card-text>

          <!-- 关闭对话框 -->
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="closeDialog"> 关闭</v-btn>
            <v-btn
              color="primary"
              text
              :disabled="!valid"
              @click="addDiscussion"
            >
              发送
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script>
// import debounce from 'lodash.debounce'

// import Loading from '@/components/Loading.vue'
// import DiscussionCard from '@/components/DiscussionCard.vue'
import Editor from '@/components/Editor.vue'
import Message from '@/components/Message.vue'
import Newcomer from '@/components/Newcomer.vue'
import DiscussionList from '@/components/DiscussionList.vue'
import DiscussionListMobile from '@/components/DiscussionListMobile'

export default {
  name: 'Home',
  components: {
    // Loading,
    // DiscussionCard,
    Editor,
    Message,
    Newcomer,
    DiscussionList,
    DiscussionListMobile
  },
  data () {
    return {
      // // 帖子列表
      // discussions: [],
      // page: 1,
      // // 展开折叠样式数据
      // styleData: [],
      lineHeight: 0,
      scrollTop: 0,
      // 发帖表单
      content: '',
      tags: [],
      selectedTags: [],
      filtedTag: null,
      dialog: false,
      tagRules: [
        // (v) => v.length > 0 || '标签不能为空',
        (v) => v.length <= 5 || '标签不能多于5个'
      ],
      contentRules: [(v) => !!v.trim() || '内容不能为空'],
      errorMsg: {},
      valid: true,
      params: {},
      showFloatBtn: true
    }
  },

  computed: {
    contentName () {
      return 'home-content'
    },
    _isMobile () {
      // console.log(navigator.userAgent)
      // return navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
      return document.body.clientWidth <= 768
    }
  },

  methods: {
    addTag (tag) {
      this.filtedTag = tag
      this.$refs.discussions.tag_name = this.filtedTag.name
      this.$refs.discussions.refresh()
    },
    reloadHome () {
      this.filtedTag = null
      this.$refs.discussions.tag_name = null
      this.$refs.discussions.refresh()
    },
    editorError (msg) {
      this.$refs.message.error(msg)
    },
    randomColor () {
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
    },
    openDialog () {
      this.getTags()
    },
    closeDialog () {
      this.dialog = false
      // 重置表单验证
      this.errorMsg = {}
      this.valid = true
    },
    addDiscussion () {
      if (this.$refs.form.validate() && this.$refs.editor.validate()) {
        // 先关闭对话框,优化用户体验
        this.closeDialog()
        // 发送请求
        this.$axios
          .post('discussions/', {
            content: this.$refs.editor.getContent(),
            tags: this.selectedTags
          })
          .then((response) => {
            console.log(response.data)
            this.$refs.message.success('发送成功')
            // 重新加载页面
            this.$refs.discussions.refresh()
            // 重置表单内容
            this.$refs.editor.setContent('')
            this.tags = []
            this.selectedTags = []
          })
          .catch((error) => {
            console.log(error.response)
            this.$refs.message.error(error.response.data.msg)
          })
        // 发送完请求后，刷新讨论页面以让用户能看到自己的消息，并弹出发帖成功通知
      }
    },
    getTags () {
      // 获取 所有的 tags
      this.$axios
        .get('tags/')
        .then((response) => {
          this.tags = response.data
        })
        .catch((response) => {
          console.log(response.data)
          this.$refs.message.error(response.data.msg)
        })
    }
  },

  watch: {
    selectedTags: function () {
      for (let i = 0; i < this.selectedTags.length; i++) {
        if (typeof this.selectedTags[i] !== 'object') {
          const tagStr = this.selectedTags[i].trim()
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
              color: this.randomColor(),
              count: 0
            }
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
