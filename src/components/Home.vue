<template>
<v-container fill-height>

  <!-- 警告信息 -->
  <v-row justify="center">
    <v-col>
      <v-alert type="error" transition="fade-transition" :value="alert" >
        {{alertMessage}}
      </v-alert>
    </v-col>
  </v-row>
  <v-row>
    <v-col>

    </v-col>
  </v-row>

  <!-- 帖子列表 -->

  <v-row v-for="(discussion, index) in discussions" :key="index" justify="center">
    <v-col cols="12" sm="10" md="8" lg="6" xl="4">
      <v-card>

      <!-- 标签栏 -->
        <v-card-text class="pb-2 pt-2 font-weight-medium" >
          <v-chip v-for="(tag, tindex) in discussion.tag" :key="tindex" :color="tag.color" outlined class="mx-2" small ripple>
            {{tag.name}}
          </v-chip>
        </v-card-text>

      <!-- 内容主体 -->
        <v-card-text @click="toDiscussion(discussion.id, index)" class="py-2 text-body-1 clickable" v-ripple>
          <div v-if="styleData[index]['fold']" :id="'p' + index" class="fold" >
            {{ discussion.first_post.content | plain-text }}
          </div>
          <div v-else :id="'p' + index" class="unfold">
            <div id="rich-text" v-html="discussion.first_post.content"></div>
          </div>
        </v-card-text>

      <!-- 展开折叠按钮 -->
        <div v-if="styleData[index]['lines'] > 3">

          <div v-if="styleData[index]['fold']">
            <v-btn text block depressed x-small
              color="grey lighten-1"
              @click="styleData[index]['fold'] = false">
              <v-icon>mdi-chevron-double-down</v-icon>
            </v-btn>
          </div>

          <div v-else>
            <v-btn text block depressed x-small
              color="grey lighten-1"
              @click="styleData[index]['fold'] = true">
              <v-icon>mdi-chevron-double-up</v-icon>
            </v-btn>
          </div>

        </div>
        <div v-else>
          <div style="height: 0.5rem;"></div>
        </div>

      <!-- 脚标 -->
        <v-card-text class="pt-0 pb-0 text-center caption">
          <span style="float:left">#{{ discussion['id'] }}</span>
          <span style="float:inherit">{{ discussion['date_updated'] | timeDifference }}</span>
          <span style="float:right">
            {{ discussion['count'] }}
            <v-icon small>mdi-message-processing-outline</v-icon>
          </span>
        </v-card-text>

      </v-card>
    </v-col>
  </v-row>

  <!-- 弹出式表单及浮动按钮 -->

    <v-dialog
      v-model="dialog"
      persistent
      max-width="600px"
    >
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

          <!-- 警告信息 -->
          <v-alert type="error" transition="fade-transition" :value="formAlert" >{{formAlertMessage}}</v-alert>

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
                    {{ data.item.count}}
                  </span>
                </v-chip>
              </template>

              <!-- 自定义下拉框样式 -->
              <template v-slot:item="data">
                  <v-list-item-content>
                    <span :class="data.item.color + '--text'">
                      {{ data.item.name }}
                      <v-icon :color="data.item.color" class="tag-icon" small>mdi-fire</v-icon>
                      <span class="tag-count">
                        {{ data.item.count}}
                      </span>
                    </span>
                  </v-list-item-content>
              </template>

            </v-combobox>

            <div class="text-center">   <!-- 上传进度显示 -->
              <v-overlay :value="overlay">
                <div class="text-h5 py-4 amber--text">{{overlayMsg}}</div>  
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="64"
                ></v-progress-circular>
              </v-overlay>
            </div>

            <!-- 内容部分 -->
            <quill-editor
              v-model="content"
              ref="editor"
              :options="editorOption"
              @blur="onEditorBlur($event)"
              @focus="onEditorFocus($event)"
              @change="onEditorChange($event)">
            </quill-editor>

          </v-form>

        </v-card-text>

      <!-- 关闭对话框 -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="closeDialog"
          >
            关闭
          </v-btn>
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
  <v-row
    v-intersect="{
      handler: onIntersect,
      options: { threshold: 0 }}"
  >
    <v-col class="text-center">
      <div v-if="isLoading"> 加载中...... </div>
      <div v-else> 没有然后了......</div>
    </v-col>
  </v-row>

