<template>
  <v-chip
    color='red'
    outlined
    class='mx-1 my-1'
    small
    ripple
    @click='onClick'
  >
    {{ tag.name }}
  </v-chip>
</template>

<script lang='ts'>
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Component, Prop } from 'vue-property-decorator'
import { Tag } from '@/api/hole'

@Component
export default class TagChip extends BaseComponentOrView {
  @Prop({ required: true, type: Object }) tag: Tag
  @Prop({ type: Boolean, default: false }) remove: boolean
  @Prop({ type: Boolean, default: false }) prevent: boolean

  public onClick () {
    if (this.prevent || !this.$route.name) return
    if (this.remove) {
      this.clearTag(this.$route.name)
    } else {
      this.addTag(this.$route.name, this.tag)
    }
  }
}
</script>
