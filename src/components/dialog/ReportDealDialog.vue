<template>
  <v-dialog content-class='my-n4 mx-3' v-model='dialog' :max-width='dialogWidth'>
    <template #activator='props'>
      <slot
        name='activator'
        v-bind='{ ...props }'
      />
    </template>
    <v-card>
      <v-card-title>
        <span>处理举报</span>
      </v-card-title>
      <v-card-text>
        <v-form ref='form'>
          <v-radio-group v-model='dealType' row>
            <v-radio
              label='无'
              :value='null'
            />
            <v-radio
              label='折叠'
              value='fold'
            />
            <v-radio
              label='删除'
              value='delete'
            />
          </v-radio-group>
          <v-textarea
            v-if='dealType'
            solo
            :label='reasonDefault[dealType]'
            v-model='reason[dealType]'
          ></v-textarea>
          <v-radio-group v-model='silent' row>
            <template v-slot:label>
              <div>禁言等级：</div>
            </template>
            <v-radio label='不禁言' :value='0' />
            <v-radio label='1' :value='1' />
            <v-radio label='2' :value='2' />
          </v-radio-group>
          <v-btn color='success' @click='submit'>执行</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang='ts'>
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Component, Prop, Ref } from 'vue-property-decorator'
import { Report } from '@/models/report'

@Component
export default class ReportDealDialog extends BaseComponentOrView {
  @Prop({ required: true, type: Object }) report: Report

  public dialog = false
  public dealType: string | null = null
  public reason = { fold: '', delete: '' }
  public reasonDefault = { fold: '该内容已被折叠', delete: '该内容因违反社区规范被删除' }
  public silent = 0

  get dialogWidth () {
    return this.isMobile ? '98vw' : '70vw'
  }

  @Ref() readonly form!: HTMLFormElement

  get reasonSubmit () {
    return {
      fold: this.reason.fold || this.reasonDefault.fold,
      delete: this.reason.delete || this.reasonDefault.delete
    }
  }

  public async submit () {
    if (this.form.validate()) {
      this.dialog = false
      const data: any = {}
      if (this.dealType === 'fold') {
        data.fold = this.reasonSubmit.fold
        data.silent = this.silent
      } else if (this.dealType === 'delete') {
        data.delete = this.reasonSubmit.delete
        data.silent = this.silent
      }
      const response = await this.$axios.delete(`/reports/${this.report.reportId}`, {
        data: data
      })
      this.reason = { fold: '', delete: '' }
      this.silent = 0
      this.messageSuccess(response.data.message)
      this.$emit('refresh')
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
