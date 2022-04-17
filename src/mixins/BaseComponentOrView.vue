<script lang="ts">
import Vue from 'vue'

import { Component, Inject, Watch } from 'vue-property-decorator'
import MessageStore from '@/store/modules/MessageStore'
import UtilStore from '@/store/modules/UtilStore'
import TagStore from '@/store/modules/TagStore'
import { EventBus } from '@/event-bus'
import WsMessage from '@/models/websocket/WsMessage'
import { ITag } from '@/models/tag'
import { BehaviorSubject, Subscription } from 'rxjs'

@Component
export default class BaseComponentOrView extends Vue {
  @Inject() preloadSubject: BehaviorSubject<boolean>
  preloadSubscription: Subscription

  setMessageComponent = MessageStore.setMessageComponent
  messageError = MessageStore.messageError
  messageSuccess = MessageStore.messageSuccess
  messageInfo = MessageStore.messageInfo
  messageWarning = MessageStore.messageWarning
  checkDevice = UtilStore.checkDevice

  preloaded = false

  addTag = (route: string, tag: ITag) => TagStore.addTag({ route: route, tag: tag })
  clearTag = TagStore.clearTag

  get filteredTagMap() {
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

  onPreloaded() {}

  onWsMessage(msg: WsMessage) {}

  async mounted() {
    await this.$nextTick()
    this.subscribePreloading()
  }

  @Watch('themeClasses', { immediate: true })
  async themeClassesChanged() {
    await this.$nextTick()
    const keys = Object.keys(this.themeClasses)
    if (!this.$el.classList) return
    this.$el.classList.remove(...keys)
    for (const key of keys) {
      if (this.themeClasses[key]) {
        this.$el.classList.add(key)
      }
    }
  }

  activated() {
    EventBus.$off('receive-ws-message', this.onWsMessage)
    EventBus.$on('receive-ws-message', this.onWsMessage)
    if (this.preloadSubscription && this.preloadSubscription.closed) {
      this.subscribePreloading()
    }
  }

  deactivated() {
    EventBus.$off('receive-ws-message', this.onWsMessage)
    if (this.preloadSubscription) {
      this.preloadSubscription.unsubscribe()
    }
  }

  destroyed() {
    EventBus.$off('receive-ws-message', this.onWsMessage)
    if (this.preloadSubscription) {
      this.preloadSubscription.unsubscribe()
    }
  }

  private _preload() {
    this.preloaded = true
    this.onPreloaded()
  }

  private subscribePreloading() {
    this.preloadSubscription = this.preloadSubject.subscribe({
      next: (preloaded: boolean) => {
        if (preloaded && !this.preloaded) {
          this._preload()
        }
      }
    })
  }
}
</script>
