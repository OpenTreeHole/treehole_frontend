<template>
  <v-app>
    <message ref="message"></message>
    <Navbar></Navbar>

    <v-main>
      <keep-alive include="Home">
        <router-view></router-view>
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

<script>
import Navbar from '@/components/Navbar.vue'
import Message from '@/components/Message.vue'
export default {
  name: 'App',

  components: {
    Navbar,
    Message,
  },

  methods: {
    newEvent() {
      console.log('event')
      document.dispatchEvent(
        new CustomEvent('offline', { detail: '网络已断开, 正在以离线模式浏览' })
      )
    },
  },

  created() {
    document.addEventListener('onlined', (event) => {
      this.$refs.message.success(event.detail)
    })
    document.addEventListener('offlined', (event) => {
      this.$refs.message.warning(event.detail)
    })
  },
}
</script>