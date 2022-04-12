<template>
  <v-container class='license'>
    <div>
      <p>使用 FDU Hole 意味着你同意以下协议。</p>
      <p>
        如果您不同意以下协议，请立即删除该应用，关闭此网站，停止使用 FDU Hole
        提供的的服务。
      </p>
    </div>
    <v-expansion-panels>
      <v-expansion-panel v-for='(license, i) in licenses' :key='i'>
        <v-expansion-panel-header>
          {{ license.name }}
        </v-expansion-panel-header>
        <v-expansion-panel-content style='overflow: auto'>
          <div v-if='license.type==="pdf"'>
            <pdf
              v-for='i in license.numPages'
              :key='i'
              :src='license.loadingTask'
              :page='i'
            ></pdf>
          </div>
          <div v-else class='license-view' v-html='license.content'></div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script lang='ts'>
import { Component } from 'vue-property-decorator'
import { convertKatex } from '@/utils/utils'
import marked from 'marked'
import BaseView from '@/mixins/BaseView.vue'
import pdf from 'vue-pdf'

@Component({
  components: {
    pdf
  }
})
export default class LicensePage extends BaseView {
  licenses: Array<any> = []

  async created () {
    for (const license of this.$feConfig.licenses) {
      if (license.type === 'pdf') {
        const loadingTask = pdf.createLoadingTask(license.link)
        const v = await loadingTask.promise
        const numPages = v.numPages
        this.licenses.push({ ...license, loadingTask, numPages })
      } else {
        const r = await fetch(license.link)
        const text = await r.text()
        this.licenses.push({ ...license, content: marked(convertKatex(text)) })
      }
    }
  }
}
</script>

<style scoped>
.v-expansion-panels {
  margin: auto;
  width: 80%;
}

.license-view {
  width: 100%;
  height: 40vh;
}
</style>
