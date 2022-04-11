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
import { uploadImage } from '@/apis/api'

@Component
export default class AppEditor extends BaseComponentOrView {
  @Prop({ type: String }) contentName: string

  editor: Vditor

  validate (): boolean {
    if (!this.getContent()) {
      this.messageError('内容不能为空')
      return false
    } else {
      return true
    }
  }

  getContent (): string {
    return this.editor.getValue() // Markdown
    // return this.editor.getHTML()  HTML
  }

  setContent (content: string): void {
    this.editor.setValue(content)
  }

  async mounted () {
    const toolbar = this.isMobile ? [
      'headings', 'bold', 'italic', 'strike', '|',
      'line', 'quote', 'list', 'code', '|',
      'emoji', 'link', 'upload',
      {
        name: 'more',
        toolbar: ['export', 'outline', 'preview', 'devtools', 'info', 'help']
      }
    ]
      : [
        'emoji',
        'headings',
        'bold',
        'italic',
        'strike',
        'link',
        '|',
        'list',
        'ordered-list',
        'check',
        'outdent',
        'indent',
        '|',
        'quote',
        'line',
        'code',
        'inline-code',
        'insert-before',
        'insert-after',
        '|',
        'upload',
        'record',
        'table',
        '|',
        'undo',
        'redo',
        '|',
        'edit-mode',
        'content-theme',
        'code-theme',
        'export',
        {
          name: 'more',
          toolbar: [
            'fullscreen',
            'both',
            'preview',
            'info',
            'help'
          ]
        }]
    this.editor = new Vditor(this.contentName, {
      height: window.innerHeight - 375,
      placeholder: '说些什么......',
      toolbarConfig: {
        pin: false
      },
      toolbar: toolbar,
      icon: 'material',
      cache: {
        enable: true
      },
      counter: {
        enable: true
      },
      upload: {
        accept: 'image/*',
        handler: (files: File[]) => new Promise<null>(resolve => {
          for (const file of files) {
            const reader = new FileReader()
            reader.onload = async (e) => {
              if (e.target) {
                const { url } = await uploadImage((e.target.result as string).split(',')[1])
                this.editor.insertValue(`![](${url})`)
              }
              resolve(null)
            }
            reader.readAsDataURL(file)
          }
        }),
        multiple: false,
        fieldName: 'image'
      }
    })
  }

  async created () {
  }
}
</script>
