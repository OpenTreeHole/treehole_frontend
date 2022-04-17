<template>
  <v-menu
    bottom
    close-delay="100"
    content-class="rounded"
    left
    max-height="500"
    offset-y
    open-delay="60"
    open-on-hover
    :close-on-click="false"
    transition="slide-y-transition"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #activator="props">
      <slot
        name="activator"
        v-bind="{ ...props }"
      />
    </template>

    <app-sheet :outlined="false">
      <slot />
    </app-sheet>
  </v-menu>
</template>

<script lang="ts">
import Vue from 'vue'
import AppSheet from '@/components/app/AppSheet.vue'
import Component from 'vue-class-component'

@Component({
  components: {
    AppSheet
  }
})
export default class AppMenu extends Vue {}
</script>
