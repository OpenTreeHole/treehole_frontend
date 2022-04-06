<template>
  <v-container class='pa-0 max-height'>
    <!-- 帖子列表 -->
    <HolePanel v-if='!isMobile'/>
    <HoleListMobile v-else />

  </v-container>
</template>

<script lang='ts'>
import { Component, Provide } from 'vue-property-decorator'
import HolePanel from '@/components/panel/HolePanel.vue'
import HoleListMobile from '@/components/column/HoleListMobile.vue'
import BaseView from '@/mixins/BaseView.vue'
import UtilStore from '@/store/modules/UtilStore'

@Component({
  components: {
    HolePanel,
    HoleListMobile
  }
})
export default class CollectionPage extends BaseView {
  @Provide() holeListType = 'collection'

  async mounted () {
    UtilStore.setCurrentDivisionId(null)
  }
}
</script>
