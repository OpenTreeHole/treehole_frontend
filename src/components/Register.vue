<template>
  <div>
    注册页面
    <form>
      <div >
        <input type="email" class='form-control' v-model="email" @blur="checkEmail" id="email" maxlength="191" required autocomplete="email">
        <label for="email" class="form-label">edu邮箱</label>
      </div>

      <div >
        <input type="text" class='form-control' v-model="username" @keyup="checkUsername" id="username" maxlength="191" required autocomplete="username">
        <label for="username" class="form-label">用户名</label>
      </div>

      <div >
        <input type="password" class='form-control' v-model="password" id="password" maxlength="191" minlength="8" required autocomplete="new-password">
        <label for="password" class="form-label">密码</label>
      </div>

      <div >
        <input type="password" class='form-control' v-model="password2" @keyup="checkPassword" id="password2" maxlength="191" minlength="8" required autocomplete="new-password">
        <label for="password2" class="form-label">验证密码</label>
      </div>

      <button type="button" @click="sendEmail" :disabled='isDisabled'>{{buttonMsg}}</button>

    </form>

  </div>
</template>

<script>
export default {
  data () {
    return {
      username: '',
      password: '',
      password2: '',
      email: '',
      timeID: 0,
      buttonMsg: '注册',
      isDisabled: false
    }
  },
  methods: {
    checkUsername () {
      const _this = this
      clearTimeout(this.timeID)
      this.timeID = setTimeout(() => {
        this.$axios
          .get('register/', { params: { username: this.username } })
          .then(response => {
            if (response.data.data !== 0) {
              _this.isDisabled = true
              _this.buttonMsg = response.data.msg
            } else {
              _this.isDisabled = false
              _this.buttonMsg = '注册'
            }
          })
      }, 500)
    },
    checkEmail () {
      const _this = this
      this.$axios
        .get('register/', { params: { email: this.email } })
        .then(response => {
          if (response.data.data !== 0) {
            _this.isDisabled = true
            _this.buttonMsg = response.data.msg
          } else {
            _this.isDisabled = false
            _this.buttonMsg = '注册'
          }
        })
    },
    checkPassword () {
      const _this = this
      clearTimeout(this.timeID)
      this.timeID = setTimeout(() => {
        if (_this.password !== _this.password2) {
          _this.isDisabled = true
          _this.buttonMsg = '两次输入密码不一致'
        } else {
          _this.isDisabled = false
          _this.buttonMsg = '注册'
        }
      }, 500)
    },
    sendEmail () {
      alert('验证邮件已发送，请点击邮件中的链接以继续')
      this.$axios
        .post('register/', { username: this.username, email: this.email, password: this.password })
        .then(response => {
          if (response.data.data !== 0) { alert('验证邮件发送失败，请重试或与管理员联系') } else {
            alert('验证邮件发送成功，跳转至登陆页面......')
            setTimeout(this.$router.push('/login'), 3000)
          }
        })
    }
  }
}
</script>

<style lang="stylus" scoped>

</style>
