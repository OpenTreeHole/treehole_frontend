<template>
  <v-container class="liscence">
    <div id="community-agreement">
      <h2>社区公约</h2>
      <iframe :src="communityAgreement" frameborder="0"></iframe>
    </div>
    <div id="terms-of-use">
      <h2>使用条款</h2>
      <iframe :src="termsOfUse" frameborder="0"></iframe>
    </div>
    <div id="privacy-policy">
      <h2>隐私政策</h2>
      <iframe :src="privacyPolicy" frameborder="0"></iframe>
    </div>
    <!-- <div id="open-source-liscences">
      <h2>开源协议</h2>
      <iframe :src="openSourceLiscences" frameborder="0"></iframe>
    </div> -->
  </v-container>
</template>

<script>
export default {
  name: 'Liscence',
  data() {
    return {
      communityAgreement: '/docs/community-agreement.html',
      termsOfUse: '/docs/terms-of-use.html',
      privacyPolicy: '/docs/privacy-policy.html',
      openSourceLiscences: '/docs/open-source-liscences.html',
    }
  },
}
</script>

<style scoped>
iframe {
  width: 100%;
  height: 80vh;
}
</style>