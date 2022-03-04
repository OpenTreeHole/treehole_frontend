<template>
  <v-app>
    <message ref='message'></message>
    <Navbar></Navbar>

    <v-main>
      <keep-alive include='DivisionPage'>
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
import Navbar from '@/layout/Navbar.vue'
import Message from '@/components/Message.vue'

import '@/style/global.scss'
import '@/style/theme.scss'
import '@/style/fix-height.scss'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github.css'
import 'overlayscrollbars/css/OverlayScrollbars.css'
import '@mdi/font/css/materialdesignicons.css'

import { Component, Provide } from 'vue-property-decorator'
import LocalStorageStore from '@/store/modules/LocalStorageStore'
import { BehaviorSubject } from 'rxjs'
import Vue from 'vue'
import MessageStore from '@/store/modules/MessageStore'
import UtilStore from '@/store/modules/UtilStore'

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
export default class App extends Vue {
  @Provide() preloadSubject = new BehaviorSubject(false)

  get hasToken (): boolean {
    return !!LocalStorageStore.token
  }

  created () {
    UtilStore.checkDevice()
    window.addEventListener('resize', UtilStore.checkDevice)
    document.addEventListener('onlined', (event: any) => {
      MessageStore.messageSuccess(event.detail)
    })
    document.addEventListener('offlined', (event: any) => {
      MessageStore.messageWarning(event.detail)
    })
  }

  public destroyed () {
    window.removeEventListener('resize', UtilStore.checkDevice)
  }
}
</script>
