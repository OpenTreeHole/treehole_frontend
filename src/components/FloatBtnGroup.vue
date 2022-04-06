<template>
  <div :class='floatBtnClass' v-if='floatBtns'>
    <div v-for='(btn, index) in floatBtns' :key='index'>
      <v-btn color='secondary' fab @click='btn.callback' @mousedown.prevent>
        <v-icon>{{ btn.icon }}</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script lang='ts'>
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Component } from 'vue-property-decorator'
import FloatBtnStore from '@/store/modules/FloatBtnStore'

@Component
export default class FloatBtnGroup extends BaseComponentOrView {
  get floatBtnClass () {
    return this.isMobile ? 'float-btn' : 'float-btn-mobile'
  }

  get floatBtns () {
    return FloatBtnStore.floatBtns
  }
}
</script>

<style lang='scss'>
.float-btn {
  position: fixed;
  right: 8px;
  bottom: 64px;

  .v-btn {
    margin: 5px;
  }
}

.float-btn-mobile {
  position: fixed;
  right: 8px;
  bottom: 16px;

  .v-btn {
    margin: 5px;
  }
}
</style>
