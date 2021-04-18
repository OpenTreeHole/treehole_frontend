<template>
  <v-container>
    <v-card
      ><h1>FDU Hole</h1>
      <p>
        Made with ❤ by
        <a href="https://github.com/fduhole" target="_blank">FDU-Hole-Dev</a>
      </p></v-card
    >

    <v-card v-if="installed">
      <p>
        当前版本：{{ $feConfig.feVersion }}<br />
        最新版本：{{ latestVersion }}
      </p>
      <p v-if="updateAvailable">检测到新版本，重载应用以升级！</p>
    </v-card>

    <v-card v-if="!installed">
      请<span>安装本应用</span>以获得更好的体验！
    </v-card>

    <v-card>
      使用 FDU Hole 意味着你同意<router-link to="/licence"
        >相关协议</router-link
      >
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'About',
  data() {
    return {
      latestVersion: '正在获取',
      installed:
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone,
      updateAvailable: false,
    }
  },
  methods: {
    compareVersion() {
      const currentVersion = this.$feConfig.feVersion.split('.')
      const latestVersion = this.latestVersion.split('.')
      return (
        latestVersion[0] > currentVersion[0] ||
        latestVersion[1] > currentVersion[1] ||
        latestVersion[2] > currentVersion[2]
      )
    },
    getLatestVersion() {
      this.$axios
        .request({
          url: 'https://cdn.jsdelivr.net/gh/fduhole/vue/package.json',
          transformRequest: [
            (data, headers) => {
              delete headers.Authorization
              return data
            },
          ],
        })
        .then((response) => {
          this.latestVersion = response.data.version
          this.updateAvailable = this.compareVersion()
        })
        .catch((error) => {
          this.latestVersion = '获取失败 ' + error.message
        })
    },
  },
  mounted() {
    this.getLatestVersion()
  },
}
</script>
