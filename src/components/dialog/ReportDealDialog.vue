<template>
  <v-dialog
    content-class="my-n4 mx-3"
    v-model="dialog"
    :max-width="dialogWidth"
  >
    <template #activator="props">
      <slot
        name="activator"
        v-bind="{ ...props }"
      />
    </template>
    <v-card>
      <v-card-title>
        <span>处理举报</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form">
          <v-radio-group
            v-model="dealType"
            row
          >
            <v-radio
              label="无"
              :value="null"
            />
            <v-radio
              label="折叠"
              value="fold"
            />
            <v-radio
              label="删除"
              value="delete"
            />
          </v-radio-group>
          <v-textarea
            v-if="dealType"
            solo
            :label="reasonDefault[dealType]"
            v-model="reason[dealType]"
          ></v-textarea>
          <v-radio-group
            v-model="silent"
            row
          >
            <template v-slot:label>
              <div>禁言等级：</div>
            </template>
            <v-radio
              label="不禁言"
              :value="0"
            />
            <v-radio
              label="1"
              :value="1"
            />
            <v-radio
              label="2"
              :value="2"
            />
          </v-radio-group>
          <v-btn
            color="success"
            @click="submit"
            >执行</v-btn
          >
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Component, ModelSync, Prop, Ref } from 'vue-property-decorator'
import { IReportDeal, Report } from '@/models/report'
import { dealReport } from '@/apis'

@Component
export default class ReportDealDialog extends BaseComponentOrView {
  @Prop({ required: true, type: Object }) report: Report

  @ModelSync('dialogProp', 'change', { type: Boolean, default: false }) dialog: boolean

  dealType: string | null = null
  reason = { fold: '', delete: '' }
  reasonDefault = { fold: '该内容已被折叠', delete: '该内容因违反社区规范被删除' }
  silent = 0

  get dialogWidth() {
    return this.isMobile ? '98vw' : '70vw'
  }

  @Ref() readonly form!: HTMLFormElement

  get reasonSubmit() {
    return {
      fold: this.reason.fold || this.reasonDefault.fold,
      delete: this.reason.delete || this.reasonDefault.delete
    }
  }

  async submit() {
    if (this.form.validate()) {
      this.dialog = false
      const data: IReportDeal = {}
      if (this.dealType === 'fold') {
        data.fold = [this.reasonSubmit.fold]
        data.silent = this.silent
      } else if (this.dealType === 'delete') {
        data.delete = this.reasonSubmit.delete
        data.silent = this.silent
      }
      const message = await dealReport(this.report.reportId, data)
      this.reason = { fold: '', delete: '' }
      this.silent = 0
      this.messageSuccess(message)
      this.$emit('refresh')
    }
  }
}
</script>
