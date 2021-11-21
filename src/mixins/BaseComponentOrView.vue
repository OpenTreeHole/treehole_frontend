<script lang='ts'>

import Vue from 'vue'

import { Component } from 'vue-property-decorator'
import MessageStore from '@/store/modules/MessageStore'
import UtilStore from '@/store/modules/UtilStore'
import TagStore from '@/store/modules/TagStore'
import { Tag } from '@/api/hole'

@Component
export default class BaseComponentOrView extends Vue {
  public setMessageComponent = MessageStore.setMessageComponent
  public messageError = MessageStore.messageError
  public messageSuccess = MessageStore.messageSuccess
  public messageInfo = MessageStore.messageInfo
  public messageWarning = MessageStore.messageWarning

  public isMobile = false

  public addTag = (route: string, tag: Tag) => TagStore.addTag({ route: route, tag: tag })
  public clearTag = TagStore.clearTag

  get filtedTagMap () {
    return TagStore.tagMap
  }

  /**
   * Check whether the device is narrow-screen or wide-screen and update isMobile property.
   */
  public checkDevice (): void {
    UtilStore.checkDevice()
    this.isMobile = UtilStore.isMobile
  }
}
</script>
