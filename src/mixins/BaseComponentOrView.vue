<script lang='ts'>

import Vue from 'vue'

import { Component, Watch } from 'vue-property-decorator'
import MessageStore from '@/store/modules/MessageStore'
import UtilStore from '@/store/modules/UtilStore'
import TagStore from '@/store/modules/TagStore'
import { EventBus } from '@/event-bus'
import WsMessage from '@/models/websocket/WsMessage'
import { Tag } from '@/models/tag'

@Component
export default class BaseComponentOrView extends Vue {
  public setMessageComponent = MessageStore.setMessageComponent
  public messageError = MessageStore.messageError
  public messageSuccess = MessageStore.messageSuccess
  public messageInfo = MessageStore.messageInfo
  public messageWarning = MessageStore.messageWarning
  public checkDevice = UtilStore.checkDevice

  public preloaded = false

  public addTag = (route: string, tag: Tag) => TagStore.addTag({ route: route, tag: tag })
  public clearTag = TagStore.clearTag

  get filtedTagMap() {
    return TagStore.tagMap
  }

  get themeClasses(): any {
    return {
      'theme--light': !this.$vuetify.theme.dark,
      'theme--dark': this.$vuetify.theme.dark
    }
  }

  get isMobile() {
    return UtilStore.isMobile
  }

  public onPreloaded() {
    this.preloaded = true
  }

  public onWsMessage(msg: WsMessage) {
  }

  created() {
    EventBus.$on('preloaded', this.onPreloaded)
    EventBus.$on('receive-ws-message', this.onWsMessage)
  }

  @Watch('themeClasses', { immediate: true })
  async themeClassesChanged() {
    await this.$nextTick()
    const keys = Object.keys(this.themeClasses)
    this.$el.classList.remove(...keys)
    for (const key of keys) {
      if (this.themeClasses[key]) {
        this.$el.classList.add(key)
      }
    }
  }

  activated() {
    EventBus.$off('preloaded', this.onPreloaded)
    EventBus.$off('receive-ws-message', this.onWsMessage)
    EventBus.$on('preloaded', this.onPreloaded)
    EventBus.$on('receive-ws-message', this.onWsMessage)
  }

  deactivated() {
    EventBus.$off('preloaded', this.onPreloaded)
    EventBus.$off('receive-ws-message', this.onWsMessage)
  }

  destroyed () {
    EventBus.$off('preloaded', this.onPreloaded)
    EventBus.$off('receive-ws-message', this.onWsMessage)
  }
}
</script>
