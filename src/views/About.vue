<template>
  <v-container>
    <div id="information">
      <h1>FDU Hole</h1>
      <blockquote>
        Made with ❤ by
        <a href="https://github.com/fduhole" target="_blank">FDU-Hole-Dev</a>
      </blockquote>
      <div class="installed" v-if="installed">
        <p>
          当前版本：{{ $feConfig.feVersion }}<br />
          最新版本：{{ latestVersion }}
        </p>
        <p v-if="updateAvailable">
          检测到新版本：
          <v-btn color="primary" @click.stop="refreshAll">立即更新</v-btn>
        </p>
      </div>
      <div class="not-installed">
        请<span>安装本应用</span>以获得更好的体验！
      </div>
    </div>
    <div id=""></div>
    <div id="privacy-policy"></div>
  </v-container>
</template>

<script>
import axios from 'axios'

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
      const currentVersion = $feConfig.feVersion.split('.')
      const latestVersion = latestVersion.split('.')
      return (
        latestVersion[0] > currentVersion[0] ||
        latestVersion[1] > currentVersion[1] ||
        latestVersion[2] > currentVersion[2]
      )
    },
    getLatestVersion() {
      axios
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
          this.updateAvailable = compareVersion()
        })
        .catch((error) => {
          this.latestVersion = '获取失败: ' + error.message
        })
    },
    refreshAll() {
      // this.$router.go(0, () => {
      //   this.$router.push('home')
      // })
      window.location.replace('/')
    },
  },
  mounted() {
    this.getLatestVersion()
  },
}
</script>
