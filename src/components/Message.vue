<template>
  <div>
  <v-snackbar top :color="type" v-model="alert" >
    <v-icon left>
      {{icon}}
    </v-icon>
    <span class="text-body-1 font-weight-medium">{{message}}</span>
    
  </v-snackbar>
  </div>
</template>

<script>
export default {
  name: 'message',
  data() {
    return {
      alert: false,
      type: 'info',
      message: '',
      icon: '',
    }
  },

  methods: {
    success(message){
      this.alert = true
      this.type = 'success'
      this.message = message
      this.icon = 'mdi-check-circle-outline'
    },

    info(message){
      this.alert = true
      this.type = 'info'
      this.message = message
      this.icon = 'mdi-alert-circle-outline'
    },

    warning(message){
      this.alert = true
      this.type = 'warning'
      this.message = message
      this.icon = 'mdi-alert-outline'
    },

    error(message){
      this.alert = true
      this.type = 'error'
      this.message = message
      this.icon = 'mdi-alert-octagram-outline'
    },
    
  }
}
</script>