<template>
  <search-floor-list v-if='searchStr' :search-str='searchStr' :key='searchStr'/>
</template>

<script lang='ts'>
import Component from 'vue-class-component'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { EventBus } from '@/event-bus'
import SearchFloorList from '@/components/hole/SearchFloorList.vue'

@Component({
  components: {
    SearchFloorList
  }
})
export default class Search extends BaseComponentOrView {
  public searchStr: string = ''

  public search (searchStr: string) {
    this.searchStr = searchStr
  }

  mounted () {
    if (this.$route.query.wd && typeof this.$route.query.wd === 'string') {
      this.searchStr = this.$route.query.wd
    }
    EventBus.$on('search', this.search)
  }

  destroyed () {
    EventBus.$off('search', this.search)
  }
}
</script>
