<template>
  <span class='v-app-tooltip-btn d-inline-block'>
    <v-tooltip
      bottom
      content-class='v-app-tooltip-btn__content'
      open-delay='200'
    >
      <template #activator='{ on }'>
        <v-btn
          :aria-label='text'
          icon
          v-bind='$attrs'
          v-on='{
            ...on,
            ...$listeners
          }'
        >
          <slot
            v-if='$slots.icon'
            name='icon'
          />

          <v-icon
            v-else
            v-text='icon'
          />
        </v-btn>
      </template>

      <span>{{ text }}</span>
    </v-tooltip>
  </span>
</template>

<script lang='ts'>
import { Component, Prop } from 'vue-property-decorator'
import Vue from 'vue'

@Component
export default class AppTooltipBtn extends Vue {
  public inheritAttrs = false
  @Prop({ type: String }) icon: string
  @Prop({ required: true, type: String }) text: string
}
</script>

<style lang='sass'>
.v-app-tooltip-btn__content p
  margin: 0
</style>
