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
      <v-expansion-panel v-for="(licence, i) in licences" :key="i">
        <v-expansion-panel-header>
          {{ licence.name }}
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <iframe :src="licence.link" frameborder="0"></iframe>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script>
export default {
  name: 'Licence',
  data() {
    return {
      licences: [
        {
          name: '社区公约',
          link: '/docs/community-agreement.html',
        },
        {
          name: '使用条款',
          link: '/docs/terms-of-use.html',
        },
        {
          name: '隐私政策',
          link: '/docs/privacy-policy.html',
        },
        // {
        //   name: '开源协议',
        //   link: '/docs/open-source-licences.html',
        // },
      ],
    }
  },
}
</script>

<style scoped>
iframe {
  width: 100%;
  height: 50vh;
}
</style>