<template>
  <v-container>
    <v-row
      v-for='(discussion, index) in discussions'
      :key='index'
      justify='center'
      class='ma-0'
    >
      <v-col cols='12' sm='10' md='8' lg='6' xl='4'
      >
        <DiscussionCard
          :discussion='discussion'
          :index='index'
          :style-data='styleData[index]'
          @add-tag='addTag'
          @change-fold-status='changeFoldStatus'
          @refresh='refresh'
          @change-order='this.order=value'
          :activate='toDiscussion'
        ></DiscussionCard
        >
      </v-col>
    </v-row>
    <!-- 载入中信息 -->
    <loading :length='discussions.length' :loadList='getDiscussions'></loading>
  </v-container>
</template>

<script lang='ts'>
import DiscussionListMixin from '@/mixins/DiscussionListMixin.vue'
import Loading from '@/components/Loading.vue'
import DiscussionCard from '@/components/Discussion/DiscussionCard.vue'
import { Component } from 'vue-property-decorator'

@Component({
  components: {
    DiscussionCard,
    Loading
  }
})
export default class DiscussionList extends DiscussionListMixin {
  public toDiscussion (id: number): void {
    setTimeout(() => {
      this.$router.push({
        path: `/discussion/${id}`
      })
    }, 50)
  }
}
</script>
