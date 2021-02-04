<template>
 <v-row align="center" justify="center">
    <v-col cols="10" sm="8" md="6" lg="4" xl="3" class="text-center" >
      <v-card class="py-8 px-10" elevation="4">
        
        <h1 @click="alert = true">注册</h1>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-alert class="my-4" transition="slide-y-transition" :type="alertType" :value="isAlert" >{{alertMsg}}</v-alert>
          <div >
            <v-text-field 
              v-model="username"
              label="用户名"
              :error-messages="errorMsg['username']"
              :clearable="!valid"
              :counter="16"
              :rules="nameRules"
            />
          </div>

          <div >
            <v-text-field 
              v-model="email"
              label="edu邮箱"
              :error-messages="errorMsg['email']"
              :clearable="!valid"
              :counter="32"
              :rules="emailRules"
            />
          </div>

          <div >
            <v-text-field
              v-model="password"
              label="密码"
              type="password"
              :clearable="!valid"
              :counter="32"
              :rules="passwordRules"
            />
          </div>

          <div >
            <v-text-field
              v-model="password2"
              label="重复密码"
              type="password"
              :error-messages="errorMsg['password']"
              :clearable="!valid"
              :counter="32"
              :rules="passwordRules"
            />
          </div>

          <v-btn class="my-4" color="success" block :disabled="!valid" @click="sendEmail">注册</v-btn>

        </v-form>

      </v-card>
      
    </v-col>
  </v-row>

</template>

<script>
import debounce from 'lodash.debounce'
export default {
  data () {
    return {
      username: '',
      password: '',
      password2: '',
      email: '',
      valid: true, 
      isAlert: false,
      alertMsg : '',
      alertType: 'info',
      errorMsg: {  // 与校验有关的数据 
        'username': '',
        'email'   : '',
        'password': '',
      },
      nameRules: [
        v => !!v || '用户名不能为空',
        v => v.length <= 16 || '用户名不能超过16字符',
      ],
      emailRules: [
        v => /^([0-9]{11})@fudan\.edu\.cn$/.test(v) || "@fudan.edu.cn",
      ],
      passwordRules: [
        v => !!v || '密码不能为空',
        v => v.length <= 32 || '密码不能超过32字符',
        v => v.length >= 8 || '密码不能少于8字符',
      ],
    }
  },
  methods: {
    checkUsername () {
        this.$axios.get('register/', { params: { username: this.username } })
        .then(response => {
          if (response.data.data !== 0) {
            this.errorMsg['username'] = response.data.msg
          } else {
            this.errorMsg['username'] = ''
          }
        })
    },
    checkEmail () {
      this.$axios
        .get('register/', { params: { email: this.email } })
        .then(response => {
          if (response.data.data !== 0) {
            this.errorMsg['email'] = response.data.msg
          } else {this.errorMsg['email'] = ''}
        })
    },
    checkPassword () {
        if (this.password !== this.password2) { 
          this.errorMsg['password'] = '两次输入不一致'
        } else {this.errorMsg['password'] = ''}
    },
    sendEmail () {
      if (this.$refs.form.validate()){
        this.alertType = 'info'
        this.alertMsg = '验证邮件已发送，请点击邮件中的链接以继续'
        this.isAlert = true
        this.$axios
          .post('register/', { username: this.username, email: this.email, password: this.password })
          .then(response => {
            if (response.data.data !== 0) {
              this.alertType = 'error'
              this.alertMsg = response.data.msg
              this.isAlert = true
            } else {
              this.alertType = 'success'
              this.alertMsg = '验证邮件发送成功，跳转至登录页面......'
              this.isAlert = true
              setTimeout(this.$router.push('/login'), 3000)
            }
        })
      }
    },
  },
  watch: {
    username: function () {this.debouncedCheckUsername()},
    email   : function () {this.debouncedCheckEmail()},
    password2: function () {this.debouncedCheckPassword()}
  },
  created: function() {
    this.debouncedCheckUsername = debounce(this.checkUsername, 500)
    this.debouncedCheckEmail    = debounce(this.checkEmail, 3000)
    this.debouncedCheckPassword = debounce(this.checkPassword, 500)
  }
}
</script>

<style lang="stylus" scoped>

</style>
