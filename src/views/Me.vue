<template>
  <v-container>
    <message ref="message"></message>
    <v-card>
      <v-card-text>欢迎回来~</v-card-text>
      <v-row>
        <v-card-title>{{ profile.user.username }} </v-card-title>
      </v-row>
    </v-card>
    <v-row class="mdui-col-xs-2">
      <v-col></v-col>
      <v-btn>退出登录</v-btn>
      <v-btn>重置密码</v-btn>
    </v-row>
  </v-container>
</template>

<script>
import Message from '@/components/Message.vue'

export default {
  name: 'Me',
  components: { Message },
  data() {
    return {
      profile: {},
    }
  },
  methods: {
    getUserInfo() {
      this.$axios
        .get('/profile/')
        .then((r) => {
          this.profile = r.data
        })
        .catch((e) => {
          this.$refs.message.error(e.r.data.msg)
        })
    },
    logout() {
      localStorage.clear()
      this.reloadAll()
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.getUserInfo()
      },
    },
  },
}
</script>
