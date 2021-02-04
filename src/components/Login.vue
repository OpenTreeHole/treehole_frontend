<template>

  <v-row align="center" justify="center">
    <v-col cols="10" sm="8" md="6" lg="4" class="text-center" >
      <v-card class="py-8 px-10" elevation="4">
        <h1 >登录</h1>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-alert type="error" :value="alert" >用户名或密码错误</v-alert>
          <div>
            <v-text-field 
              v-model="username"
              label="用户名"
              :clearable="!valid"
              :counter="16"
              :rules="nameRules"
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

          <v-btn class="my-4" color="primary" block :disabled="!valid" @click="login">登录</v-btn>
          
          <!-- <v-btn @click="logout" >
            登出
          </v-btn>
          <v-btn @click="discussions" >
            discussions
          </v-btn>
          <v-btn @click="posts" >
            posts
          </v-btn> --> 
          <div>
            <p class="py-1 my-0"><a href="#/register">没有账号？点此注册</a></p>
            <p class="py-1 my-0"><a href="#" onclick="alert('活该')">忘记密码</a></p>
          </div>
        </v-form>

      </v-card>
      
    </v-col>
  </v-row>

</template>

<script>
export default {
  data () {
    return {
      alert: false,
      valid: true,
      username: '',
      password: '',
      nameRules: [
        v => !!v || '用户名不能为空',
        v => v.length <= 16 || '用户名不能超过16字符',
      ],
      passwordRules: [
        v => !!v || '密码不能为空',
        v => v.length <= 32 || '密码不能超过32字符',
        v => v.length >= 8 || '密码不能少于8字符',
      ],
    }
  },
  methods: {
    login () {
      const _this = this
      this.$refs.form.validate()
      console.log(this.password)
      this.$axios
        .post('login/', { username: this.username, password: this.password })
        .then(response => {
          console.log(response.data)
          localStorage.setItem('token', 'Token ' + response.data.token)
          this.$router.push('/home')
        })
        .catch(() => {
          this.valid = false
          setTimeout(() => {
            _this.alert = false
          }, 3000 )
          this.alert = true
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
