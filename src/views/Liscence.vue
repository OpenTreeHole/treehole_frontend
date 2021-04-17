<template>
  <v-container class="liscence">
    <div id="community-agreement"><h2>社区公约</h2></div>
    <div id="terms-of-use"><h2>使用条款</h2></div>
    <div id="privacy-policy"><h2>隐私政策</h2></div>
    <div id="open-source-liscences"><h2>开源协议</h2></div>
  </v-container>
</template>

<script>
export default {
  name: 'Liscence',
  data() {
    return {
      communityAgreement: {},
      termsOfUse: {},
      privacyPolicy: {},
      openSourceLiscences: {},
    }
  },
}
</script>

<style scoped>
</style>