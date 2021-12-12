<template>
  <v-app>
    <message ref='message'></message>
    <Navbar></Navbar>

    <v-main>
      <keep-alive v-if='hasToken' include='Division'>
        <router-view
          :key="$route.fullPath + ($route.params.id || '') + $route.query"
        ></router-view>
      </keep-alive>
      <router-view
        v-else
        :key="$route.fullPath + ($route.params.id || '') + $route.query"
      ></router-view>
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
import Navbar from '@/layout/Navbar.vue'
import Message from '@/components/Message.vue'

import '@/style/global.scss'
import 'github-markdown-css/github-markdown.css'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github.css'
import 'overlayscrollbars/css/OverlayScrollbars.css'

import { Component } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import LocalStorageStore from '@/store/modules/LocalStorageStore'

if (process.env.NODE_ENV !== 'production') {
  const VConsole = require('vconsole')
  // eslint-disable-next-line no-new
  new VConsole()
}

@Component({
  components: {
    Navbar,
    Message
  }
})
export default class App extends BaseComponentOrView {
  get hasToken (): boolean {
    return !!LocalStorageStore.token
  }

  created () {
    document.addEventListener('onlined', (event: any) => {
      this.messageSuccess(event.detail)
    })
    document.addEventListener('offlined', (event: any) => {
      this.messageWarning(event.detail)
    })
  }
}
</script>
