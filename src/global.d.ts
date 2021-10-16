import { AxiosStatic } from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'
declare module 'vue/types/vue' {
  interface Vue {
    $axios: AxiosStatic
    $marked: any
    $feConfig: any
    $feUtils: any
    $store: Vuex.Store
  }
}
