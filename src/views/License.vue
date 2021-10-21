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
          {{ license.title }}
        </v-expansion-panel-header>
        <v-expansion-panel-content style='overflow: auto'>
          <div class='license-view' v-html='license.content'></div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script lang='ts'>
import marked from 'marked'
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class License extends Vue {
  public licenses:Array<any> = []

  created () {
    for (const license of this.$feConfig.licenses) {
      ((license) => {
        this.$axios
          .request({
            url: license.link,
            transformRequest: [
              (data: any, headers: { Authorization: any }) => {
                delete headers.Authorization
                return data
              }
            ]
          })
          .then((response: { data: any }) => {
            this.licenses.push({
              title: license.name,
              content: marked(response.data)
            })
          })
          .catch((error: { message: string }) => {
            this.licenses.push({
              title: license.name,
              content: '获取失败：' + error.message
            })
          })
      })(license)
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
