import Vuex from 'vuex'
import VueRouter, { Route } from 'vue-router'
import { WsClient } from '@/apis/ws'
import FDUHoleFEConfig from '@/opentreehole-fe.config'

declare module 'vue/types/vue' {
  interface Vue {
    $feConfig: typeof FDUHoleFEConfig
    $store: Vuex.Store
    $router: VueRouter
    $route: Route
    $ws: WsClient
  }
}
