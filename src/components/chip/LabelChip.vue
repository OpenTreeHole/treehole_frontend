<template>
  <v-chip
    color="yellow"
    label
    class="mx-1 my-1"
    small
  >
    {{ label }}
  </v-chip>
</template>

<script lang="ts">
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Component, Prop } from 'vue-property-decorator'

@Component
export default class LabelChip extends BaseComponentOrView {
  @Prop({ required: true, type: String }) label: string
}
</script>

<style scoped></style>
