<template>
  <v-container>
    <message ref="message"></message>
    <v-card>
      <v-card-text>欢迎回来~</v-card-text>
      <v-row>
        <v-card-title>{{ profile.user.username }} </v-card-title>
      </v-row>
    </v-card>
    <v-row justify="center" style="margin: 20px 0"
      ><v-btn color="primary" width="40%" @click="changePassWd">
        修改密码
      </v-btn>
      <v-btn color="error" width="40%" @click="logout">退出登录</v-btn></v-row
    >
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
    changePassWd() {
      alert('还没写完')
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
