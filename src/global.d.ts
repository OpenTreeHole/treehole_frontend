import { AxiosStatic } from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'
declare module 'vue/types/vue' {
  interface Vue {
    $axios: AxiosStatic
    $feConfig: any
    $feUtils: any
    $store: Vuex.Store
  }
}
