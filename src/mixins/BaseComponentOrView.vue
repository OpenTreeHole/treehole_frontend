<script lang='ts'>

import Vue from 'vue'

import { Component, Inject, Watch } from 'vue-property-decorator'
import MessageStore from '@/store/modules/MessageStore'
import UtilStore from '@/store/modules/UtilStore'
import TagStore from '@/store/modules/TagStore'
import { EventBus } from '@/event-bus'
import WsMessage from '@/models/websocket/WsMessage'
import { Tag } from '@/models/tag'
import { BehaviorSubject, Subscription } from 'rxjs'

@Component
export default class BaseComponentOrView extends Vue {
  @Inject() preloadSubject: BehaviorSubject<boolean>
  public preloadSubscription: Subscription

  public setMessageComponent = MessageStore.setMessageComponent
  public messageError = MessageStore.messageError
  public messageSuccess = MessageStore.messageSuccess
  public messageInfo = MessageStore.messageInfo
  public messageWarning = MessageStore.messageWarning
  public checkDevice = UtilStore.checkDevice

  public preloaded = false

  public addTag = (route: string, tag: Tag) => TagStore.addTag({ route: route, tag: tag })
  public clearTag = TagStore.clearTag

  get filtedTagMap () {
    return TagStore.tagMap
  }

  get themeClasses (): any {
    return {
      'theme--light': !this.$vuetify.theme.dark,
      'theme--dark': this.$vuetify.theme.dark
    }
  }

  get isMobile () {
    return UtilStore.isMobile
  }

  public onPreloaded () {
  }

  public onWsMessage (msg: WsMessage) {
  }

  async mounted () {
    await this.$nextTick()
    this.subscribePreloading()
  }

  @Watch('themeClasses', { immediate: true })
  async themeClassesChanged () {
    await this.$nextTick()
    const keys = Object.keys(this.themeClasses)
    this.$el.classList.remove(...keys)
    for (const key of keys) {
      if (this.themeClasses[key]) {
        this.$el.classList.add(key)
      }
    }
  }

  activated () {
    EventBus.$off('receive-ws-message', this.onWsMessage)
    EventBus.$on('receive-ws-message', this.onWsMessage)
    if (this.preloadSubscription && this.preloadSubscription.closed) {
      this.subscribePreloading()
    }
  }

  deactivated () {
    EventBus.$off('receive-ws-message', this.onWsMessage)
    if (this.preloadSubscription) {
      this.preloadSubscription.unsubscribe()
    }
  }

  destroyed () {
    EventBus.$off('receive-ws-message', this.onWsMessage)
    if (this.preloadSubscription) {
      this.preloadSubscription.unsubscribe()
    }
  }

  private _preload () {
    this.preloaded = true
    this.onPreloaded()
  }

  private subscribePreloading () {
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
