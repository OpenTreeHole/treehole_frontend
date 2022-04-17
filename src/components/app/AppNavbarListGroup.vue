<template>
  <v-list-group
    ref="group"
    :color="`blue ${isDarkTheme ? 'lighten-1' : 'darken-2'}`"
    :value="true"
    no-action
  >
    <template #activator>
      <slot name="activator" />
    </template>

    <slot />
  </v-list-group>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Ref } from 'vue-property-decorator'

@Component
export default class AppNavbarListGroup extends Vue {
  @Ref() readonly group: any

  get isDarkTheme() {
    return this.$vuetify.theme.dark
  }
}
</script>

<style scoped></style>
