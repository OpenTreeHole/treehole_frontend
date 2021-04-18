<template>
  <v-container fill-height>
    <!-- 警告信息 -->
    <message ref="message"></message>

    <!-- 新用户欢迎信息 -->
    <newcomer></newcomer>

    <!-- 帖子列表 -->

    <v-row
      v-for="(discussion, index) in discussions"
      :key="index"
      justify="center"
      class="ma-0"
    >
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <v-card>
          <!-- 标签栏 -->
          <v-card-text class="pb-0 pt-2 font-weight-medium">
            <v-chip
              v-for="(tag, tindex) in discussion.tag"
              :key="tindex"
              :color="tag.color"
              outlined
              class="mx-1 my-1"
              small
              ripple
            >
              {{ tag.name }}
            </v-chip>
          </v-card-text>

          <!-- 内容主体 -->
          <v-card-text
            @click="toDiscussion(discussion.id, index)"
            class="text--primary py-2 text-body-1 clickable"
            v-ripple
          >
            <div v-if="styleData[index]['fold']" :id="'p' + index" class="fold">
              {{ discussion.first_post.content | (plain - text) }}
            </div>
            <div v-else :id="'p' + index" class="unfold">
              <div id="rich-text" v-html="discussion.first_post.content"></div>
            </div>
          </v-card-text>

          <!-- 展开折叠按钮 -->
          <div v-if="styleData[index]['lines'] > 3">
            <div v-if="styleData[index]['fold']">
              <v-btn
                text
                block
                depressed
                x-small
                color="grey lighten-1"
                @click="unfold(index)"
              >
                <v-icon>mdi-chevron-double-down</v-icon>
              </v-btn>
            </div>

            <div v-else>
              <v-btn
                text
                block
                depressed
                x-small
                color="grey lighten-1"
                @click="fold(index)"
              >
                <v-icon>mdi-chevron-double-up</v-icon>
              </v-btn>
            </div>
          </div>
          <div v-else>
            <div style="height: 0.5rem"></div>
          </div>

          <!-- 脚标 -->
          <v-card-text class="pt-0 pb-0 text-center caption">
            <span style="float: left">#{{ discussion['id'] }}</span>
            <span style="float: inherit">{{
              discussion['date_updated'] | timeDifference
            }}</span>
            <span style="float: right">
              {{ discussion['count'] }}
              <v-icon small>mdi-message-processing-outline</v-icon>
            </span>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 弹出式表单及浮动按钮 -->

    <v-dialog v-model="dialog" persistent max-width="600px">
      <!-- 浮动按钮 -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          fab
          color="success"
          class="fixed"
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
              @invalid="editorInvalid"
            ></editor>
          </v-form>
        </v-card-text>

        <!-- 关闭对话框 -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog"> 关闭 </v-btn>
          <v-btn
            color="blue darken-1"
            text
            :disabled="!valid"
            @click="addDiscussion"
          >
            发送
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 载入中信息 -->
    <loading :length="discussions.length" :loadList="getDiscussions"></loading>
  </v-container>
</template>

<script>
import debounce from 'lodash.debounce'

import Loading from '@/components/Loading.vue'
import Editor from '@/components/Editor.vue'
import Message from '@/components/Message.vue'
import Newcomer from '@/components/Newcomer.vue'

