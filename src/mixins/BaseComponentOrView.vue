<script lang='ts'>

import Vue from 'vue'

import { Component } from 'vue-property-decorator'
import MessageStore from '@/store/modules/MessageStore'
import UtilStore from '@/store/modules/UtilStore'

@Component
export default class BaseComponentOrView extends Vue {
  public setMessageComponent = MessageStore.setMessageComponent
  public messageError = MessageStore.messageError
  public messageSuccess = MessageStore.messageSuccess
  public messageInfo = MessageStore.messageInfo
  public messageWarning = MessageStore.messageWarning
  public isMobile = false

  /**
   * Check whether the device is narrow-screen or wide-screen and update isMobile property.
   */
  public checkDevice (): void {
    UtilStore.checkDevice()
    this.isMobile = UtilStore.isMobile
  }
}
</script>
