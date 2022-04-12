<template>
  <div class='navbar'>
    <!--    <v-system-bar app color='primary'></v-system-bar>-->
    <v-app-bar app fixed elevate-on-scroll dark color='primary' dense flat>
      <v-app-bar-nav-icon
        v-if='!banMenu && !$route.meta.allowBack'
        icon
        @click.stop='showSidebar = !showSidebar'
      ></v-app-bar-nav-icon>
      <v-app-bar-nav-icon v-if='$route.meta.allowBack' icon @click.stop='back'>
        <v-icon>mdi-arrow-left</v-icon>
      </v-app-bar-nav-icon>
      <v-app-bar-title>FDU Hole</v-app-bar-title>
      <v-spacer></v-spacer>
      <notifications-menu />
    </v-app-bar>

    <!-- 侧栏抽屉 -->
    <v-navigation-drawer app :value='!banMenu && showSidebar'>
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
        <template v-for='route in routes'>
          <v-list-item
            :key='route.path'
            v-if='!route.children && route.meta.children === undefined'
            @click.stop='$router.push({name: route.name})'
            :class="route.path === $route.path ? activeClass : ''"
          >
            <v-list-item-icon v-if='route.meta.icon'>
              <v-icon v-text='route.meta.icon' />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text='route.meta.title' />
            </v-list-item-content>
          </v-list-item>
          <app-navbar-list-group
            :key='route.path'
            v-else
          >
            <template #activator>
              <v-list-item-icon>
                <v-icon v-text='route.meta.icon' />
              </v-list-item-icon>
              <v-list-item-title>{{ route.meta.title }}</v-list-item-title>
            </template>
            <v-list-item
              v-for='childRoute in (route.meta.children || route.children)'
              :key='route.path+childRoute.path'
              :class='childItemClass(route,childRoute,$route)'
              @click.stop='$router.push(childRoute.name ? {name: childRoute.name} : {name: route.name, params: childRoute.meta.params})'
            >
              <v-list-item-content>
                <v-list-item-title v-text='childRoute.meta.title' />
              </v-list-item-content>
            </v-list-item>
          </app-navbar-list-group>
        </template>
      </v-list>

      <v-divider />
      <v-list style='padding: 5px'>
        <v-list-item v-if='filteredTagMap && filteredTagMap[$route.path]'>
          <TagChip
            :tag='filteredTagMap[$route.path]'
            :key='"filtedTag-"+filteredTagMap[$route.path].tagId'
            @click='clearTag($route.path)'
          />
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
        <v-btn fab fixed bottom color='primary' @mousedown.prevent @click='reload'>
          重载
        </v-btn>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script lang='ts'>
import { Component, Watch } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { EventBus } from '@/event-bus'
import TagChip from '@/components/chip/TagChip.vue'
import UserStore from '@/store/modules/UserStore'
import NotificationsMenu from '@/components/menu/NotificationsMenu.vue'
import { openDivisionAndGotoHole } from '@/utils/floor'
import AppNavbarListGroup from '@/components/app/AppNavbarListGroup.vue'
import { RouteConfig } from 'vue-router/types/router'
import LocalStorageStore from '@/store/modules/LocalStorageStore'
import { Route } from 'vue-router'
import { isEqual } from 'lodash-es'

@Component({
  components: { AppNavbarListGroup, NotificationsMenu, TagChip }
})
export default class Navbar extends BaseComponentOrView {
  searchText = ''

  /**
   * The display status of sidebar.
   * <p> show by default on wide screen device, and hide by default on narrow screen device. </p>
   */
  showSidebar = !this.isMobile
  currentPage = 0
  holeToGo = ''

  get banMenu () {
    return !LocalStorageStore.token
  }

  get routes (): RouteConfig[] {
    if (!this.preloaded || !LocalStorageStore.token) {
      return this.$router.options.routes!.filter(v => !v.meta?.hide && !v.meta?.requireAuth)
    }
    return this.$router.options.routes!.filter(v => !v.meta?.hide && (!v.meta?.requireAdmin || UserStore.user?.isAdmin))
  }

  get activeClass () {
    return {
      'v-list-item--active': true,
      'white--text': this.$vuetify.theme.dark
    }
  }

  @Watch('isMobile', { immediate: true })
  isMobileChanged () {
    this.showSidebar = !this.isMobile
  }

  childItemClass (route: RouteConfig, childRoute: RouteConfig, $route: Route) {
    return route.path + childRoute.path === $route.fullPath || isEqual(childRoute.meta?.params, $route.params) ? this.activeClass : ''
  }

  search (): void {
    if (this.$route.path !== 'search') {
      this.$router.push({
        name: 'search',
        query: { wd: this.searchText }
      })
    }
    EventBus.$emit('search', this.searchText)
    this.searchText = ''
  }

  reload (): void {
    location.reload()
  }

  gotoHole (): void {
    const holeId = this.holeToGo.charAt(0) === '#' ? parseInt(this.holeToGo.substring(1)) : parseInt(this.holeToGo)
    openDivisionAndGotoHole(holeId)
    this.holeToGo = ''
  }

  back (): void {
    this.$router.back()
  }

  async mounted () {
    this.showSidebar = !this.isMobile
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
