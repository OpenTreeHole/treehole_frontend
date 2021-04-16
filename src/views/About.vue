<template>
  <v-container>
    <div id="information">
      <h1>FDU Hole</h1>
      <blockquote>
        Made with ❤ by <a href="https://github.com/fduhole">FDU-Hole-Dev</a>
      </blockquote>
      <p>
        当前版本：{{ $feConfig.feVersion }}<br />
        最新版本：{{ getLatestVersion }}
      </p>
      <p v-if="updateAvailable">
        检测到新版本：
        <v-btn @click.stop="refreshAll">立即更新</v-btn>
      </p>
    </div>
    <div id="privacy-policy"></div>
  </v-container>
</template>

<script>
export default {
  name: 'About',
  data() {
    return {
      updateAvailable: false,
    }
  },
  computed: {
    getLatestVersion() {
      return '0.1.0'
      // 还没写，直接从服务器的前端查询版本号，如果有更新，则显示立即刷新按钮
    },
  },
  methods: {
    refreshAll() {},
  },
}
</script>
