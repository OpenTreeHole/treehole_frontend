<template>
  <div class="navbar">
    <v-app-bar app color="primary" dark dense flat>
      <v-app-bar-nav-icon
        v-if="!inBanMenuRoutes"
        icon
        @click.stop="showSidebar = !showSidebar"
      ></v-app-bar-nav-icon>

      <v-app-bar-nav-icon v-if="inAllowBackRoutes" icon @click.stop="back"
        ><v-icon>mdi-arrow-left</v-icon></v-app-bar-nav-icon
      >

      <div class="apptitle">FDU Hole</div>
      <!-- <div
        v-if="this.$route.name !== 'login' && this.$route.name !== 'register'"
      >
        欢迎回来, {{ username }}
      </div> -->
      <!-- <v-app-bar-title>FDUHOLE </v-app-bar-title> -->
      <!-- <div class="d-flex align-center">

    </div> -->

      <v-spacer></v-spacer>
      <v-btn icon @click="refresh"><v-icon>mdi-autorenew</v-icon></v-btn>
    </v-app-bar>

    <v-navigation-drawer app v-model="showSidebar">
      <v-list-item color="primary">
        <v-list-item-content>
          <v-list-item-title>{{ username }}</v-list-item-title>
          <v-list-item-subtitle>欢迎回来</v-list-item-subtitle>
        </v-list-item-content>
        <v-btn icon @click="logout">
          <v-icon>mdi-export</v-icon>
        </v-btn>
      </v-list-item>

      <v-divider></v-divider>
      <v-list nav dense>
        <v-list-item-group v-model="currentPage" color="primary">
          <v-list-item
            v-for="(item, i) in navItems"
            :key="i"
            @click.stop="$router.push(item.route)"
            :disabled="i == currentPage"
          >
            <v-list-item-icon>
              <v-icon v-text="item.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      username: '',
      showSidebar: false,
      currentPage: 0,
      allowBackRoutes: ['discussion', 'licence'],
      banMenuRoutes: ['login', 'register', 'licence', 'discussion'],
      inAllowBackRoutes: false,
      inBanMenuRoutes: true,
      navItems: [
        {
          title: '首页',
          icon: 'mdi-home',
          route: 'home',
        },
        // {
        //   title: '账户',
        //   icon:'',
        //   route: '/user'
        // },
        {
          title: '关于',
          icon: 'mdi-information',
          route: 'about',
        },
      ],
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
    refresh() {
      location.reload()
    },
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
      this.inAllowBackRoutes = (() => {
        const currentRoute = this.$router.currentRoute.name
        var i
        for (i of this.allowBackRoutes) {
          if (currentRoute == i) {
            return true
          }
        }
        return false
      })()
      this.inBanMenuRoutes = (() => {
        const currentRoute = this.$router.currentRoute.name
        var i
        for (i of this.banMenuRoutes) {
          if (currentRoute == i) {
            return true
          }
        }
        return false
      })()
      this.username = localStorage.getItem('username')
    },
  },
  created() {
    this.inAllowBackRoutes = (() => {
      const currentRoute = this.$router.currentRoute.name
      var i
      for (i of this.allowBackRoutes) {
        if (currentRoute == i) {
          return true
        }
      }
      return false
    })()
    this.inBanMenuRoutes = (() => {
      const currentRoute = this.$router.currentRoute.name
      var i
      for (i of this.banMenuRoutes) {
        if (currentRoute == i) {
          return true
        }
      }
      return false
    })()
    this.username = localStorage.getItem('username')
  },
}
</script>

<style scoped>
</style>