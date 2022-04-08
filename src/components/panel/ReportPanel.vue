<template>
  <double-column-panel ref='doubleColumnPanel' @show-second-col-changed='showFloorListChanged'>
    <template #first>
      <report-list
        ref='reportList'
        @open-report='openReport'
        @refresh='refresh'
      />
    </template>
    <template #second>
      <floor-list
        v-if='displayReport && showFloorList'
        :key='displayReport.reportId'
        :display-floor-id='displayReport.floor.floorId'
        :wrapped-hole-or-id='displayReport.holeId'
        ref='floorList'
        class='pa-0'
      />
    </template>
  </double-column-panel>
</template>

<script lang='ts'>
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Component, Ref } from 'vue-property-decorator'
import DoubleColumnPanel from '@/components/animation/DoubleColumnPanel.vue'
import ReportList from '@/components/column/ReportList.vue'
import FloorList from '@/components/column/FloorList.vue'
import { Report } from '@/models/report'

@Component({
  components: { FloorList, ReportList, DoubleColumnPanel }
})
export default class ReportPanel extends BaseComponentOrView {
  displayReport: Report | null = null
  isLoadingVisible = false

  showFloorList = false

  @Ref() readonly reportList: ReportList
  @Ref() readonly floorList: FloorList
  @Ref() readonly doubleColumnPanel: DoubleColumnPanel

  refresh (): void {
    this.deactivate()
    this.reportList.refresh()
  }

  openReport (report: Report): void {
    if (this.displayReport && report.reportId === this.displayReport.reportId) {
      this.doubleColumnPanel.deactivate()
      this.displayReport = null
    } else {
      this.doubleColumnPanel.activate()
      this.displayReport = report
      document.body.scrollTop = document.documentElement.scrollTop = 0
    }
  }

  deactivate (): void {
    this.displayReport = null
    this.doubleColumnPanel.deactivate()
  }

  showFloorListChanged (show: boolean) {
    this.showFloorList = show
  }
}
</script>
