<template>
  <v-card class='rounded' :id='index'>
    <v-card-text class='d-flex pb-4 pt-2 text-body-2'>
      <span class='flex-left'>
        {{ floor.anonyname }}
      </span>
      <span class='flex-center'>
        {{ floor.timeCreated | timeDifference }}
      </span>
      <span class='flex-right'>
        <template v-if='!noAction'>
           <v-btn
             v-if='operations.length === 1'
             small
             text
             @click='report'
             class='grey--text'
             style='padding-bottom: -10px'
           >
              <v-icon>mdi-alert-outline</v-icon>
              <br />
              <span>举报</span>
            </v-btn>
            <v-menu
              v-else
              offset-y
            >
              <template #activator='{on, attrs}'>
                <v-btn
                  small
                  text
                  class='grey--text'
                  style='padding-bottom: -10px'
                  v-bind='attrs'
                  v-on='on'
                >
                  <v-icon>mdi-dots-horizontal</v-icon>
                  <br />
                  <span>更多</span>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for='op in operations'
                  :key='"operation-" + op.text'
                >
                  <v-btn
                    small
                    text
                    class='grey--text'
                    style='padding-bottom: -10px'
                    @click='op.operation'
                  >
                    <v-icon>mdi-{{ op.icon }}</v-icon>
                    <br />
                    <span>{{ op.text }}</span>
                  </v-btn>
                </v-list-item>
              </v-list>
            </v-menu>
        </template>
      </span>
    </v-card-text>

    <v-card-text class='py-0'>
      <!-- 正文部分 -->
      <div
        :index='index'
        class='floor-body markdown-body rich-text text--primary ma-0 text-body-1'
        v-html='floor.html'
      ></div>
    </v-card-text>

    <!-- 脚标 -->
    <v-card-text class='d-flex text-body-2 pb-2'>
      <span class='flex-left' v-html='idInfo'></span>
      <span class='flex-center'>
        <v-btn
          v-if='!noAction'
          small
          text
          @click='$emit("reply")'
          class='grey--text'
          style='padding-bottom: -10px'
        >
          <v-icon>mdi-reply-outline</v-icon>
          <br />
          <span>回复</span>
        </v-btn>
      </span>
      <span class='flex-right'>
        <v-btn
          small
          text
          @click='like'
          class='grey--text'
          style='padding-bottom: -10px'
        >
          <v-icon v-if='floor.liked'>mdi-thumb-up</v-icon>
          <v-icon v-else>mdi-thumb-up-outline</v-icon>
          <br />
          <span>{{ floor.like }}</span>
        </v-btn>
      </span>
    </v-card-text>

  </v-card>
</template>

<script lang='ts'>
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import { MarkedDetailedFloor, MarkedFloor } from '@/api/hole'
import Vue from 'vue'
import UserStore from '@/store/modules/UserStore'

interface Operation {
  icon: string
  text: string
  operation: Function
}

@Component
export default class FloorCard extends BaseComponentOrView {
  @Prop({ required: true, type: Object }) floor: MarkedFloor
  @Prop({ required: false, type: Number, default: -1 }) index: number
  @Prop({ required: false, type: Boolean, default: false }) noAction: boolean

  get idInfo () {
    return this.index === -1 ? `<b>##${this.floor.floorId}</b>` : `<b>${this.index}L</b>(##${this.floor.floorId})`
  }

  /**
   * Any other operation except reply.
   */
  public operations: Operation[] = []

  public setOperation () {
    const opReport = {
      icon: 'alert-outline',
      text: '举报',
      operation: this.report
    }
    const opRemoveFloor = {
      icon: 'close-box-outline',
      text: '删除本层',
      operation: () => this.removeFloor(false)
    }
    const opRemoveFloorWithReason = {
      icon: 'close-box-outline',
      text: '删除本层',
      operation: () => this.removeFloor(true)
    }
    const opEdit = {
      icon: 'pencil-outline',
      text: '编辑',
      operation: () => this.$emit('edit')
    }
    const opPenalty = {
      icon: 'close-outline',
      text: '处罚',
      operation: this.penalty
    }
    if (this.floor instanceof MarkedDetailedFloor && this.floor.isMe) {
      this.operations = [opRemoveFloor, opEdit]
    } else if (UserStore.userProfile?.isAdmin) {
      this.operations = [opRemoveFloorWithReason, opEdit, opPenalty]
    } else {
      this.operations = [opReport]
    }
  }

  @Watch('floor', {
    immediate: true
  })
  floorChanged () {
    this.setOperation()
  }

  public penalty () {
    const msg = prompt('输入惩罚等级')
    if (msg == null) return
    const level = parseInt(msg)
    if (isNaN(level) || level < 0 || level > 3) this.messageError('非有效惩罚等级！（惩罚应为0,1,2或3）')
    this.$axios.post(`/penalty/${this.floor.floorId}`)
  }

  public like () {
    if (!(this.floor instanceof MarkedDetailedFloor)) return
    if (this.floor.liked) {
      Vue.set(this.floor, 'like', this.floor.like - 1)
    } else {
      this.floor.like++
    }
    const data = {
      like: this.floor.liked ? 'cancel' : 'add'
    }
    Vue.set(this.floor, 'liked', !this.floor.liked)
    this.$axios
      .put(`/floors/${this.floor.floorId}`, data)
      .then((response) => {
        if (response.data.liked) {
          this.messageSuccess('点赞成功')
        } else {
          this.messageSuccess('取消点赞成功')
        }
      })
      .catch((error) => {
        console.log(error)
        if (error.response && error.response.data.message) {
          this.messageError(error.response.data.message)
        } else if (error.status) {
          this.messageError('未知错误，状态码：' + error.status)
        } else this.messageError(error)
      })
  }

  public removeFloor (needReason?: boolean): void {
    let msg: string | null = ''
    if (needReason) {
      msg = prompt('输入删除理由')
      if (msg === null) return
    }
    const data: any = {}
    if (msg) data.delete_reason = msg
    this.$axios.delete(`/floors/${this.floor.floorId}`, data).then((response) => {
      if (response.status === 200) {
        this.messageSuccess('删除成功')
      } else {
        this.messageError(response.data.msg)
      }
    }).catch(e => {
      if ('response' in e) {
        if (e.response.status === 403) {
          this.messageError('没有权限删除')
        }
      } else {
        this.messageError(e)
      }
    })
  }

  /**
   * Send a report.
   */
  public report (): void {
    const msg = prompt('输入举报理由')
    if (msg === '') {
      this.messageError('举报理由不能为空！')
    }
    this.$axios.post('/reports', {
      floor_id: this.floor.floorId,
      reason: msg
    }).then((response) => {
      if (response.status === 200) {
        this.messageSuccess('举报成功')
      } else {
        this.messageError(response.data.msg)
      }
    })
  }
}
</script>

<style scoped>

</style>
