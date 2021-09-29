<template>
  <v-container>
    <v-row justify='center' class='ma-0'>
      <v-col class='mb-5 transrow' :class='isActive+" "+isEnd' id='transrow'
             :style="{marginTop: '-'+pos.Y.toString()+'px'}" @animationend='Fix'>
        <v-row
          v-for='(discussion, index) in discussions'
          :key='index'
        >
          <v-col>
            <DiscussionCard
              :discussion='discussion'
              :index='index'
              :activate='Activate'
            />
          </v-col>
        </v-row>
      </v-col>
      <v-col v-if='displayCardId!==-1 && showDiscussion' class='mb-5' cols='5' />
      <Discussion
        v-if='displayCardId!==-1 && showDiscussion'
        :key='displayCardId'
        :discussionId='displayCardId'
      />
    </v-row>
    <!-- 载入中信息 -->
    <loading v-if='!showDiscussion' :length='discussions.length' :loadList='getDiscussions' />
  </v-container>
</template>

<script>
import Loading from '@/components/Loading.vue'
import DiscussionCard from '@/components/DiscussionCard.vue'
import Discussion from '@/components/DiscussionCol'
import DiscussionListMixin from '@/mixins/DiscussionListMixin'

export default {
  name: 'DiscussionList',
  extends: DiscussionListMixin,
  components: {
    Discussion,
    DiscussionCard,
    Loading
  },
  data () {
    return {
      isActive: 'right',
      isEnd: '',
      showDiscussion: false,
      displayCardId: -1,
      pos: {
        X: 0,
        Y: 0
      }
    }
  },
  methods: {
    GetPageScroll () {
      var x, y
      if (window.pageYOffset) {
        // all except IE
        y = window.pageYOffset
        x = window.pageXOffset
      } else if (document.documentElement &&
        document.documentElement.scrollTop) {
        // IE 6 Strict
        y = document.documentElement.scrollTop
        x = document.documentElement.scrollLeft
      } else if (document.body) {
        // all other IE
        y = document.body.scrollTop
        x = document.body.scrollLeft
      }
      return {
        X: x,
        Y: y
      }
    },
    Activate (id) {
      if (this.isActive === 'right') {
        this.isActive = 'left'
        this.isEnd = ''
      }
      if (this.displayCardId !== id) {
        this.displayCardId = id
      } else {
        this.displayCardId = -1
        this.showDiscussion = false
        this.isActive = 'right'
        this.isEnd = ''
        document.body.scrollTop = document.documentElement.scrollTop = this.pos.Y
        this.pos.Y = 0
      }
      const elements = document.getElementsByClassName('discussion-card')
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].getAttribute('num') === this.displayCardId.toString()) {
          elements[i].classList.add('active')
        } else {
          elements[i].classList.remove('active')
        }
      }
    },
    Fix () {
      this.isEnd = 'end'
      if (this.isActive === 'left') {
        this.pos = this.GetPageScroll()
        document.body.scrollTop = document.documentElement.scrollTop = 0
        this.showDiscussion = true
      }
    }
  },
  watch: {
    showDiscussion (val) {
      this.$parent.showFloatBtn = !val
    }
  }
}
</script>

<style>
.transrow.right {
  animation: move-right 0.5s ease;
}

.transrow.right.end {
  transform: translateX(0);
  flex: 40vw;
  max-width: 40vw;
}

.transrow.left {
  animation: move-left 0.5s ease;
}

.transrow.left.end {
  position: fixed;
  transform: translateX(-18vw);
  flex: 28vw;
  max-width: 28vw;
}

.discussion-card {
  transition: 1s;
}

.discussion-card.active {
  background-color: #DFDFDF !important;
}

@keyframes move-left {
  0% {
    transform: translateX(0);
    flex: 40vw;
    max-width: 40vw;
  }
  100% {
    transform: translateX(-18vw);
    flex: 28vw;
    max-width: 28vw;
  }
}

@keyframes move-right {
  0% {
    transform: translateX(-18vw);
    flex: 28vw;
    max-width: 28vw;
  }
  100% {
    transform: translateX(0);
    flex: 40vw;
    max-width: 40vw;
  }
}
</style>
