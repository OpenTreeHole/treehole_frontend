<template>
  <v-container>
    <div id="information">
      <h1>FDU Hole</h1>
      <blockquote>
        Made with ❤ by
        <a href="https://github.com/fduhole" target="_blank">FDU-Hole-Dev</a>
      </blockquote>
      <v-btn color="primary" @click.stop="refreshAll">刷新应用</v-btn>
      <p>如果遇到问题，或需要升级，请点击此按钮</p>
      <div class="installed" v-if="installed">
        <p>
          当前版本：{{ $feConfig.feVersion }}<br />
          最新版本：{{ latestVersion }}
        </p>
        <p v-if="updateAvailable">检测到新版本，刷新应用以升级！</p>
      </div>
      <div class="not-installed" v-if="!installed">
        请<span>安装本应用</span>以获得更好的体验！
      </div>
    </div>
    <div id="community-agreement"><h2>社区公约</h2></div>
    <div id="terms-of-use"><h2>使用条款</h2></div>
    <div id="privacy-policy"><h2>隐私政策</h2></div>
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
          this.updateAvailable = this.compareVersion()
        })
        .catch((error) => {
          this.latestVersion = '获取失败 ' + error.message
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
