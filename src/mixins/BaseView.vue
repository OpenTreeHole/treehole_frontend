<!--suppress ES6MissingAwait -->
<script lang="ts">
import { Component } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import UserStore from '@/store/modules/UserStore'
import LocalStorageStore from '@/store/modules/LocalStorageStore'

@Component
export default class BaseView extends BaseComponentOrView {
  /**
   * Conduct Preloading.
   */
  async preload(): Promise<void> {
    this.preloadSubject.next(false)
    if (!LocalStorageStore.access) return

    if (!this.$ws.isConnecting() && !this.$ws.isConnected()) {
      this.$ws.connect()
    }

    await Promise.all([UserStore.requestDivisions(), UserStore.requestUser(), UserStore.requestTags()])
    this.$router.options.routes!.find((v) => v.name === 'division')!.meta!.children = UserStore.divisions.map((v) => ({
      path: `/${v.divisionId}`,
      meta: {
        title: v.name,
        hide: false,
        requireAuth: true,
        requireAdmin: false,
        params: {
          id: v.divisionId.toString()
        }
      }
    }))
    this.preloadSubject.next(true)
  }

  async created() {
    await this.preload()
  }
}
</script>
