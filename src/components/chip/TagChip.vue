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
    <slot/>
  </v-chip>
</template>

<script lang='ts'>
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Component, Emit, Prop } from 'vue-property-decorator'
import { parseTagColor } from '@/utils/utils'
import { ITag } from '@/models/tag'

@Component
export default class TagChip extends BaseComponentOrView {
  @Prop({ required: true, type: Object }) tag: ITag
  public color: string = 'red'

  @Emit('click')
  public onClick (_e: MouseEvent) {}

  created () {
    this.color = parseTagColor(this.tag.name)
  }
}
</script>
