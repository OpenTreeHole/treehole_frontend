import Vuex from 'vuex'
import VueRouter, { Route } from 'vue-router'
import { WsClient } from '@/apis/ws'
import config from '@/config'

declare module 'vue/types/vue' {
  interface Vue {
    $feConfig: typeof config
    $store: Vuex.Store
    $router: VueRouter
    $route: Route
    $ws: WsClient
  }
}
