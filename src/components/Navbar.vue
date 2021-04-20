<template>
  <div class="navbar">
    <v-system-bar dark app color="primary"></v-system-bar>
    <v-app-bar app color="primary" dark dense flat style="float: top">
      <v-app-bar-nav-icon
        v-if="!inBanMenuRoutes"
        icon
        @click.stop="showSidebar = !showSidebar"
      ></v-app-bar-nav-icon>
      <v-app-bar-nav-icon v-if="inAllowBackRoutes" icon @click.stop="back"
        ><v-icon>mdi-arrow-left</v-icon></v-app-bar-nav-icon
      >
      <v-app-bar-title>FDU Hole</v-app-bar-title>
      <!-- 刷新按钮 -->
      <v-btn icon @click="refresh"><v-icon>mdi-autorenew</v-icon></v-btn>

      <v-spacer></v-spacer>
      <!-- 右部按钮区域 -->
      <!-- 搜索框 -->

      <v-text-field
        autofocus="true"
        @blur="
          if (searchText.length == 0) {
            showSearchBox = !showSearchBox
          }
        "
        v-model="searchText"
        placeholder="搜索"
        v-show="showSearchBox"
      ></v-text-field>
      <v-btn icon @click="searchButtomHandler"
        ><v-icon>mdi-magnify</v-icon></v-btn
      >
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
      searchText: '',
      username: '',
      showSidebar: false,
      currentPage: 0,
      inAllowBackRoutes: false,
      inBanMenuRoutes: true,
      showSearchBox: false,
    }
  },
  methods: {
    searchButtomHandler() {
      if (!this.showSearchBox) {
        this.showSearchBox = true
      } else {
        this.$router.push({
          name: 'search',
          query: { wd: this.searchText },
        })
        this.searchText = ''
      }
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
  margin: 15px;
}
</style>