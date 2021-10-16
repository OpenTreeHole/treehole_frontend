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

<script>
import Navbar from '@/components/Navbar.vue'
import Message from '@/components/Message.vue'

export default {
  name: 'App',

  components: {
    Navbar,
    Message
  },

  methods: {
    newEvent () {
      console.log('event')
      document.dispatchEvent(
        new CustomEvent('offline', { detail: '网络已断开, 正在以离线模式浏览' })
      )
    }
  },

  created () {
    document.addEventListener('onlined', (event) => {
      this.$store.dispatch('messageSuccess', event.detail)
    })
    document.addEventListener('offlined', (event) => {
      this.$store.dispatch('messageWarning', event.detail)
    })
  }
}
</script>

<style lang='scss'>
.fold {
  overflow: hidden;
  max-height: 4.5rem;
  transition: max-height 0.5s cubic-bezier(0, 1, 0, 1);
}

.unfold {
  overflow: hidden;
  max-height: 100rem;
  transition: max-height 1s ease-in-out;
}

.clickable {
  cursor: pointer;
}

.rich-text p {
  margin-bottom: 0;
}

img {
  display: block;
  margin: auto;
  max-width: 90%;
}
</style>
