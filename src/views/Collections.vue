<template>
  <v-container>
    <!-- 帖子列表 -->
    <DiscussionComponent v-if='!isMobile' ref='holeComp'/>
    <DiscussionListMobile v-else ref='holeComp' />

  </v-container>
</template>

<script>
import { Component } from 'vue-property-decorator'
import DiscussionComponent from '@/components/Discussion/DiscussionComponent.vue'
import DiscussionListMobile from '@/components/Discussion/DiscussionListMobile.vue'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'

@Component({
  components: {
    DiscussionComponent,
    DiscussionListMobile
  }
})
export default class Collections extends BaseComponentOrView {
}
</script>

<style scoped>

</style>
