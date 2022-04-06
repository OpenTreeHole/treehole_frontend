<template>
  <v-app>
    <message-snackbar ref='message'/>
    <navigation-bar/>

    <v-main>
      <keep-alive include='DivisionPage'>
        <router-view
          :key="$route.fullPath + ($route.params.id || '') + $route.query"
        ></router-view>
      </keep-alive>
    </v-main>

    <float-btn-group/>
  </v-app>
</template>

<script lang='ts'>
import NavigationBar from '@/components/bar/NavigationBar.vue'
import MessageSnackbar from '@/components/bar/MessageSnackbar.vue'

import '@/style/global.scss'
import '@/style/theme.scss'
import '@/style/fix-height.scss'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github.css'
import 'overlayscrollbars/css/OverlayScrollbars.css'
import '@mdi/font/css/materialdesignicons.css'

import { Component, Provide, Ref, Watch } from 'vue-property-decorator'
import { BehaviorSubject } from 'rxjs'
import Vue from 'vue'
import MessageStore from '@/store/modules/MessageStore'
import UtilStore from '@/store/modules/UtilStore'
import FloatBtnGroup from '@/components/FloatBtnGroup.vue'
import FloatBtnStore from '@/store/modules/FloatBtnStore'

// if (process.env.NODE_ENV !== 'production') {
//   const VConsole = require('vconsole')
//   // eslint-disable-next-line no-new
//   new VConsole()
// }

@Component({
  components: {
    FloatBtnGroup,
    NavigationBar,
    MessageSnackbar
  }
})
export default class App extends Vue {
  @Provide() preloadSubject = new BehaviorSubject(false)

  @Ref() message: MessageSnackbar
  async created () {
    UtilStore.checkDevice()
    window.addEventListener('resize', UtilStore.checkDevice)
    document.addEventListener('onlined', (event: any) => {
      MessageStore.messageSuccess(event.detail)
    })
    document.addEventListener('offlined', (event: any) => {
      MessageStore.messageWarning(event.detail)
    })
  }

  destroyed () {
    window.removeEventListener('resize', UtilStore.checkDevice)
  }

  errorCaptured (err: Error, vm: Vue, info: string) {
    MessageStore.messageError(err.message)
    throw err
  }

  @Watch('$route')
  routeChange () {
    FloatBtnStore.clean()
  }
}
</script>
