<template>
  <v-container class='pa-0'>
    <report-list @open-report='openReport' ref='reportList' @refresh='refresh'/>
  </v-container>
</template>

<script lang='ts'>
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Component, Ref } from 'vue-property-decorator'
import ReportList from '@/components/column/ReportList.vue'
import { Report } from '@/models/report'
import { gotoHole } from '@/utils/floor'
@Component({
  components: { ReportList }
})
export default class ReportListMobile extends BaseComponentOrView {
  public openReport (report: Report) {
    gotoHole(report.holeId, report.floor.floorId)
  }

  @Ref() readonly reportList!: ReportList

  public refresh () {
    this.reportList.refresh()
  }
}
</script>

<style lang='scss' scoped>

</style>
