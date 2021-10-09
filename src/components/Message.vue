<template>
  <div>
    <v-snackbar top :color='type' v-model='alert' :timeout='timeout'>
      <v-icon left>
        {{ icon }}
      </v-icon>
      <span class='text-body-1 font-weight-medium'>{{ message }}</span>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: 'message',
  data () {
    return {
      alert: false,
      type: 'info',
      message: '',
      icon: '',
      timeout: '2000'
    }
  },

  mounted () {
    this.$store.commit('setMessageComponent', this)
  },

  methods: {
    success (message) {
      this.type = 'success'
      this.message = message
      this.icon = 'mdi-check-circle-outline'
      this.alert = true
    },

    info (message) {
      this.type = 'info'
      this.message = message
      this.icon = 'mdi-alert-circle-outline'
      this.alert = true
    },

    warning (message) {
      this.type = 'warning'
      this.message = message
      this.icon = 'mdi-alert-outline'
      this.alert = true
    },

    error (message) {
      this.type = 'error'
      this.message = message
      this.icon = 'mdi-alert-octagram-outline'
      this.alert = true
    }
  }
}
</script>
