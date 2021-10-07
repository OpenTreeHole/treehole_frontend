<template>
  <div>
    <!-- 内容部分 -->
    <div :id='this.contentName' name='description'></div>
    <!-- <div @click="test">test</div> -->

  </div>
</template>

<script>
import Vditor from 'vditor'
import 'vditor/dist/index.css'

export default {
  name: 'editor',
  props: ['contentName'],

  data () {
    return {
      editor: null
    }
  },

  methods: {
    validate () {
      // if (!this.content || !this.content.replace(/<.?((p)|(br))>|\s+/g, '')) {
      if (!this.getContent()) {
        this.$emit('error', '内容不能为空')
        return false
      } else {
        return true
      }
    },
    test () {
      console.log(this.getHTML())
    },
    getContent () {
      return this.editor.getValue() // Markdown
      // return this.editor.getHTML()  HTML
    },
    setContent (content) {
      this.editor.setValue(content)
    }
  },

  computed: {},
  mounted () {
    this.editor = new Vditor(this.contentName, {
      height: 360,
      placeholder: '说些什么......',
      toolbarConfig: {
        pin: false
      },
      toolbar: [
        'headings', 'bold', 'italic', 'strike', '|',
        'line', 'quote', 'list', 'code', '|',
        'emoji', 'link', 'upload',
        {
          name: 'more',
          toolbar: ['export', 'outline', 'preview', 'devtools', 'info', 'help']
        }
      ],
      icon: 'material',
      cache: {
        enable: true
      },
      counter: {
        enable: true
      },
      hint: {
        // emoji: {}
      },
      upload: {
        accept: 'image/*',
        url: 'https://www.fduhole.com/api/images/',
        headers: { Authorization: localStorage.getItem('token') },
        multiple: false,
        fieldName: 'img',
        linkToImgCallback () {
          console.log('api处理')
        },
        success: (editor, response) => {
          const url = JSON.parse(response).url
          this.editor.insertValue(`![](${url})`)
          return true
        },
        error: (response) => {
          console.log(response)
          this.$emit('error', response)
        }
      },
      after: () => {
        // this.editor.setValue("hello,Vditor+Vue!")
      }
    })
  },

  created () {
  }
}
</script>
