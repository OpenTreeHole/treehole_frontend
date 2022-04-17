<template>
  <v-container
    id="reportList"
    class="pa-0"
  >
    <v-row
      class="ma-0"
      v-for="(report, index) in reports"
      :key="`${index}`"
      justify="center"
    >
      <v-col :class="colClass">
        <report-card
          :report="report"
          @open-report="openReport"
          @refresh="refresh"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Emit } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import ReportCard from '@/components/card/ReportCard.vue'
import { Report } from '@/models/report'
import { listReports } from '@/apis'

@Component({
  components: { ReportCard }
})
export default class ReportList extends BaseComponentOrView {
  reports: Report[] = []

  @Emit()
  openReport(_report: Report) {}

  get colClass() {
    if (this.isMobile) return 'px-1 py-1'
    else return 'px-1 py-2'
  }

  async refresh() {
    this.reports = []
    await this.getReports()
  }

  async getReports() {
    this.reports = await listReports()
  }

  async mounted() {
    await this.getReports()
  }
}
</script>

<style scoped></style>
