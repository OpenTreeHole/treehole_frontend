<template>
  <v-chip
    :color='color'
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
import { parseTagColor } from '@/utils/utils'
import { Tag } from '@/models/tag'

@Component
export default class TagChip extends BaseComponentOrView {
  @Prop({ required: true, type: Object }) tag: Tag
  @Prop({ type: Boolean, default: false }) remove: boolean
  @Prop({ type: Boolean, default: false }) prevent: boolean
  public color: string = 'red'

  public onClick () {
    if (this.prevent || !this.$route.path) return
    if (this.remove) {
      this.clearTag(this.$route.path)
    } else {
      this.addTag(this.$route.path, this.tag)
    }
  }

  created () {
    this.color = parseTagColor(this.tag.name)
  }
}
</script>
