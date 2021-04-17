<template>
  <v-container>
    <div id="information">
      <h1>FDU Hole</h1>
      <blockquote>
        Made with ❤ by
        <a href="https://github.com/fduhole" target="_blank">FDU-Hole-Dev</a>
      </blockquote>
      <v-btn color="primary" @click="reloadAll">重载</v-btn>
      <p>如果遇到问题，或需要升级，请点击重载按钮</p>
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
    <p>
      使用 FDU Hole 意味着你同意<router-link to="/licence"
        >这些协议</router-link
      >
    </p>
  </v-container>
</template>

<script>
export default {
  name: 'About',
  data() {
    return {
      latestVersion: '正在获取',
      installed: true,
      // installed:
      //   window.matchMedia('(display-mode: standalone)').matches ||
      //   window.navigator.standalone,
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
          url: 'https://purge.jsdelivr.net/gh/fduhole/vue/package.json',
          transformRequest: [
            (data, headers) => {
              delete headers.Authorization
              return data
            },
          ],
        })
        .catch((error) => {
          this.latestVersion = '获取失败 ' + error.message
        }) // 刷新 cdn 版本号缓存
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
    reloadAll() {
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = '/'
      document.body.appendChild(form)
      form.submit()
      location.href = '/'
    },
  },
  mounted() {
    this.getLatestVersion()
  },
}
</script>
