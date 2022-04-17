<template>
  <v-card
    class="rounded pb-1"
    elevation="1"
  >
    <v-card-text class="d-flex pb-4 pt-2 text-body-2">
      <span class="flex-left"> Report ID: {{ report.reportId }} </span>
      <span class="flex-center">
        {{ report.timeCreated | timeDifference }}
      </span>
      <span class="flex-right">
        <report-deal-dialog
          :report="report"
          @refresh="$emit('refresh')"
        >
          <template #activator="{ on, attrs }">
            <v-btn
              small
              text
              class="grey--text"
              style="padding-bottom: -10px"
              v-on="on"
              v-bind="attrs"
            >
              <v-icon>mdi-alert-outline</v-icon>
              <br />
              <span>处理</span>
            </v-btn>
          </template>
        </report-deal-dialog>
      </span>
    </v-card-text>

    <v-card-text
      @click="openReport(report)"
      class="text--primary py-2 text-body-1 clickable"
      v-ripple
    >
      <span v-text="report.reason" />
    </v-card-text>

    <floor-card
      class="mx-1"
      :floor="floor"
      :no-action="true"
    />
  </v-card>
</template>

<script lang="ts">
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Component, Emit, Prop } from 'vue-property-decorator'
import { Report } from '@/models/report'
import FloorCard from '@/components/card/FloorCard.vue'
import ReportDealDialog from '@/components/dialog/ReportDealDialog.vue'

@Component({
  components: { ReportDealDialog, FloorCard }
})
export default class ReportCard extends BaseComponentOrView {
  @Prop({ required: true, type: Object }) report: Report

  get floor() {
    return this.report.floor
  }

  @Emit()
  openReport(_report: Report) {}
}
</script>

<style
  lang="scss"
  scoped
></style>
