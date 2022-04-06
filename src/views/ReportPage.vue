<template>
  <v-container class='pa-0 max-height max-width'>
    <report-panel v-if='!isMobile' ref='reportComp' />
    <report-list-mobile v-else ref='reportComp' />
  </v-container>
</template>

<script lang='ts'>
import { Component, Ref } from 'vue-property-decorator'
import BaseView from '@/mixins/BaseView.vue'
import ReportPanel from '@/components/panel/ReportPanel.vue'
import ReportListMobile from '@/components/column/ReportListMobile.vue'
import FloatBtnStore from '@/store/modules/FloatBtnStore'

@Component({
  components: { ReportListMobile, ReportPanel }
})
export default class ReportPage extends BaseView {
  @Ref() readonly reportComp!: ReportPanel

  get floatBtnClass () {
    return this.isMobile ? 'float-btn' : 'float-btn-mobile'
  }

  async mounted () {
    FloatBtnStore.setLayer({
      order: 2,
      floatBtns: [
        {
          icon: 'mdi-autorenew',
          callback: this.reload
        }
      ]
    })
  }

  reload () {
    this.reportComp.refresh()
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
