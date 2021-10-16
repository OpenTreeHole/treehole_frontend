<template>
  <v-container :options='option' id='discussionList'>
    <v-row
      v-for='(discussion, index) in discussions'
      :key='index'
    >
      <v-col>
        <DiscussionCard
          :discussion='discussion'
          :index='index'
          :activate='activate'
          :style-data='styleData[index]'
          @add-tag='addTag'
          @change-fold-status='changeFoldStatus'
          @refresh='refresh'
          @change-order='this.order=value'
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <!-- 载入中信息 -->
        <loading :length='discussions.length' :loadList='getDiscussions' ref='loading' />
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
  public option = {
    className: 'os-theme-dark',
    sizeAutoCapable: true,
    paddingAbsolute: true,
    scrollbars: {
      clickScrolling: true
    }
  }

  @Prop({
    required: true,
    type: Function
  }) readonly activate: Function | undefined

  public height (): number {
    const discussionListElement = document.getElementById('discussionList')
    if (!discussionListElement) return 0
    return parseInt(window.getComputedStyle(discussionListElement).height)
  }
}
</script>
