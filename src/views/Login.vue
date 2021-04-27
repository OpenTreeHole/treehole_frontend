<template>
  <v-container fill-height>
    <!-- 警告信息 -->
    <message ref="message"></message>

    <v-row align="center" justify="center">
      <v-col cols="10" sm="8" md="6" lg="4" class="text-center">
        <v-card class="py-8" elevation="4">
          <h1>登录</h1>
          <v-form ref="form" v-model="valid" lazy-validation>
            <div class="pl-7 pr-10">
              <v-text-field
                v-model="username"
                label="用户名"
                prepend-icon="mdi-account"
                :clearable="!valid"
                :counter="16"
                :rules="nameRules"
              />

              <v-text-field
                v-model="password"
                label="密码"
                prepend-icon="mdi-lock"
                type="password"
                :clearable="!valid"
                :counter="32"
                :rules="passwordRules"
              />
            </div>
            <div class="px-10">
              <v-btn
                type="submit"
                class="my-4"
                color="primary"
                block
                :disabled="!valid"
                @click="login"
                >登录</v-btn
              >
            </div>

            <div>
              <v-btn text color="primary" href="#/licence"
                >登录意味着你同意这些协议</v-btn
              >
            </div>
            <div>
              <v-btn text color="primary" href="#/register"
                >没有账号？点此注册</v-btn
              >
            </div>
            <div>
              <v-btn text color="primary" onclick="alert('活该')"
                >忘记密码</v-btn
              >
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Message from '@/components/Message.vue'

export default {
  components: { Message },
  name: 'Login',
  data() {
    return {
      alert: false,
      valid: true,
      username: '',
      password: '',
      nameRules: [
        (v) => !!v || '用户名不能为空',
        (v) => v.length <= 16 || '用户名不能超过16字符',
      ],
      passwordRules: [
        (v) => !!v || '密码不能为空',
        (v) => v.length <= 32 || '密码不能超过32字符',
        (v) => v.length >= 8 || '密码不能少于8字符',
      ],
    }
  },
  methods: {
    login() {
      this.$refs.form.validate()
      this.$axios
        .post('login/', { username: this.username, password: this.password })
        .then((response) => {
          localStorage.setItem('token', 'Token ' + response.data.token)
          localStorage.setItem('username', this.username)
          this.$router.replace('/home')
        })
        .catch(() => {
          this.valid = false
          this.$refs.message.error('用户名或密码错误')
        })
    },
  },
}
</script>