</v-container>
</template>

<script>

import debounce from 'lodash.debounce'
import hljs from 'highlight.js'
import 'highlight.js/styles/dracula.css'

import { quillEditor, Quill } from 'vue-quill-editor'
import { container, ImageExtend, QuillWatch } from 'quill-image-super-solution-module'
// import ImageResize from 'quill-image-resize-module'

// Quill.register('modules/ImageResize', ImageResize)
Quill.register('modules/ImageExtend', ImageExtend)

export default {
  data () {
    return {
      // 提示信息
      alert: false,
      alertMessage: '网络错误',
      formAlert: false,
      formAlertMessage: '网络错误',
      // 帖子列表
      discussions: [],
      page: 1,
      // 展开折叠样式数据
      styleData: [],
      lineHeight: 0,
      // 发帖表单
      content: '',
      editorOption: {
        debug: 'info',
        placeholder: '说些什么 ...',
        theme: 'snow',
        modules: {
          // history: {          //自动保存
          //     delay: 1000,
          //     maxStack: 100,
          //     userOnly: false
          // },
          syntax: { // 代码高亮
            highlight: text => hljs.highlightAuto(text).value
          },
          // ImageResize: {},
          ImageExtend: {
            // 可选参数 是否显示上传进度和提示语
            loading: true,
            // 图片参数名
            name: 'img',
            // 可选参数 图片大小，单位为M，1M = 1024kb
            size: 10,
            // 服务器地址, 如果action为空，则采用base64插入图片
            action: 'https://www.fduhole.tk/api/images/',
            // 可选 可上传的图片格式
            accept: 'image/jpg, image/png, image/gif, image/jpeg, image/bmp, image/x-icon, image/svg+xml, image/webp',
            // response 为一个函数用来获取服务器返回的具体图片地址
            // 例如服务器返回 {code: 200; data:{ url: 'baidu.com'}}
            // 则 return res.data.url
            response: (res) => {
              return res.url
            },
            // 可选参数 设置请求头部
            headers: (xhr) => {
              xhr.setRequestHeader('Authorization', localStorage.getItem('token'))
            },
            // 图片超过大小的回调
            sizeError: () => {
              alert('图片大小超过 10 M')
            },
            // 可选参数 自定义开始上传触发事件
            start: () => {
              this.overlayMsg = '上传中...'
              this.overlay = true
            },
            // 可选参数 自定义上传结束触发的事件，无论成功或者失败
            end: () => {},
            // 可选参数 上传失败触发的事件
           error: () => {
              this.overlayMsg = '上传失败'
              setTimeout(() => {
                this.overlay = false
              }, 250)
              console.log('fail')
            },
            success: () => {
              this.overlayMsg = '上传成功'
              setTimeout(() => {
                this.overlay = false
              }, 250)
              console.log('success')
            }
            // 可选参数 选择图片触发，也可用来设置头部，但比headers多了一个参数，可设置formData
            // change: (xhr, formData) => {
            //     formData.append("example", "test");
            // },
          },
          toolbar: {
            container: [
              ['bold', 'italic', 'strike', { header: 1 }],
              ['blockquote', 'code-block', 'link', 'image']
            ],
            handlers: {
              image: function () { // 劫持原来的图片点击按钮事件
                QuillWatch.emit(this.quill.id)
              }
            }
          }
        }
      },
      overlay: false,
      overlayMsg: '上传中...',
      tags: [],
      selectedTags: [],
      dialog: false,
      tagRules: [
        v => v.length > 0 || '标签不能为空',
        v => v.length <= 5 || '标签不能多于5个'
      ],
      contentRules: [v => !!v.trim() || '内容不能为空'],
      errorMsg: {},
      valid: true,
      // 底部加载
      isLoading: true
    }
  },
  methods: {
    onEditorBlur () {}, // 失去焦点触发事件
    onEditorFocus () { // 获得焦点触发事件
      // let quill = this.$refs.editor.quill
      // quill.insertEmbed(10, 'image', 'https://cdn.jsdelivr.net/gh/fduhole/web@img/background.jpeg')
    },

    onEditorChange () { // 内容改变触发事件
    },

    randomColor () {
      const colorList = ['red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber', 'orange', 'deep-orange', 'brown', 'blue-grey', 'grey']
      const index = Math.floor((Math.random() * colorList.length))
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
      // 重置表单警告
      this.formAlert = false
      this.formAlertMessage = '网络错误'
    },

    toDiscussion (discussion_id) {
      setTimeout(() => {
        this.$router.push({
          path: `/discussion/${discussion_id}`
        })
      }, 50)
    },

    addDiscussion () {
      if (this.$refs.form.validate()) {
        // 先关闭对话框,优化用户体验
        this.closeDialog()
        // 发送请求
        this.$axios
          .post('discussions/', { content: this.content, tags: this.selectedTags })
          .then(response => {
            console.log(response.data)
            // 重新加载页面
            this.discussions = []
            this.page = 1
            this.getDiscussions()
            // 重置表单内容
            this.content = ''
            this.tags = []
            this.selectedTags = []
            // 重置 alert 信息
            this.alert = false
            this.alertMessage = ''
          })
          .catch((error) => {
            console.log(error.response)
            this.alert = true
            this.alertMessage = '发送失败 ' + error.response.data.msg
          })
      }
    },

    getDiscussions () {
      return this.$axios
        .get('discussions/', { params: { page: this.page } })
        .then(response => {
          this.alert = false
          this.page++
          for (let i = 0; i < response.data.length; i++) {
            this.styleData.push({ fold: true, lines: 3 })
          }
          this.discussions.push.apply(this.discussions, response.data)
          console.log(response.data)
        })
        .catch(() => {
          this.alert = true
          this.alertMessage = error.response.data.msg
        })
    },

    getTags () { // 获取 所有的 tags
      this.$axios
        .get('tags/')
        .then(response => {
          this.tags = response.data
          console.log(response.data)
          this.formAlert = false
        })
        .catch((response) => {
          console.log(response.data)
          this.formAlert = true
          this.formAlertMessage = error.response.data.msg
        })
    },

    calcuteLines () {
      for (let i = 0; i < this.styleData.length; i++) {
        const element = document.getElementById('p' + i)
        const totalHeight = element.scrollHeight
        this.styleData[i].lines = totalHeight / this.lineHeight
      }
    },

    async load () {
      if (this.discussions.length % 10 !== 0) {
        this.isLoading = false
        return
      }
      const beforeLength = this.discussions.length
      await this.getDiscussions()
      const afterLength = this.discussions.length
      if (afterLength < 10) {
        this.isLoading = false
        return
      }
      if (beforeLength === afterLength) {
        this.isLoading = false
        return
      }
      this.isLoading = true
    },

    onIntersect (entries, observer) {
      if (entries[0].isIntersecting) {
        this.load()
      }
    }

  },

  watch: {
    discussions: function () {
      setTimeout(() => {
        const element = document.getElementById('p1')
        this.lineHeight = parseInt(window.getComputedStyle(element, null).getPropertyValue('line-height'))
        this.calcuteLines()
      }, 100)
    },

    selectedTags: function () {
      for (let i = 0; i < this.selectedTags.length; i++) {
        if (typeof (this.selectedTags[i]) !== 'object') {
          const tagStr = this.selectedTags[i].trim()
          // 校验新增的 tag
          if (tagStr.length > 8) {
            this.errorMsg.tags = '标签不能超过8个字符'
            this.selectedTags.pop()
            break
          } else if (this.tags.find(tag => tag.name.toLowerCase() === tagStr.toLowerCase())) {
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

  },
  mounted () {
    window.onresize = () => {
      this.debouncedCalculateLines()
    }
  },

  created () {
    this.debouncedCalculateLines = debounce(this.calcuteLines, 300)
    // this.getTags()
  }

}
</script>

<style>

  .fold{
    overflow: hidden;
    max-height: 4.5rem;
    transition: max-height 0.5s cubic-bezier(0, 1, 0, 1);
  }
  .unfold{
    overflow: hidden;
    max-height: 100rem;
    transition: max-height 1s ease-in-out;
  }
  .clickable{
    cursor: pointer;
  }

  /* 浮动按钮 固定在右下角 */
  .fixed{
    position:fixed;
    right: 8px;
    bottom: 64px;
  }

  .tag-icon{
    margin-left: 0.25rem;
  }

  .tag-count{
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
