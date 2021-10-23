<template>
  <v-container id='discussionList' class='pa-0'>
    <v-row
      v-for='(discussion, index) in discussions'
      :key='index'
    >
      <v-col>
        <DiscussionCard
          :discussion='discussion'
          :index='index'
          :activate='activate'
          @refresh='refresh'
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <!-- 载入中信息 -->
        <loading :request='getHoles' ref='loading' :pause-loading='pauseLoading'/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
import DiscussionCard from '@/components/Discussion/DiscussionCard.vue'
import DiscussionListMixin from '@/mixins/DiscussionListMixin.vue'
import Loading from '@/components/Loading.vue'
import { Component, Prop } from 'vue-property-decorator'

@Component({
  components: {
    DiscussionCard,
    Loading
  }
})
export default class DiscussionList extends DiscussionListMixin {
  @Prop({
    required: true,
    type: Function
  }) readonly activate: Function | undefined

  /**
   * Calculate the height of the hole list.
   */
  public getHeight (): number {
    const holeListElement = document.getElementById('discussionList')
    if (!holeListElement) return 0
    return parseInt(window.getComputedStyle(holeListElement).height)
  }
}
</script>
