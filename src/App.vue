<template>
  <v-app>

    <Navbar></Navbar>

    <v-main>
      <router-view></router-view>
    </v-main>

    <v-footer>
      <v-col class="text-center" cols="12">
      	&copy; {{ new Date().getFullYear() }} — FDUHOLE PROJECT
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
import Navbar from '@/components/Navbar.vue'

export default {
  name: 'App',

  components: {
    Navbar,
  },

  data(){
    return {
    }
  },

  methods: {
  },

  created() {
  }
}
</script>

<style scoped>
/* #container {
  background-color:dimgrey
} */
</style>
