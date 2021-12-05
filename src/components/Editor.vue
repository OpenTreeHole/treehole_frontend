<template>
  <div>
    <!-- 内容部分 -->
    <div :id='this.contentName' name='description'></div>
    <!-- <div @click="test">test</div> -->

  </div>
</template>

<script lang='ts'>
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { Component, Prop } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import LocalStorageStore from '@/store/modules/LocalStorageStore'

@Component
export default class Editor extends BaseComponentOrView {
  @Prop({ type: String }) contentName: string

  public editor: Vditor

  public validate (): boolean {
    // if (!this.content || !this.content.replace(/<.?((p)|(br))>|\s+/g, '')) {
    if (!this.getContent()) {
      this.$emit('error', '内容不能为空')
      return false
    } else {
      return true
    }
  }

  public getContent (): string {
    return this.editor.getValue() // Markdown
    // return this.editor.getHTML()  HTML
  }

  public setContent (content: string): void {
    this.editor.setValue(content)
  }

  mounted () {
    const storageToken = LocalStorageStore.token
    this.editor = new Vditor(this.contentName, {
      height: 600,
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
        url: this.$feConfig.backEndApi + 'images',
        headers: { Authorization: storageToken || '' },
        multiple: false,
        fieldName: 'image',
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
  }

  created () {
  }
}
</script>
