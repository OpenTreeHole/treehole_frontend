<template>
  <v-container>
    <!-- 帖子列表 -->
    <HolePanel v-if='!isMobile'/>
    <HoleListMobile v-else />

  </v-container>
</template>

<script lang='ts'>
import { Component } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import HolePanel from '@/components/hole/HolePanel.vue'
import HoleListMobile from '@/components/hole/HoleListMobile.vue'

@Component({
  components: {
    HolePanel,
    HoleListMobile
  }
})
export default class Collections extends BaseComponentOrView {
}
</script>

<style scoped>

</style>
