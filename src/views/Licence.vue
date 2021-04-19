<template>
  <v-container class="licence">
    <div>
      <p>使用 FDU Hole 意味着你同意以下协议。</p>
      <p>
        如果您不同意以下协议，请立即删除该应用，关闭此网站，停止使用 FDU Hole
        提供的的服务。
      </p>
    </div>
    <v-expansion-panels>
      <v-expansion-panel v-for="(licence, i) in $feConfig.licences" :key="i">
        <v-expansion-panel-header>
          {{ licence.name }}
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <div class="licence-view" v-html="getLicence(licence.path)"></div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script>
export default {
  name: 'Licence',
  methods: {
    getLicence(path) {
      this.$axios
        .request({
          url: path,
          transformRequest: [
            (data, headers) => {
              delete headers.Authorization
              return this.$marked(data)
            },
          ],
        })
        .then((response) => {
          return response.data
        })
        .catch((error) => {
          return '获取失败：' + error.message
        })
    },
  },
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