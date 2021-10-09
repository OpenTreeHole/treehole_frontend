<template>
  <v-container :options='option'>
    <v-row
      v-for='(discussion, index) in discussions'
      :key='index'
    >
      <v-col>
        <DiscussionCard
          :discussion='discussion'
          :index='index'
          :dlist='instance'
          :activate='activate'
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <!-- 载入中信息 -->
        <loading :length='discussions.length' :loadList='getDiscussions' ref='loading'
                 @intersectionChange='ChangeLoadingVisibility' />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import DiscussionCard from '@/components/Discussion/DiscussionCard'
import DiscussionListMixin from '@/mixins/DiscussionListMixin'
import Loading from '@/components/Loading'

export default {
  name: 'DiscussionList',
  extends: DiscussionListMixin,
  data () {
    return {
      option: {
        className: 'os-theme-dark',
        sizeAutoCapable: true,
        paddingAbsolute: true,
        scrollbars: {
          clickScrolling: true
        }
      },
      instance: this
    }
  },
  props: {
    activate: Function
  },
  components: {
    DiscussionCard,
    Loading
  },
  methods: {
    ChangeLoadingVisibility (e) {
      this.isLoadingVisible = e
    }
  }
}
</script>

<style scoped>

</style>
