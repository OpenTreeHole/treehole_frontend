<template>
  <v-sheet
    class="overflow-hidden"
    v-bind="{
      outlined: true,
      rounded: true,
      ...$attrs
    }"
    v-on="$listeners"
  >
    <slot />
  </v-sheet>
</template>

<script lang='ts'>
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class AppSheet extends Vue {
}
</script>
