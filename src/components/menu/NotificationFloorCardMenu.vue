<template>
  <v-menu
    v-model='menu'
    :close-on-content-click='false'
    :nudge-width='150'
    :nudge-left='18'
    offset-x
    open-on-hover
    left
  >
    <template #activator='props'>
      <slot name='activator' v-bind='{ ...props }' />
    </template>
    <app-sheet :outlined='false'>
      <FloorCard :floor='floor' :no-action='true' />
    </app-sheet>
  </v-menu>
</template>

<script lang='ts'>
import { Component, Prop } from 'vue-property-decorator'
import Vue from 'vue'
import FloorCard from '@/components/hole/FloorCard.vue'
import { MarkedDetailedFloor } from '@/api/hole'
import AppSheet from '@/components/app/AppSheet.vue'

@Component({
  components: { FloorCard, AppSheet }
})
export default class NotificationFloorCardMenu extends Vue {
  @Prop({ required: true }) floor: MarkedDetailedFloor

  public menu = false
}
</script>

<style scoped>

</style>
