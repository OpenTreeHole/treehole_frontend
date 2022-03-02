<!--suppress ES6MissingAwait -->
<script lang='ts'>
import { Component } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import UserStore from '@/store/modules/UserStore'
import LocalStorageStore from '@/store/modules/LocalStorageStore'

@Component
export default class BaseView extends BaseComponentOrView {
  /**
   * Conduct Preloading.
   */
  public async preload (): Promise<void> {
    this.preloadSubject.next(false)
    if (!LocalStorageStore.token) return

    if (!this.$ws.isConnecting() && !this.$ws.isConnected()) {
      this.$ws.connect()
    }

    if (!this.$wsImage.isConnecting() && !this.$wsImage.isConnected()) {
      this.$wsImage.connect()
    }

    const requestDivision = UserStore.requestDivision
    const requestUserProfile = UserStore.requestUserProfile
    const taskList = [requestDivision(), requestUserProfile()]
    await Promise.all(taskList)
    this.preloadSubject.next(true)
  }

  public created () {
    this.preload()
  }
}
</script>
