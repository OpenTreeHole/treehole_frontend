<template>
  <div class="navbar">
    <v-system-bar app color="primary"></v-system-bar>
    <v-app-bar app dark color="primary" dense flat style="float: top">
      <v-app-bar-nav-icon
        v-if="!inBanMenuRoutes"
        icon
        @click.stop="showSidebar = !showSidebar"
      ></v-app-bar-nav-icon>
      <v-app-bar-nav-icon v-if="inAllowBackRoutes" icon @click.stop="back"
        ><v-icon>mdi-arrow-left</v-icon></v-app-bar-nav-icon
      >
      <v-app-bar-title>FDU Hole</v-app-bar-title>
      <!-- <v-spacer></v-spacer> -->
    </v-app-bar>

    <!-- 侧栏抽屉 -->
    <v-navigation-drawer app v-model="showSidebar">
      <div class="iphone-fitter"></div>

      <v-list-item color="primary">
        <v-list-item-content>
          <v-list-item-title>FDU Hole</v-list-item-title>
          <v-list-item-subtitle>欢迎回来</v-list-item-subtitle>
        </v-list-item-content>
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
        <!-- 搜索 -->
        <v-list-item>
          <v-form>
            <v-row>
              <v-text-field
                type="search"
                v-model="searchText"
                placeholder="搜索"
              >
              </v-text-field>
              <v-list-item-icon>
                <v-btn
                  type="submit"
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
              <v-text-field v-model="floorToGo" placeholder="电梯直达">
              </v-text-field>
              <v-list-item-icon>
                <v-btn
                  type="submit"
                  icon
                  @click="goFloor"
                  :disabled="floorToGo.length == 0"
                >
                  <v-icon>mdi-elevator</v-icon>
                </v-btn>
              </v-list-item-icon>
            </v-row>
          </v-form>
        </v-list-item>
      </v-list>

      <!-- 侧栏底部工具按钮 -->
      <div class="drawer-bottom-container">
        <v-btn fab fixed bottom color="primary" @click="$feUtils.reloadAll()"
          >重载</v-btn
        >
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
    back() {
      this.$router.back()
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
    $route: {
      immediate: true,
      handler() {
        this.isDarkTheme = matchMedia('(prefers-color-scheme: dark)').matches
        matchMedia('(prefers-color-scheme: dark)').addEventListener(
          'change',
          (event) => {
            this.isDarkTheme = event.matches
          }
        )
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
  position: absolute;
  left: 8px;
}
</style>
