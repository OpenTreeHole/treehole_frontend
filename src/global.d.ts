import { AxiosStatic } from 'axios'
import Vuex from 'vuex'
import VueRouter, { Route } from 'vue-router'
import { WsClient } from '@/api/ws'

declare module 'vue/types/vue' {
  interface Vue {
    $axios: AxiosStatic
    $feConfig: any
    $store: Vuex.Store
    $router: VueRouter
    $route: Route
    $ws: WsClient
    $wsImage: WsClient
  }
}
