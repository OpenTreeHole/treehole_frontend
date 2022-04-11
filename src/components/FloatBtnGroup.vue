<template>
  <div :class='floatBtnClass' v-if='floatBtns'>
    <div v-for='(btn, index) in floatBtns' :key='index'>
      <v-btn color='secondary' fab @click='btn.callback' @mousedown.prevent>
        <v-icon :style='btn.style'>{{ btn.icon }}</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script lang='ts'>
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Component, Prop } from 'vue-property-decorator'

export interface IFloatBtnInfo {
  name: string
  style: string
  icon: string
  callback: () => void
}

const defaultBtnInfo: IFloatBtnInfo = {
  name: '',
  style: '',
  icon: 'mdi-send',
  callback: () => {
  }
}

@Component
export default class FloatBtnGroup extends BaseComponentOrView {
  @Prop({ type: Array, default: () => [] }) floatBtns: Partial<IFloatBtnInfo>[]

  get cInfo () {
    return this.floatBtns.map(v => ({ ...defaultBtnInfo, ...v }))
  }

  get floatBtnClass () {
    return this.isMobile ? 'float-btn-mobile' : 'float-btn'
  }
}
</script>

<style lang='scss'>
.float-btn {
  position: fixed;
  right: 8px;
  bottom: 32px;

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