export default {
  name: 'Home',
  components: {
    Loading,
    Editor,
    Message,
    Newcomer,
  },
  data() {
    return {
      // 帖子列表
      discussions: [],
      page: 1,
      // 展开折叠样式数据
      styleData: [],
      lineHeight: 0,
      scrollTop: 0,
      // 发帖表单
      content: '',
      tags: [],
      selectedTags: [],
      dialog: false,
      tagRules: [
        (v) => v.length > 0 || '标签不能为空',
        (v) => v.length <= 5 || '标签不能多于5个',
      ],
      contentRules: [(v) => !!v.trim() || '内容不能为空'],
      errorMsg: {},
      valid: true,
    }
  },

  computed: {
    contentName() {
      return 'home-content'
    },
  },

  methods: {
    editorInvalid(msg) {
      this.$refs.message.error(msg)
    },

    unfold(index) {
      this.scrollTop = document.documentElement.scrollTop
      this.styleData[index]['fold'] = false
    },

    fold(index) {
      this.styleData[index]['fold'] = true
      let scrollDistance = this.scrollTop - document.documentElement.scrollTop
      window.scrollBy({
        top: scrollDistance, //  正值向下
        left: 0,
        behavior: 'smooth',
      })
    },

    randomColor() {
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
        'lime',
        'yellow',
        'amber',
        'orange',
        'deep-orange',
        'brown',
        'blue-grey',
        'grey',
      ]
      const index = Math.floor(Math.random() * colorList.length)
      return colorList[index]
    },

    openDialog() {
      this.getTags()
    },

    closeDialog() {
      this.dialog = false
      // 重置表单验证
      this.errorMsg = {}
      this.valid = true
    },

    toDiscussion(discussion_id) {
      setTimeout(() => {
        this.$router.push({
          path: `/discussion/${discussion_id}`,
        })
      }, 50)
    },

    addDiscussion() {
      if (this.$refs.form.validate() && this.$refs.editor.validate()) {
        // 先关闭对话框,优化用户体验
        this.closeDialog()
        // 发送请求
        this.$axios
          .post('discussions/', {
            content: this.$refs.editor.content,
            tags: this.selectedTags,
          })
          .then((response) => {
            console.log(response.data)
            // 重新加载页面
            this.discussions = []
            this.page = 1
            this.getDiscussions()
            // 重置表单内容
            this.$refs.editor.content = ''
            this.tags = []
            this.selectedTags = []
          })
          .catch((error) => {
            console.log(error.response)
            this.$refs.message.error(error.response.data.msg)
          })
      }
    },

    getDiscussions() {
      return this.$axios
        .get('discussions/', { params: { page: this.page } })
        .then((response) => {
          for (let i = 0; i < response.data.length; i++) {
            this.styleData.push({ fold: true, lines: 3 })
          }
          this.discussions.push.apply(this.discussions, response.data)
          if (response.data.length > 0) {
            this.page++
          }
        })
        .catch((error) => {
          this.$refs.message.error(error.response.data.msg)
        })
    },

    getTags() {
      // 获取 所有的 tags
      this.$axios
        .get('tags/')
        .then((response) => {
          this.tags = response.data
        })
        .catch((response) => {
          console.log(response.data)
          this.$refs.message.error(error.response.data.msg)
        })
    },

    calcuteLines() {
      for (let i = 0; i < this.styleData.length; i++) {
        const element = document.getElementById('p' + i)
        const totalHeight = element.scrollHeight
        this.styleData[i].lines = totalHeight / this.lineHeight
      }
    },
  },

  watch: {
    discussions: function () {
      setTimeout(() => {
        const element = document.getElementById('p1')
        this.lineHeight = parseInt(
          window.getComputedStyle(element, null).getPropertyValue('line-height')
        )
        this.calcuteLines()
      }, 100)
    },

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
              count: 0,
            }
          }
        }
      }
    },
  },
  mounted() {
    window.onresize = () => {
      this.debouncedCalculateLines()
    }
  },

  created() {
    this.debouncedCalculateLines = debounce(this.calcuteLines, 300)
    // this.getTags()
  },
}
</script>

<style>
.fold {
  overflow: hidden;
  max-height: 4.5rem;
  transition: max-height 0.5s cubic-bezier(0, 1, 0, 1);
}
.unfold {
  overflow: hidden;
  max-height: 100rem;
  transition: max-height 1s ease-in-out;
}
.clickable {
  cursor: pointer;
}

/* 浮动按钮 固定在右下角 */
.fixed {
  position: fixed;
  right: 8px;
  bottom: 64px;
}

.tag-icon {
  margin-left: 0.25rem;
}

.tag-count {
  margin-left: -0.25rem;
}

#rich-text p {
  margin-bottom: 0px;
}

img {
  display: block;
  margin: auto;
  max-width: 90%;
}
</style>
