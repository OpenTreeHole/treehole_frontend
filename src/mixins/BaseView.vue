<script lang='ts'>
import { Component } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import UserStore from '@/store/modules/UserStore'
import { EventBus } from '@/event-bus'
import LocalStorageStore from '@/store/modules/LocalStorageStore'

@Component
export default class BaseView extends BaseComponentOrView {
  public async preload (): Promise<void> {
    if (!LocalStorageStore.token) return
    try {
      const requestDivision = UserStore.requestDivision
      const requestUserProfile = UserStore.requestUserProfile
      const taskList = [requestDivision(), requestUserProfile()]
      await Promise.all(taskList)
      EventBus.$emit('preloaded')
    } catch (e) {
      console.log(e)
      this.messageError(e)
    }
  }

  public created () {
    this.preload()
  }
}
</script>
