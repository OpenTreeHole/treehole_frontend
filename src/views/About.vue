<template>
  <v-container>
    <div id="information">
      <h1>FDU Hole</h1>
      <blockquote>
        Made with ❤ by <a href="https://github.com/fduhole">FDU-Hole-Dev</a>
      </blockquote>
      <div class="installed" v-if="installed">
        <p>
          当前版本：{{ $feConfig.feVersion }}<br />
          最新版本：{{ latestVersion }}
        </p>
        <p v-if="updateAvailable">
          检测到新版本：
          <v-btn @click.stop="refreshAll">立即更新</v-btn>
        </p>
      </div>
    </div>
    <div id=""></div>
    <div id="privacy-policy"></div>
  </v-container>
</template>

<script>
export default {
  name: 'About',
  data() {
    return {
      latestVersion: '正在获取',
      installed: true,
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
      this.$axios
        .get('https://cdn.jsdelivr.net/gh/fduhole/vue/package.json')
        .then((response) => {
          this.latestVersion = response.data.version
          this.updateAvailable = compareVersion()
        })
        .catch((error) => {
          this.latestVersion = '获取失败'
        })
    },
    refreshAll() {},
  },
  mounted() {
    this.getLatestVersion()
  },
}
</script>
