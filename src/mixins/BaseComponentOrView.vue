<script lang='ts'>

import Vue from 'vue'

import { Component } from 'vue-property-decorator'
import MessageStore from '@/store/modules/MessageStore'
import UtilStore from '@/store/modules/UtilStore'
import TagStore from '@/store/modules/TagStore'
import { Tag } from '@/api/hole'
import { EventBus } from '@/event-bus'

@Component
export default class BaseComponentOrView extends Vue {
  public setMessageComponent = MessageStore.setMessageComponent
  public messageError = MessageStore.messageError
  public messageSuccess = MessageStore.messageSuccess
  public messageInfo = MessageStore.messageInfo
  public messageWarning = MessageStore.messageWarning
  public checkDevice = UtilStore.checkDevice

  public addTag = (route: string, tag: Tag) => TagStore.addTag({ route: route, tag: tag })
  public clearTag = TagStore.clearTag

  get filtedTagMap () {
    return TagStore.tagMap
  }

  get isMobile () {
    return UtilStore.isMobile
  }

  public onPreloaded () {
  }

  created () {
    EventBus.$on('preloaded', this.onPreloaded)
  }

  destroyed () {
    EventBus.$off('preloaded', this.onPreloaded)
  }
}
</script>
