<template>
  <div>
    <div class="text-center">
      <!-- 上传进度显示 -->
      <v-overlay :value="overlay">
        <div class="text-h5 py-4 lime--text">{{ overlayMsg }}</div>
        <v-progress-circular
          indeterminate
          color="teal"
          size="64"
        ></v-progress-circular>
      </v-overlay>
    </div>

    <!-- 内容部分 -->
    <quill-editor v-model="content" ref="editor" :options="editorOption">
    </quill-editor>
  </div>
</template>

<script>
import hljs from 'highlight.js'
import 'highlight.js/styles/dracula.css'

import { quillEditor, Quill } from 'vue-quill-editor'
import {
  container,
  ImageExtend,
  QuillWatch,
} from 'quill-image-super-solution-module'
// import ImageResize from 'quill-image-resize-module'

// Quill.register('modules/ImageResize', ImageResize)
Quill.register('modules/ImageExtend', ImageExtend)
export default {
  name: 'editor',
  props: ['contentName'],

  data() {
    return {
      editorOption: {
        placeholder: '说些什么 ...',
        theme: 'snow',
        modules: {
          // history: {          //自动保存
          //     delay: 1000,
          //     maxStack: 100,
          //     userOnly: false
          // },
          syntax: {
            // 代码高亮
            highlight: (text) => hljs.highlightAuto(text).value,
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
            action: this.$feConfig.backEndApi + 'images/',
            // 可选 可上传的图片格式
            accept:
              'image/jpg, image/png, image/gif, image/jpeg, image/bmp, image/x-icon, image/svg+xml, image/webp',
            // response 为一个函数用来获取服务器返回的具体图片地址
            // 例如服务器返回 {code: 200; data:{ url: 'baidu.com'}}
            // 则 return res.data.url
            response: (res) => {
              return res.url
            },
            // 可选参数 设置请求头部
            headers: (xhr) => {
              xhr.setRequestHeader(
                'Authorization',
                localStorage.getItem('token')
              )
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
            },
            // 可选参数 选择图片触发，也可用来设置头部，但比headers多了一个参数，可设置formData
            // change: (xhr, formData) => {
            //     formData.append("example", "test");
            // },
          },
          toolbar: {
            container: [
              ['bold', 'italic', 'strike', { header: 1 }],
              ['blockquote', 'code-block', 'link', 'image'],
            ],
            handlers: {
              image: function () {
                // 劫持原来的图片点击按钮事件
                QuillWatch.emit(this.quill.id)
              },
            },
          },
        },
      },
      content: '',
      overlay: false,
      overlayMsg: '上传中...',
    }
  },

  methods: {
    validate() {
      if (!this.content || !this.content.replace(/<.?((p)|(br))>|\s+/g, '')) {
        this.$emit('invalid', '内容不能为空')
        return false
      } else {
        return true
      }
    },
  },

  watch: {
    content() {
      if (!this.content) {
        localStorage.removeItem(this.contentName)
      } else {
        localStorage.setItem(this.contentName, this.content)
      }
    },
  },

  created() {
    this.content = localStorage.getItem(this.contentName)
  },
}
</script>