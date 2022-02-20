<template>
  <v-container class='pa-0 max-height max-width'>
    <!-- 帖子列表 -->
    <report-panel v-if='!isMobile' ref='reportComp' />
    <report-list-mobile v-else ref='reportComp' />

    <!-- 新帖编辑器及浮动按钮 -->
    <div :class='floatBtnClass'>
      <v-btn v-if='!this.isMobile' fab color='secondary' @mousedown.prevent @click='reload'>
        <v-icon>mdi-autorenew</v-icon>
      </v-btn>
    </div>

  </v-container>
</template>

<script lang='ts'>
import { Component, Ref } from 'vue-property-decorator'
import BaseView from '@/mixins/BaseView.vue'
import ReportPanel from '@/components/panel/ReportPanel.vue'
import ReportListMobile from '@/components/column/ReportListMobile.vue'
@Component({
  components: { ReportListMobile, ReportPanel }
})
export default class ReportPage extends BaseView {
  @Ref() readonly reportComp!: ReportPanel

  get floatBtnClass () {
    return this.isMobile ? 'float-btn' : 'float-btn-mobile'
  }

  public reload (): void {
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
