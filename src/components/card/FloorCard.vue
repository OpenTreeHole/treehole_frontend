<template>
  <v-card
    class="rounded"
    :id="index"
    elevation="1"
  >
    <dynamic-expansion-panel :on="floor.fold.length > 0">
      <template #header>
        {{ floor.fold[0] }}
      </template>
      <template #content>
        <v-card-text class="d-flex pb-4 pt-2 text-body-2">
          <span class="flex-left">
            {{ floor.anonyname }}
          </span>
          <span class="flex-center">
            {{ floor.timeCreated | timeDifference }}
          </span>
          <span class="flex-right">
            <template v-if="!noAction">
              <v-btn
                v-if="operations.length === 1"
                small
                text
                @click="report"
                class="grey--text"
                style="padding-bottom: -10px"
              >
                <v-icon>mdi-alert-outline</v-icon>
                <br />
                <span>举报</span>
              </v-btn>
              <v-menu
                v-else
                offset-y
              >
                <template #activator="{ on, attrs }">
                  <v-btn
                    small
                    text
                    class="grey--text"
                    style="padding-bottom: -10px"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>mdi-dots-horizontal</v-icon>
                    <br />
                    <span>更多</span>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item
                    v-for="op in operations"
                    :key="'operation-' + op.text"
                  >
                    <v-btn
                      small
                      text
                      class="grey--text"
                      style="padding-bottom: -10px"
                      @click="op.operation"
                    >
                      <span
                        class="flex-left"
                        style="min-width: 30px"
                        ><v-icon v-if="op.icon">{{ op.icon }}</v-icon></span
                      >
                      <span class="flex-right">{{ op.text }}</span>
                    </v-btn>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </span>
        </v-card-text>

        <v-card-text class="py-0">
          <!-- 正文部分 -->
          <div
            :id="id"
            class="floor-body rich-text text--primary ma-0 text-body-1"
            v-html="floor.html"
          ></div>
        </v-card-text>

        <!-- 脚标 -->
        <v-card-text class="d-flex text-body-2 pb-2">
          <span
            class="flex-left"
            v-html="idInfo"
          ></span>
          <span class="flex-center">
            <create-floor-dialog
              v-if="!noAction"
              :reply-floor="floor"
              :hole-id="floor.holeId"
              @continue-load="continueLoad"
            >
              <template #activator="{ on, attrs }">
                <v-btn
                  small
                  text
                  class="grey--text"
                  style="padding-bottom: -10px"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon>mdi-reply-outline</v-icon>
                  <br />
                  <span>回复</span>
                </v-btn>
              </template>
            </create-floor-dialog>
          </span>
          <span class="flex-right">
            <v-btn
              small
              text
              @click="like"
              class="grey--text"
              style="padding-bottom: -10px"
            >
              <v-icon v-if="floor.liked">mdi-thumb-up</v-icon>
              <v-icon v-else>mdi-thumb-up-outline</v-icon>
              <br />
              <span>{{ floor.like }}</span>
            </v-btn>
          </span>
        </v-card-text>
      </template>
    </dynamic-expansion-panel>
    <create-floor-dialog
      v-model="dialog"
      :reply-floor="replyFloor"
      operation="edit"
      :floor-id="floor.floorId"
      @update-floor="updateFloor"
    />
  </v-card>
</template>

<script lang="ts">
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Component, Emit, Prop, Watch } from 'vue-property-decorator'
import UserStore from '@/store/modules/UserStore'
import { DetailedFloor, Floor } from '@/models/floor'
import { gotoHole, renderFloor } from '@/utils/floor'
import DynamicExpansionPanel from '@/components/animation/DynamicExpansionPanel.vue'
import CreateFloorDialog from '@/components/dialog/CreateFloorDialog.vue'
import { addPenalty, addReport, addSpecialTag, deleteFloor, likeFloor } from '@/apis'

interface Operation {
  icon: string | null
  text: string
  operation: () => unknown
}

@Component({
  components: { CreateFloorDialog, DynamicExpansionPanel }
})
export default class FloorCard extends BaseComponentOrView {
  @Prop({ required: true, type: Object }) floor: Floor
  @Prop({ required: false, type: Number, default: -1 }) divisionId: number
  @Prop({ required: false, type: Number, default: -1 }) index: number
  @Prop({ required: false, type: Boolean, default: false }) noAction: boolean
  @Prop({ type: String, default: 'fl' }) idPrefix: string

  dialog = false

  display = false

