<template>
  <app-menu
    key="notifications-menu"
    v-model="menu"
    :close-on-content-click="false"
    :max-width="maxWidth"
    bottom
    content-class="overflow-hidden"
    left
  >
    <template #activator="{ attrs, on }">
      <app-tooltip-btn
        text="通知"
        v-bind="attrs"
        v-on="on"
      >
        <template #icon>
          <v-badge
            :value="unread.length"
            color="#ED561B"
            dot
            left
            overlap
          >
            <v-icon
              class="mx-1"
              v-text="`mdi-bell-${unread.length === 0 ? 'outline' : 'ring-outline'}`"
            />
          </v-badge>
        </template>
      </app-tooltip-btn>
    </template>

    <v-toolbar
      :width="maxWidth"
      class="pr-5"
      flat
      short
    >
      <v-btn
        :disabled="archived ? unread.length < 1 : read.length < 1"
        class="px-2 ml-n1"
        small
        text
        @click="archived = !archived"
      >
        View {{ archived ? 'Unread' : 'Read' }} {{ (archived ? unread : read).length }}
      </v-btn>

      <v-spacer />

      <app-tooltip-btn
        v-if="marked"
        :disabled="done"
        :icon="marked.icon"
        :text="toggleMsg"
        small
        @click="toggleAll"
      />
    </v-toolbar>

    <v-divider />

    <v-responsive ref="responsive">
      <div
        v-if="done"
        class="py-8 text-center text-subtitle-1"
      >
        <div>All done</div>

        <v-icon
          color="grey lighten-2"
          size="96"
        >
          mdi-vuetify
        </v-icon>
      </div>

      <overlay-scrollbars
        v-else
        style="height: 320px"
      >
        <v-list-item
          v-for="msg in filtered"
          :key="msg.messageId"
          :ripple="false"
          @click="select(msg)"
        >
          <notification-floor-card-menu
            v-if="msg.marked && !isMobile"
            :floor="msg.marked"
          >
            <template #activator="{ attrs, on }">
              <v-list-item-content
                v-bind="attrs"
                v-on="on"
              >
                <div
                  class="grey--text text--darken-1 text-caption font-weight-light text-uppercase"
                  v-text="msg.timeCreatedDifference"
                />

                <v-list-item-title
                  class="text-subtitle-1"
                  v-text="msg.message"
                />
              </v-list-item-content>
            </template>
          </notification-floor-card-menu>
          <v-list-item-content v-else>
            <div
              class="grey--text text--darken-1 text-caption font-weight-light text-uppercase"
              v-text="msg.timeCreatedDifference"
            />

            <v-list-item-title
              class="text-subtitle-1"
              v-text="msg.message"
            />
          </v-list-item-content>

          <v-list-item-action>
            <v-btn
              :ripple="false"
              icon
              @click.stop.prevent="toggle(msg.messageId)"
            >
              <v-icon v-text="marked.icon" />
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </overlay-scrollbars>
    </v-responsive>
  </app-menu>
</template>

<script lang="ts">
import { Component, Ref } from 'vue-property-decorator'
import AppMenu from '@/components/app/AppMenu.vue'
import AppTooltipBtn from '@/components/app/AppTooltipBtn.vue'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import WsMessage from '@/models/websocket/WsMessage'
import WsNotificationMessage from '@/models/websocket/WsNotificationMessage'
import { timeDifference } from '@/utils/utils'
import NotificationFloorCardMenu from '@/components/menu/NotificationFloorCardMenu.vue'
import { openDivisionAndGotoHole } from '@/utils/floor'
import Vue from 'vue'
import { DetailedFloor } from '@/models/floor'

@Component({
  components: {
    NotificationFloorCardMenu,
    AppMenu,
    AppTooltipBtn
  }
})
export default class NotificationsMenu extends BaseComponentOrView {
  archived = false
  icons = {
    read: 'mdi-email-open',
    unread: 'mdi-email-mark-as-unread'
  }

  menu = false

  readRaw: WsNotificationMessage[] = []
  unreadRaw: WsNotificationMessage[] = []

  @Ref() responsive: Vue

  get read() {
    return this.readRaw.map((v) => {
      if (!('floorId' in v.data)) return { ...v, timeCreatedDifference: timeDifference(v.timeCreated) }
      const marked = new DetailedFloor(v.data)
      return { ...v, timeCreatedDifference: timeDifference(v.timeCreated), marked }
    })
  }

  get unread() {
    return this.unreadRaw.map((v) => {
      if (!('floorId' in v.data)) return { ...v, timeCreatedDifference: timeDifference(v.timeCreated) }
      const marked = new DetailedFloor(v.data)
      return { ...v, timeCreatedDifference: timeDifference(v.timeCreated), marked }
    })
  }

  get done() {
    return this.filtered.length === 0
  }

  get filtered() {
    return this.archived ? this.read : this.unread
  }

  get marked() {
    const path = this.archived ? 'unread' : 'read'
    const icon = this.icons[path]

    if (!icon || !path) return null

    return { icon }
  }

  get maxWidth() {
    return this.isMobile ? 296 : 450
  }

  get toggleMsg() {
    return this.archived ? '标记为未读' : '标记为已读'
  }

  select(msg: WsNotificationMessage) {
    openDivisionAndGotoHole(msg.data.holeId, msg.data.floorId)
    this.toggle(msg.messageId)

    this.menu = false
  }

  toggle(msgId: number) {
    this.$ws.sendAction({ action: this.archived ? 'unread' : 'read', id: msgId })

    const all = this.readRaw.concat(this.unreadRaw).sort((a, b) => b.messageId - a.messageId)
    all.forEach((v) => {
      if (v.messageId === msgId) v.hasRead = !v.hasRead
    })
    this.readRaw = all.filter((v) => v.hasRead)
    this.unreadRaw = all.filter((v) => !v.hasRead)
  }

  toggleAll() {
    if (this.archived) {
      this.readRaw.forEach((v) => {
        this.$ws.sendAction({ action: 'unread', id: v.messageId })
      })
    } else this.$ws.sendAction({ action: 'clear' })

    const all = this.readRaw.concat(this.unreadRaw).sort((a, b) => b.messageId - a.messageId)
    this.readRaw = this.unreadRaw = []
    if (this.archived) this.unreadRaw = all
    else this.readRaw = all
  }

  onWsMessage(msg: WsMessage) {
    if (msg instanceof WsNotificationMessage) {
      let all = this.readRaw.concat(this.unreadRaw)
      let flag = false
      for (let i = 0; i < all.length; i++) {
        if (all[i].messageId === msg.messageId) {
          all[i] = msg
          flag = true
          break
        }
      }
      if (!flag) all = [...all, msg]
      all = all.sort((a, b) => b.messageId - a.messageId)
      this.readRaw = all.filter((v) => v.hasRead)
      this.unreadRaw = all.filter((v) => !v.hasRead)
    }
  }
}
</script>
