<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :nudge-width="150"
    :nudge-left="18"
    offset-x
    open-on-hover
    left
  >
    <template #activator="props">
      <slot
        name="activator"
        v-bind="{ ...props }"
      />
    </template>
    <app-sheet :outlined="false">
      <FloorCard
        :floor="floor"
        :no-action="true"
      />
    </app-sheet>
  </v-menu>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import Vue from 'vue'
import FloorCard from '@/components/card/FloorCard.vue'
import AppSheet from '@/components/app/AppSheet.vue'
import { DetailedFloor } from '@/models/floor'

@Component({
  components: { FloorCard, AppSheet }
})
export default class NotificationFloorCardMenu extends Vue {
  @Prop({ required: true }) floor: DetailedFloor

  menu = false
}
</script>
