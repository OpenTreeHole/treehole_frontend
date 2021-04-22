<template>
  <div class="navbar">
    <v-system-bar app color="primary"></v-system-bar>
    <v-app-bar app color="primary" dense flat style="float: top">
      <v-app-bar-nav-icon
        v-if="!inBanMenuRoutes"
        icon
        @click.stop="showSidebar = !showSidebar"
      ></v-app-bar-nav-icon>
      <v-app-bar-nav-icon v-if="inAllowBackRoutes" icon @click.stop="back"
        ><v-icon>mdi-arrow-left</v-icon></v-app-bar-nav-icon
      >
      <v-app-bar-title>FDU Hole</v-app-bar-title>
      <v-spacer></v-spacer>

      <!-- 右部按钮区域 -->
      <v-btn icon @click="refresh"><v-icon>mdi-autorenew</v-icon></v-btn>
    </v-app-bar>

    <!-- 侧栏抽屉 -->
    <v-navigation-drawer app v-model="showSidebar">
      <div class="iphone-fitter"></div>

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

      <!-- 导航列表 -->
      <v-list nav dense>
        <v-list-item-group v-model="currentPage" color="primary">
          <v-list-item
            v-for="(item, i) in $feConfig.navItems"
            :key="i"
            @click.stop="$router.replace(item.route)"
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

      <v-divider></v-divider>
      <v-list style="padding: 5px">
        <!-- <v-switch
          v-model="isDarkTheme"
          label="深色模式"
          :disabled="followSystemDarkMode"
        >
        </v-switch> -->
        <!-- <v-switch v-model="followSystemDarkMode" label="跟随系统"> </v-switch> -->

        <!-- 搜索 -->
        <v-list-item>
          <v-form>
            <v-row>
              <v-text-field v-model="searchText" placeholder="搜索">
              </v-text-field>
              <v-list-item-icon>
                <v-btn
                  icon
                  @click="searchIt"
                  :disabled="searchText.length == 0"
                >
                  <v-icon>mdi-magnify</v-icon>
                </v-btn>
              </v-list-item-icon>
            </v-row>
          </v-form>
        </v-list-item>

        <!-- 跳转 -->
        <v-list-item>
          <v-form>
            <v-row>
              <v-text-field v-model="floorToGo" placeholder="直达楼层">
              </v-text-field>
              <v-list-item-icon>
                <v-btn icon @click="goFloor" :disabled="floorToGo.length == 0">
                  <v-icon>mdi-elevator</v-icon>
                </v-btn>
              </v-list-item-icon>
            </v-row>
          </v-form>
        </v-list-item>
      </v-list>

      <!-- 侧栏底部工具按钮 -->
      <div class="drawer-bottom-container">
        <v-btn fab fixed bottom color="primary" @click="reloadAll">重载</v-btn>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      // followSystemDarkMode: true,
      isDarkTheme: false,
      searchText: '',
      username: '',
      showSidebar: false,
      currentPage: 0,
      inAllowBackRoutes: false,
      inBanMenuRoutes: true,
      showSearchBox: false,
      floorToGo: '',
    }
  },
  methods: {
    searchIt() {
      this.$router.push({
        name: 'search',
        query: { wd: this.searchText },
      })
      this.searchText = ''
    },
    goFloor() {
      this.$router.push({
        name: 'discussion',
        params: { id: this.floorToGo },
      })
      this.floorToGo = ''
    },
    refresh() {
      this.$router.replace('/')
      location.reload()
    },
    reloadAll() {
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = '/'
      document.body.appendChild(form)
      form.submit()
      location.href = '/'
    },
    back() {
      this.$router.back()
    },
    logout() {
      localStorage.clear()
      this.reloadAll()
    },
  },

  watch: {
    isDarkTheme() {
      this.$vuetify.theme.dark = this.isDarkTheme
      console.log(
        `%c [切换主题] 当前主题 %c ${
          this.$vuetify.theme.dark == false ? 'light' : 'dark'
        } %c`,
        'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
        'background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
        'background:transparent'
      )
    },
    // followSystemDarkMode() {
    //   if (this.followSystemDarkMode) {
    //     // 设置为跟随系统
    //     this.isDarkTheme = window.matchMedia(
    //       '(prefers-color-scheme: dark)'
    //     ).matches
    //     media.addEventListener('change', (event) => {
    //       this.isDarkTheme = event.matches
    //     })
    //   } else {
    //     // 设置为不跟随系统
    //     media.removeEventListener('change')
    //   }
    // },
    $route() {
      this.inAllowBackRoutes = (() => {
        const currentRoute = this.$router.currentRoute.name
        var i
        for (i of this.$feConfig.allowBackRoutes) {
          if (currentRoute == i) {
            return true
          }
        }
        return false
      })()
      this.inBanMenuRoutes = (() => {
        const currentRoute = this.$router.currentRoute.name
        var i
        for (i of this.$feConfig.banMenuRoutes) {
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
    // 自动适应系统暗黑模式
    this.isDarkTheme = matchMedia('(prefers-color-scheme: dark)').matches
    matchMedia('(prefers-color-scheme: dark)').addEventListener(
      'change',
      (event) => {
        this.isDarkTheme = event.matches
      }
    )
    this.this.inAllowBackRoutes = (() => {
      const currentRoute = this.$router.currentRoute.name
      var i
      for (i of this.$feConfig.allowBackRoutes) {
        if (currentRoute == i) {
          return true
        }
      }
      return false
    })()
    this.inBanMenuRoutes = (() => {
      const currentRoute = this.$router.currentRoute.name
      var i
      for (i of this.$feConfig.banMenuRoutes) {
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

<style lang="scss" scoped>
.iphone-fitter {
  height: 0;
  height: constant(safe-area-inset-top);
  height: env(safe-area-inset-top);
}
@supports (
    (height: constant(safe-area-inset-top)) or
      (height: env(safe-area-inset-top))
  )
  and (-webkit-overflow-scrolling: touch) {
  .v-system-bar {
    height: 33pt !important;
  }
}
.drawer-bottom-container {
  position: fixed;
  left: 8px;
  bottom: 64px;
}
</style>
