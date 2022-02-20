<template>
  <div>
    <v-expansion-panels v-if='on' :flat='true' :tile='true'>
      <v-expansion-panel>
        <v-expansion-panel-header>
          <slot name='header'/>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <slot name='content'/>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <slot v-else name='content'/>
  </div>
</template>

<script lang='ts'>
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Component, Prop } from 'vue-property-decorator'

@Component
export default class DynamicExpansionPanel extends BaseComponentOrView {
  @Prop({ required: true, type: Boolean }) on: boolean
}
</script>

<style lang='scss'>
.v-expansion-panel-content__wrap{
  padding: 0 !important;
}

.v-expansion-panel-header{
  padding: 16px !important;
}
</style>
