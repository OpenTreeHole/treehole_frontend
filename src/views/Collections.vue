<template>
  <v-container class='pa-0 max-height'>
    <!-- 帖子列表 -->
    <HolePanel v-if='!isMobile'/>
    <HoleListMobile v-else />

  </v-container>
</template>

<script lang='ts'>
import { Component } from 'vue-property-decorator'
import HolePanel from '@/components/hole/HolePanel.vue'
import HoleListMobile from '@/components/hole/HoleListMobile.vue'
import BaseView from '@/mixins/BaseView.vue'

@Component({
  components: {
    HolePanel,
    HoleListMobile
  }
})
export default class Collections extends BaseView {
}
</script>

<style scoped>

</style>