  get idInfo() {
    return this.index === -1 ? `<b>##${this.floor.floorId}</b>` : `<b>${this.index}L</b>(##${this.floor.floorId})`
  }

  get id() {
    return `${this.idPrefix}-${this.floor.floorId}`
  }

  get replyFloor() {
    if (this.floor instanceof DetailedFloor && this.floor.mention[0]) {
      return this.floor.mention[0]
    }
    return undefined
  }

  @Emit('continue-load')
  continueLoad() {}

  @Emit('update-floor')
  updateFloor() {}

  toMention(mentionFloor: Floor) {
    if (this.floor.holeId === mentionFloor.holeId) {
      this.$emit('scroll-to-floor', mentionFloor.floorId)
    } else {
      gotoHole(mentionFloor.holeId, mentionFloor.floorId)
    }
  }

  renderMentions() {
    if (this.floor instanceof DetailedFloor) {
      renderFloor(this, this.floor, this.toMention)
    }
  }

  rerenderSpecificMention(mentionFloor: Floor) {
    if (this.floor instanceof DetailedFloor && this.floor.mention.length !== 0) {
      let flag = false
      for (let i = 0; i < this.floor.mention.length; i++) {
        if (this.floor.mention[i].floorId === mentionFloor.floorId) {
          this.floor.mention[i] = mentionFloor
          flag = true
        }
      }
      if (flag) {
        this.floor.html += ' '
        renderFloor(this, this.floor, this.toMention)
      }
    }
  }

  async mounted() {
    this.renderMentions()
  }

  async created() {
    this.display = this.floor.fold.length === 0
  }

  @Watch('floor', { deep: true })
  floorUpdated() {
    this.renderMentions()
  }

  /**
   * Any other operation except reply.
   */
  get operations(): Operation[] {
    const opReport = {
      icon: 'mdi-alert-outline',
      text: '举报',
      operation: this.report
    }
    const opRemoveFloor = {
      icon: 'mdi-close-box-outline',
      text: '删除本层',
      operation: () => this.removeFloor(false)
    }
    const opRemoveFloorWithReason = {
      icon: 'mdi-close-box-outline',
      text: '删除本层',
      operation: () => this.removeFloor(true)
    }
    const opEdit = {
      icon: 'mdi-pencil-outline',
      text: '编辑',
      operation: () => {
        this.dialog = true
      }
    }
    const opPenalty = {
      icon: 'mdi-close-outline',
      text: '处罚',
      operation: this.penalty
    }
    const opSpecialTag = {
      icon: null,
      text: '新增特殊标签',
      operation: this.addSpecialTag
    }
    if (this.floor instanceof DetailedFloor && this.floor.isMe) {
      return [opRemoveFloor, opEdit]
    } else if (UserStore.user?.isAdmin) {
      return [opRemoveFloorWithReason, opEdit, opPenalty, opSpecialTag]
    } else {
      return [opReport]
    }
  }

  async addSpecialTag() {
    const msg = prompt('输入特殊标签')
    if (msg == null) return
    await addSpecialTag(this.floor.floorId, msg)
    this.messageSuccess(`添加特殊标签"${msg}"成功！`)
  }

  async penalty() {
    const msg = prompt('输入惩罚等级')
    if (msg == null) return
    const level = parseInt(msg)
    if (isNaN(level) || level < 0 || level > 3) this.messageError('非有效惩罚等级！（惩罚应为0,1,2或3）')
    await addPenalty(this.floor.floorId, level, this.divisionId)
    this.messageSuccess(`处罚成功！等级为：${level}`)
  }

  async like() {
    if (!(this.floor instanceof DetailedFloor)) return

    this.floor.like = this.floor.liked ? this.floor.like - 1 : this.floor.like + 1
    this.floor.liked = !this.floor.liked
    const { liked } = await likeFloor(this.floor.floorId, this.floor.liked)

    if (liked) this.messageSuccess('点赞成功')
    else this.messageSuccess('取消点赞成功')
  }

  async removeFloor(needReason?: boolean) {
    let msg: string | null = ''
    if (needReason) {
      msg = prompt('输入删除理由')
      if (msg == null) return
    }

    await deleteFloor(this.floor.floorId, msg ?? undefined)

    this.messageSuccess('删除成功！')
  }

  /**
   * Send a report.
   */
  async report() {
    const msg = prompt('输入举报理由')
    if (!msg) {
      this.messageError('举报理由不能为空！')
      return
    }
    await addReport(this.floor.floorId, msg)
    this.messageSuccess('举报成功')
  }
}
</script>

<style scoped></style>
