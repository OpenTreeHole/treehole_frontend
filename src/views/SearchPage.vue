<template>
  <search-floor-list
    v-if="searchStr"
    :search-str="searchStr"
    :key="searchStr"
  />
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { EventBus } from '@/event-bus'
import SearchFloorList from '@/components/column/SearchFloorList.vue'
import BaseView from '@/mixins/BaseView.vue'

@Component({
  components: {
    SearchFloorList
  }
})
export default class SearchPage extends BaseView {
  searchStr = ''

  search(searchStr: string) {
    this.searchStr = searchStr
  }

  async mounted() {
    if (this.$route.query.wd && typeof this.$route.query.wd === 'string') {
      this.searchStr = this.$route.query.wd
    }
    EventBus.$on('search', this.search)
  }

  destroyed() {
    EventBus.$off('search', this.search)
  }
}
</script>
