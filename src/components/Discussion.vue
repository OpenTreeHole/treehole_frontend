<template>
<v-container >

  <v-row justify="center">
    <v-col>
      <v-alert type="error" transition="fade-transition" :value="alert" >{{alertMessage}}</v-alert>
    </v-col>
  </v-row>

  <v-row v-for="(post, index) in posts" :key="index" justify="center" align="start">
    <v-col cols="12" sm="10" md="8" lg="6" xl="4">

      <v-card :id="index">
        <v-card-text class="pb-1 pt-2 text-body-2" >
          <p> {{ post['username']}} </p>
        </v-card-text>

        <v-card-text class="py-0">

          <!-- 回复部分 -->
          <div v-if="post['reply_to']" class="reply text-body-2">
            <!-- 回复框顶栏 -->
            <div>
              <span>
                {{ post.reply_to.username }}
              </span>
              <v-icon @click="scrollTo(index, getIndex(post.reply_to.id))" small style="float:right">
                mdi-arrow-collapse-up
              </v-icon>
            </div>
            <div>
              {{ post.reply_to.content | plain-text }}
            </div>
          </div>

          <!-- 正文部分 -->
          <div
            @click="reply(post['id'])"
            class="ma-0 text-body-1 clickable"
            id="rich-text"
            v-ripple
            v-html="post.content"
          >
          </div>

        </v-card-text>

        <!-- 脚标 -->
        <v-card-text class="text-center text-body-2 pb-2">
          <span style="float:left">
            #{{ index }}
          </span>
          <span style="float:right">
            {{ post['date_created'] | timeDifference }}
          </span>
          <p></p>
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
          color="primary"
          class="fixed"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon>mdi-send</v-icon>
        </v-btn>
      </template>

      <v-card>

        <v-card-title>
          <span class="headline">发表回复</span>
        </v-card-title>

        <v-card-text>

          <!-- 警告信息 -->
          <v-alert type="error" transition="fade-transition" :value="formAlert" >{{formAlertMessage}}</v-alert>

          <!-- 回复内容 -->
           <div v-if="replyIndex != null" class="reply text-body-2">
            <div >
              <span >
                {{ posts[replyIndex]['username'] }}
              </span>
            </div>
            <div>
              {{ posts[replyIndex].content | plain-text }}
            </div>
          </div>
         
          <v-form ref="form" v-model="valid" lazy-validation>   <!-- 回贴表单 -->
            
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
            
            <quill-editor
              v-model="content"
              ref="editor"
              :options="editorOption"
            >
            </quill-editor>
          </v-form>

        </v-card-text>

        <!-- 下方按钮 -->
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
            @click="addPost"
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
      posts: [],
      page: 1,
      // 回复信息（可选回复）
      replyIndex: null, // 回复的贴子在 posts 数组中的序列
      replyPk: null, // 回复的贴子的 id
      // 发帖表单
      editorOption: {
        debug: 'warning',
        placeholder: '说些什么 ...',
        theme: 'snow',
        modules: {
          syntax: { // 代码高亮
            highlight: text => hljs.highlightAuto(text).value
          },
          // ImageResize: {},
          ImageExtend: {
            // 可选参数 是否显示上传进度和提示语
            loading: false,
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
            end: () => {
            },
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
              // 'image': value => {
              //   if(value){ this.$refs.upload.click()}
              //   else{this.quill.format('image', false)}
              // }
            }
          }
        }
      },
      dialog: false,
      overlay: false,
      overlayMsg: '上传中...',
      content: '',
      requiredRules: [v => !!v || '内容不能为空'],
      valid: true,
      // 底部加载
      isLoading: true
    }
  },

  methods: {
    closeDialog(){
      this.dialog = false
      this.replyIndex = null
      this.replyPk = null
    },

    getIndex (pk) { // 接受一个 post 的 pk 并返回它在本页中的顺序（index）
      for (let i = 0; i < this.posts.length; i++) {
        if (this.posts[i].id === pk) {
          return i
        }
      }
      return 0
    },

    scrollTo (current_id, to_id) {
      const currentOffsetTop = document.getElementById(current_id).offsetTop
      const toOffsetTop = document.getElementById(to_id).offsetTop
      const scrollDistance = toOffsetTop - currentOffsetTop
      window.scrollBy({
        top: scrollDistance, //  正值向下
        left: 0,
        behavior: 'smooth'
      })
    },

    reply (pk) { // 接受一个 post 的 pk 并设置其为回复目标
      this.replyIndex = this.getIndex(pk)
      this.replyPk = pk
      this.dialog = true
    },

    getPosts (page = this.page) {
      return this.$axios
        .get('posts/', { params: { id: this.$route.params.id, page: page } })
        .then(response => {
          this.alert = false
          this.page++
          this.posts.push.apply(this.posts, response.data)
        })
        .catch((error) => {
          console.log(error.response)
          this.alert = true
          this.alertMessage = error.response.data.msg
        })
    },

    addPost () {
      if (this.$refs.form.validate()) {
        this.$axios
          .post('posts/', {
            content: this.content,
            discussion_id: this.$route.params.id,
            post_id: this.replyPk
          })
          .then(() => {
          // 重新加载页面
            this.posts = []
            this.page = 1
            this.getPosts()
            // 关闭对话框并重置回复信息
            this.dialog = false
            this.replyIndex = null
            this.replyPk = null
            // 重置 formAlert 信息
            this.formAlert = false
            this.formAlertMessage = ''
          })
          .catch((error) => {
            console.log(error.response)
            this.formAlert = true
            this.formAlertMessage = error.response.data.msg
          })
      }
    },

    async load () {
      if (this.posts.length % 10 !== 0) {
        this.isLoading = false
        return
      }
      const beforeLength = this.posts.length
      await this.getPosts()
      const afterLength = this.posts.length
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

  },
  mounted () {

  },

  created () {

  }

}
</script>

<style scoped>
  /* 回复模块 */
  .reply{
    margin: 0rem 1rem 0rem 1rem;
    margin-bottom: 1rem;
    padding: 0.5rem 0.5rem 0rem 0.5rem;
    background-color: #FFF3E0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
  }

  /* 可点击 */
  .clickable{
    cursor: pointer;
  }

  /* 浮动按钮 固定在右下角 */
  .fixed{
    position:fixed;
    right: 8px;
    bottom: 64px;
  }

</style>
