import { AxiosStatic } from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter, { Route } from 'vue-router'
import { User } from '@/api/user'
declare module 'vue/types/vue' {
  interface Vue {
    $axios: AxiosStatic
    $feConfig: any
    $store: Vuex.Store
    $router: VueRouter
    $route: Route
    $user: User
  }
}
