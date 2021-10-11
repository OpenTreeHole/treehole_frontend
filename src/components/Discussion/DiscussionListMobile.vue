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
          :dlist='instance'
          :activate='toDiscussion'
        ></DiscussionCard
        >
      </v-col>
    </v-row>
    <!-- 载入中信息 -->
    <loading :length='discussions.length' :loadList='getDiscussions'></loading>
  </v-container>
</template>

<script>
import DiscussionListMixin from '@/mixins/DiscussionListMixin'
import Loading from '@/components/Loading.vue'
import DiscussionCard from '@/components/Discussion/DiscussionCard.vue'

export default {
  name: 'DiscussionList',
  data () {
    return {
      instance: this
    }
  },
  components: {
    DiscussionCard,
    Loading
  },
  methods: {
    toDiscussion (id) {
      setTimeout(() => {
        this.$router.push({
          path: `/discussion/${id}`
        })
      }, 50)
    }
  },
  extends: DiscussionListMixin
}
</script>
