<template>
  <div>
    登录组件
    <form>
      <div class="form-outline mb-4">
        <input
          type="text"
          class="form-control"
          v-model="username"
          id="username"
          required
          autofocus
          autocomplete="username"
        />
        <label for="username" class="form-label">用户名</label>
      </div>

      <div class="form-outline mb-4">
        <input
          type="password"
          class="form-control"
          v-model="password"
          id="password"
          maxlength="191"
          minlength="8"
          required
          autocomplete="current-password"
        />
        <label for="password" class="form-label">密码</label>
      </div>

      <button @click="login">登录</button>
      <button @click="logout" class="btn btn-primary btn-block mb-4 ">
        登出
      </button>
      <button @click="discussions" class="btn btn-primary btn-block mb-4 ">
        discussions
      </button>
      <button @click="posts" class="btn btn-primary btn-block mb-4 ">
        posts
      </button>

      <p><a href="#/register">没有账号？点此注册</a></p>
      <p><a href="#" target="_self" id="forget_password">忘记密码</a></p>
    </form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    login () {
      console.log(this.password)
      this.$axios
        .post('login/', { username: this.username, password: this.password })
        .then(response => {
          console.log(response.data)
          localStorage.setItem('token', 'Token ' + response.data.token)
          this.$router.push('/home')
        })
        .catch(error => {
          console.log(error.response.data)
        })
    },
    logout () {
      localStorage.clear()
      this.$router.push('/login')
    },
    discussions () {
      this.$axios
        .get('discussions/', { params: { page: 1 } })
        .then(response => {
          console.log(response.data)
        })
    },
    posts () {
      this.$axios
        .get('posts/', { params: { id: 22, page: 1 } })
        .then(response => {
          console.log(response.data)
        })
        .catch(error => {
          console.log(error.response.data)
          alert('需要登录！')
        })
    }
  }
}
</script>

<style lang="stylus" scoped></style>
