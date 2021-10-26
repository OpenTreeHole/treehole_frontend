<template>
  <v-container>
    <v-row
      v-for='(discussion, index) in discussions'
      :key='index'
      justify='center'
      class='ma-0'
    >
      <v-col cols='12' sm='10' md='8' lg='6' xl='4'>
        <DiscussionCard
          :discussion='discussion'
          :index='index'
          @refresh='refresh'
          :activate='toDiscussion'
        />
      </v-col>
    </v-row>
    <!-- 载入中信息 -->
    <loading :request='getHoles' ref='loading' :pause-loading='pauseLoading'/>
  </v-container>
</template>

<script lang='ts'>
import DiscussionListMixin from '@/mixins/DiscussionListMixin.vue'
import Loading from '@/components/Loading.vue'
import DiscussionCard from '@/components/Discussion/DiscussionCard.vue'
import { Component } from 'vue-property-decorator'
import { WrappedHole } from '@/api/hole'

@Component({
  components: {
    DiscussionCard,
    Loading
  }
})
export default class DiscussionList extends DiscussionListMixin {
  /**
   * Set router to the hole page.
   *
   * @param wrappedHole - the hole.
   */
  public toDiscussion (wrappedHole: WrappedHole): void {
    setTimeout(() => {
      this.$router.push({
        path: `/discussion/${wrappedHole.hole.holeId}`
      })
    }, 50)
  }
}
</script>
