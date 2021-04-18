<template>
  <v-container fill-height>
    <message ref="message"></message>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4" class="text-center">
        <v-card class="py-8" elevation="4">
          <div class="text-h4 pb-2">欢迎注册</div>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-alert
              class="my-4"
              transition="slide-y-transition"
              :type="alertType"
              :value="isAlert"
              >{{ alertMsg }}</v-alert
            >
            <div class="pl-7 pr-10">
              <v-text-field
                v-model="username"
                label="用户名"
                prepend-icon="mdi-account"
                :error-messages="errorMsg['username']"
                :clearable="!valid"
                :counter="16"
                :rules="notEmptyRules"
              />

              <v-text-field
                v-model="email"
                label="edu邮箱"
                prepend-icon="mdi-email"
                :error-messages="errorMsg['email']"
                :clearable="!valid"
                :counter="32"
                :rules="notEmptyRules"
              />
              <v-row
                align="center"
                justify="center"
                style="margin-bottom: -12px"
              >
                <v-col cols="6" sm="8">
                  <v-text-field
                    v-model="code"
                    label="邮件验证码"
                    prepend-icon="mdi-email-check"
                    :error-messages="errorMsg['code']"
                    :clearable="!valid"
                    :counter="6"
                    :rules="codeRules"
                  />
                </v-col>
                <v-col cols="6" sm="4">
                  <v-btn
                    color="primary"
                    block
                    :disabled="!sendValid"
                    @click="sendCode"
                  >
                    {{ sendButton }}
                  </v-btn>
                </v-col>
              </v-row>

              <v-text-field
                v-model="password"
                label="密码"
                type="password"
                prepend-icon="mdi-lock"
                :clearable="!valid"
                :counter="32"
                :rules="passwordRules"
              />

              <v-text-field
                v-model="password2"
                label="重复密码"
                type="password"
                prepend-icon="mdi-lock"
                :error-messages="errorMsg['password']"
                :clearable="!valid"
                :counter="32"
                :rules="passwordRules"
              />
              <v-row
                align="center"
                justify="center"
                style="margin-bottom: -12px"
              >
                <v-checkbox v-model="agreeLicences" label="同意"></v-checkbox
                ><router-link to="/licence">相关协议</router-link>
              </v-row>
            </div>

            <div class="px-10">
              <v-btn
                class="my-4"
                color="success"
                block
                :disabled="!(agreeLicences && valid)"
                @click="register"
                >注册</v-btn
              >
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import debounce from 'lodash.debounce'
import Message from '@/components/Message.vue'
export default {
  components: { Message },
  data() {
    return {
      // 同意协议
      agreeLicences: false,
      // 表单信息
      username: '',
      password: '',
      password2: '',
      email: '',
      // 发送验证码信息
      code: '',
      sendButton: '发送验证码',
      sendValid: true,
      // 验证信息
      valid: true,
      isAlert: false,
      alertMsg: '',
      alertType: 'info',
      errorMsg: {
        username: '',
        email: '',
        password: '',
      },
      notEmptyRules: [(v) => !!v || '内容不能为空'],
      // emailRules: [
      //   v => /^([0-9]{11})@fudan\.edu\.cn$/.test(v) || '@fudan.edu.cn'
      // ],
      codeRules: [
        (v) => !!v || '内容不能为空',
        (v) => /^[0-9]{6}$/.test(v) || '验证码格式不对',
      ],
      passwordRules: [
        (v) => !!v || '内容不能为空',
        (v) => v.length <= 32 || '密码不能超过32字符',
        (v) => v.length >= 8 || '密码不能少于8字符',
      ],
    }
  },
  methods: {
    checkUsername() {
      if (!this.username) {
        this.errorMsg.username = '用户名不能为空'
      } else if (this.username.length > 16) {
        this.errorMsg.username = '用户名不能超过16字符'
      } else if (this.username.length < 3) {
        this.errorMsg.username = '用户名不能少于3字符'
      } else {
        this.$axios
          .get('register/', { params: { username: this.username } })
          .then((response) => {
            if (response.data.data !== 0) {
              this.errorMsg.username = response.data.msg
            } else {
              this.errorMsg.username = ''
            }
          })
      }
    },

    checkEmail() {
      if (!/^([0-9]{11})@fudan\.edu\.cn$/.test(this.email)) {
        this.errorMsg.email = '@fudan.edu.cn'
      } else {
        this.$axios
          .get('register/', { params: { email: this.email } })
          .then((response) => {
            if (response.data.data !== 0) {
              this.errorMsg.email = response.data.msg
            } else {
              this.errorMsg.email = ''
            }
          })
      }
    },

    checkPassword() {
      if (this.password !== this.password2) {
        this.errorMsg.password = '两次输入不一致'
      } else {
        this.errorMsg.password = ''
      }
    },

    sendCode() {
      this.sendButtonChangeStatus()
      if (!this.username || !this.email) {
        this.$refs.message.error('用户名与邮箱不能为空')
        return
      }
      this.$refs.message.info('验证码已发送, 请检查邮件以继续')
      this.$axios
        .get('register/', {
          params: { username: this.username, email: this.email },
        })
        .then((response) => {
          if (response.data.data !== 0) {
            this.$refs.message.error(response.data.msg)
          } else {
            this.$refs.message.success(response.data.msg)
          }
        })
    },

    sendButtonChangeStatus() {
      this.sendValid = false
      for (let i = 60; i >= 0; i--) {
        setTimeout(() => {
          this.sendButton = i
          if (this.sendButton === 0) {
            this.sendButton = '发送验证码'
            this.sendValid = true
          }
        }, 1000 * (60 - i))
      }
    },

    register() {
      if (this.$refs.form.validate()) {
        this.$axios
          .post('register/', {
            username: this.username,
            email: this.email,
            password: this.password,
            code: this.code,
          })
          .then((response) => {
            if (response.data.data === 0) {
              // 注册成功后直接跳转到主页面
              this.$refs.message.success('注册成功，跳转至登录页面......')
              localStorage.setItem('newcomer', 'true')
              this.login()
            } else {
              this.$refs.message.error(response.data.msg)
            }
          })
          .catch(() => {
            this.$refs.message.error('网络错误')
          })
      }
    },

    login() {
      this.$axios
        .post('login/', { username: this.username, password: this.password })
        .then((response) => {
          localStorage.setItem('token', 'Token ' + response.data.token)
          localStorage.setItem('username', this.username)
          setTimeout(() => {
            this.$router.push('/home')
          }, 1000)
        })
        .catch(() => {
          this.valid = false
          this.$refs.message.error('用户名或密码错误')
        })
    },
  },
  watch: {
    username: function () {
      this.debouncedCheckUsername()
    },
    email: function () {
      this.debouncedCheckEmail()
    },
    password2: function () {
      this.debouncedCheckPassword()
    },
  },
  created: function () {
    this.debouncedCheckUsername = debounce(this.checkUsername, 500)
    this.debouncedCheckEmail = debounce(this.checkEmail, 1000)
    this.debouncedCheckPassword = debounce(this.checkPassword, 500)
  },
}
</script>