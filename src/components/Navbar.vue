<template>
  <v-app-bar app color="primary" dark dense flat>
    <v-btn
      v-show="this.$router.currentRoute.name == 'discussion'"
      icon
      @click="back"
      ><v-icon>mdi-arrow-left</v-icon></v-btn
    >
    <div v-if="this.$route.name !== 'login' && this.$route.name !== 'register'">
      欢迎回来, {{ username }}
    </div>
    <!-- <v-app-bar-title>FDUHOLE </v-app-bar-title> -->
    <!-- <div class="d-flex align-center">

    </div> -->

    <v-spacer></v-spacer>

    <v-btn icon @click="logout">
      <v-icon>mdi-export</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      username: '',
    }
  },
  computed: {
    // username(){
    //   let username = localStorage.getItem('username')
    //   if(username){
    //     return username
    //   }else{
    //     return ''
    //   }
    // }
  },
  methods: {
    back() {
      this.$router.back()
    },
    logout() {
      localStorage.clear()
      this.$router.push('/login')
    },
  },

  watch: {
    $route() {
      this.username = localStorage.getItem('username')
    },
  },
  created() {
    this.username = localStorage.getItem('username')
  },
}
</script>

<style scoped>
</style>