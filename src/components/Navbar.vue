<template>
  <div class='navbar'>
    <!--    <v-system-bar app color='primary'></v-system-bar>-->
    <v-app-bar app elevate-on-scroll dark color='primary' dense flat>
      <v-app-bar-nav-icon
        v-if='!inBanMenuRoutes'
        icon
        @click.stop='showSidebar = !showSidebar'
      ></v-app-bar-nav-icon>
      <v-app-bar-nav-icon v-if='inAllowBackRoutes' icon @click.stop='back'
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-app-bar-nav-icon
      >
      <v-app-bar-title>FDU Hole</v-app-bar-title>
      <!-- <v-spacer></v-spacer> -->
    </v-app-bar>

    <!-- 侧栏抽屉 -->
    <v-navigation-drawer app v-model='showSidebar'>
      <div class='iphone-fitter' />

      <v-list-item color='primary'>
        <v-list-item-content>
          <v-list-item-title>FDU Hole</v-list-item-title>
          <v-list-item-subtitle>欢迎回来</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <!-- 导航列表 -->
      <v-list nav dense>
        <v-list-item-group color='primary'>
          <template v-for='item in $feConfig.navItems'>
            <v-list-item
              :key='item.route'
              v-if='!item.group'
              @click.stop='$router.replace(item.route)'
              :class="item.route === $route.path ? activeClass : ''"
              :disabled='item.route===$route.path'
            >
              <v-list-item-icon>
                <v-icon v-text='item.icon' />
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text='item.title' />
              </v-list-item-content>
            </v-list-item>
            <v-list-group
              :key='item.route'
              v-else
              no-action
              :color="`primary ${$vuetify.theme.dark ? 'lighten-1' : 'darken-2'}`"
            >
              <template #activator>
                <v-list-item-icon>
                  <v-icon v-text='item.icon' />
                </v-list-item-icon>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </template>
              <v-list-item
                v-for='childItem in groupNavItem.get(item.route)'
                :key='item.route+childItem.route'
                :class="item.route+childItem.route===$route.fullPath ? activeClass : ''"
                @click.stop='$router.replace(item.route+childItem.route)'
                :disabled='item.route+childItem.route===$route.fullPath'
              >
                <v-list-item-content>
                  <v-list-item-title v-text='childItem.name' />
                </v-list-item-content>
              </v-list-item>
            </v-list-group>
          </template>

        </v-list-item-group>
      </v-list>

      <v-divider />
      <v-list style='padding: 5px'>
        <v-list-item v-if='filtedTagMap && filtedTagMap[$route.name]'>
          <TagChip :tag='filtedTagMap[$route.name]' :key='"filtedTag-"+filtedTagMap[$route.name].tagId' :remove='true'></TagChip>
        </v-list-item>
        <!-- 搜索 -->
        <v-list-item>
          <v-form>
            <v-row>
              <v-text-field
                type='search'
                v-model='searchText'
                placeholder='搜索'
              >
              </v-text-field>
              <v-list-item-icon>
                <v-btn
                  type='submit'
                  icon
                  @click='search'
                  :disabled='searchText.length === 0'
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
              <v-text-field v-model='holeToGo' placeholder='电梯直达'>
              </v-text-field>
              <v-list-item-icon>
                <v-btn
                  type='submit'
                  icon
                  @click='gotoHole'
                  :disabled='holeToGo.length === 0'
                >
                  <v-icon>mdi-elevator</v-icon>
                </v-btn>
              </v-list-item-icon>
            </v-row>
          </v-form>
        </v-list-item>
      </v-list>

      <!-- 侧栏底部工具按钮 -->
      <div class='drawer-bottom-container'>
        <v-btn fab fixed bottom color='primary' @mousedown.prevent @click='load'>
          重载
        </v-btn>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script lang='ts'>
import { Component, Watch } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Division } from '@/api/hole'
import { camelizeKeys } from '@/utils'
import { EventBus } from '@/event-bus'
import TagChip from '@/components/hole/TagChip.vue'
@Component({
  components: { TagChip }
})
export default class Navbar extends BaseComponentOrView {
  public isDarkTheme = false
  public searchText = ''

  /**
   * The display status of side bar.
   * <p> show by default on wide screen device, and hide by default on narrow screen device. </p>
   */
  public showSidebar = !this.isMobile
  public currentPage = 0
  public inAllowBackRoutes = false
  public inBanMenuRoutes = true
  public showSearchBox = false
  public holeToGo = ''
  public groupNavItem = new Map()

  get activeClass () {
    return {
      'v-list-item--active': true,
      'white--text': this.$vuetify.theme.dark
    }
  }

  public search (): void {
    if (this.$route.path !== 'search') {
      this.$router.push({
        name: 'search',
        query: { wd: this.searchText }
      })
    }
    EventBus.$emit('search', this.searchText)
    this.searchText = ''
  }

  public gotoHole (): void {
    const holeId = this.holeToGo.charAt(0) === '#' ? parseInt(this.holeToGo.substring(1)) : parseInt(this.holeToGo)
    if (this.$route.path === '/home' || this.$route.path === '/division') {
      EventBus.$emit('goto-hole', holeId)
    } else {
      this.$router.push('/home').then(() => {
        EventBus.$emit('goto-hole', holeId)
      })
    }
    this.holeToGo = ''
  }

  public load (): void {
    this.$axios.get('/divisions').then((response) => {
      const divisions: Division[] = camelizeKeys(response.data)
      this.$user.divisions = divisions
      const divisionInfos: { route: string, name: string }[] = []
      divisions.forEach((v) => {
        divisionInfos.push({ route: '/' + v.divisionId.toString(), name: v.name })
      })
      this.groupNavItem = new Map(this.groupNavItem.set('/division', divisionInfos))
    })
  }

  public back (): void {
    this.$router.back()
  }

  public mounted () {
    this.$nextTick(this.checkDevice)
    this.showSidebar = !this.isMobile
  }

  public created () {
    this.load()
  }

  @Watch('isDarkTheme')
  isDarkThemeChange () {
    this.$vuetify.theme.dark = this.isDarkTheme
    console.log(
      `%c [切换主题] 当前主题 %c ${
        !this.$vuetify.theme.dark ? 'light' : 'dark'
      } %c`,
      'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
      'background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
      'background:transparent'
    )
  }

  @Watch('$route', { immediate: true })
  routeChange () {
    this.clearTag()

    this.isDarkTheme = matchMedia('(prefers-color-scheme: dark)').matches
    matchMedia('(prefers-color-scheme: dark)').addEventListener(
      'change',
      (event) => {
        this.isDarkTheme = event.matches
      }
    )
    this.inAllowBackRoutes = (() => {
      const currentRoute = this.$router.currentRoute.name
      let i
      for (i of this.$feConfig.allowBackRoutes) {
        if (currentRoute === i) {
          return true
        }
      }
      return false
    })()
    this.inBanMenuRoutes = (() => {
      const currentRoute = this.$router.currentRoute.name
      let i
      for (i of this.$feConfig.banMenuRoutes) {
        if (currentRoute === i) {
          return true
        }
      }
      return false
    })()
  }
}
</script>

<!--suppress CssInvalidFunction -->
<style lang='scss' scoped>
//noinspection CssOverwrittenProperties
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
