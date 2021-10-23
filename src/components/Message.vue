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

<script lang='ts'>
import { Component } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'

@Component
export default class Message extends BaseComponentOrView {
  public alert = false
  public type = 'info'
  public message = ''
  public icon = ''
  public timeout = '2000'

  mounted () {
    this.setMessageComponent(this)
  }

  public success (message: string): void {
    this.type = 'success'
    this.message = message
    this.icon = 'mdi-check-circle-outline'
    this.alert = true
  }

  public info (message: string): void {
    this.type = 'info'
    this.message = message
    this.icon = 'mdi-alert-circle-outline'
    this.alert = true
  }

  public warning (message: string): void {
    this.type = 'warning'
    this.message = message
    this.icon = 'mdi-alert-outline'
    this.alert = true
  }

  public error (message: string): void {
    this.type = 'error'
    this.message = message
    this.icon = 'mdi-alert-octagram-outline'
    this.alert = true
  }
}
</script>
