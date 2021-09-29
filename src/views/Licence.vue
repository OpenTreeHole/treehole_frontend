<template>
  <v-container class='licence'>
    <div>
      <p>使用 FDU Hole 意味着你同意以下协议。</p>
      <p>
        如果您不同意以下协议，请立即删除该应用，关闭此网站，停止使用 FDU Hole
        提供的的服务。
      </p>
    </div>
    <v-expansion-panels>
      <v-expansion-panel v-for='(licence, i) in licences' :key='i'>
        <v-expansion-panel-header>
          {{ licence.title }}
        </v-expansion-panel-header>
        <v-expansion-panel-content style='overflow: auto'>
          <div class='licence-view' v-html='licence.content'></div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script>
export default {
  name: 'Licence',
  data () {
    return {
      licences: []
    }
  },
  created () {
    for (var licence of this.$feConfig.licences) {
      ;((licence) => {
        this.$axios
          .request({
            url: licence.link,
            transformRequest: [
              (data, headers) => {
                delete headers.Authorization
                return data
              }
            ]
          })
          .then((response) => {
            this.licences.push({
              title: licence.name,
              content: this.$marked(response.data)
            })
          })
          .catch((error) => {
            this.licences.push({
              title: licence.name,
              content: '获取失败：' + error.message
            })
          })
      })(licence)
    }
  }
}
</script>

<style scoped>
.v-expansion-panels {
  margin: auto;
  width: 80%;
}

.licence-view {
  width: 100%;
  height: 40vh;
}
</style>
