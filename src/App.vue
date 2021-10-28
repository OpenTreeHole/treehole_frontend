<template>
  <v-app>
    <message ref='message'></message>
    <Navbar></Navbar>

    <v-main>
      <keep-alive include='Home, AirConditioner'>
        <router-view
          :key="$route.fullPath + ($route.params.id || '') + $route.query"
        ></router-view>
      </keep-alive>
    </v-main>

    <!-- <v-footer>
      <v-col class="text-center" cols="12">
        &copy; {{ new Date().getFullYear() }} —
        <span @click="newEvent">FDUHOLE PROJECT</span>
      </v-col>
    </v-footer> -->
  </v-app>
</template>

<script lang='ts'>
import Navbar from '@/components/Navbar.vue'
import Message from '@/components/Message.vue'

import '@/style/global.scss'
import 'github-markdown-css/github-markdown.css'
import 'highlight.js/styles/github.css'

import { Component } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import UtilStore from '@/store/modules/UtilStore'

@Component({
  components: {
    Navbar,
    Message
  }
})
export default class App extends BaseComponentOrView {
  created () {
    UtilStore.setAxios(this.$axios)
    UtilStore.setUser(this.$user)

    document.addEventListener('onlined', (event: any) => {
      this.messageSuccess(event.detail)
    })
    document.addEventListener('offlined', (event: any) => {
      this.messageWarning(event.detail)
    })
  }
}
</script>
