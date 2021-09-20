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
import debounce from 'lodash.debounce'

import Loading from '@/components/Loading.vue'
import DiscussionCard from '@/components/DiscussionCard.vue'
import Discussion from '@/components/DiscussionCol'

export default {
  name: 'DiscussionList',
  components: {
    Discussion,
    DiscussionCard,
    Loading
  },
  props: {
    api: null
  },
  data () {
    return {
      // 帖子列表
      discussions: [],
      page: 1,
      // 展开折叠样式数据
      styleData: [],
      order: '',
      tag_name: null,
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
    refresh () {
      // 刷新列表
      this.discussions = []
      this.page = 1
      this.getDiscussions()
    },
    _isMobile () {
      let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
      return flag
    },
    addTag (tag) {
      if (this.$route.name === 'home') {
        this.$parent.addTag(tag)
      }
    },
    calculateLines () {
      for (let i = 0; i < this.styleData.length; i++) {
        const element = document.getElementById('p' + i)
        const totalHeight = element.scrollHeight
        this.styleData[i].lines = totalHeight / this.lineHeight
      }
    },
    getDiscussions () {
      const marked = this.$marked
      return this.$axios
        .get(this.api, {
          params: {
            page: this.page,
            order: this.order,
            tag_name: this.tag_name
          }
        })
        .then((response) => {
          for (let i = 0; i < response.data.length; i++) {
            this.styleData.push({
              fold: true,
              lines: 3
            })
          }
          response.data.forEach(function (discussionItem) {
            discussionItem.first_post.content = marked(
              discussionItem.first_post.content
            )
            discussionItem.last_post.content = marked(
              discussionItem.last_post.content
            )
          })
          this.discussions.push.apply(this.discussions, response.data)

          if (response.data.length > 0) {
            this.page++
          }
        })
        .catch((error) => {
          this.$parent.$refs.message.error(error.response.data.msg)
        })
    },
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
    toDiscussion (id) {
      setTimeout(() => {
        this.$router.push({
          path: `/discussion/${id}`
        })
      }, 50)
    },
    Activate (id) {
      if (this._isMobile()) {
        this.toDiscussion(id)
      } else {
        var elements
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
        elements = document.getElementsByClassName('discussion-card')
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].getAttribute('num') === this.displayCardId.toString()) {
            elements[i].classList.add('active')
          } else {
            elements[i].classList.remove('active')
          }
        }
      }
    },
    Fix () {
      this.isEnd = 'end'
      if (this.isActive === 'left') {
        this.pos = this.GetPageScroll()
        document.body.scrollTop = document.documentElement.scrollTop = 0
        this.showDiscussion = true
      } else {

      }
    }
  },
  watch: {
    discussions () {
      setTimeout(() => {
        const element = document.getElementById('p1')
        this.lineHeight = parseInt(
          window.getComputedStyle(element, null).getPropertyValue('line-height')
        )
        this.calculateLines()
      }, 100)
    },
    showDiscussion (val) {
      this.$parent.showFloatBtn = !val
    }
  },
  mounted () {
    window.onresize = () => {
      this.debouncedCalculateLines()
    }
  },
  created () {
    this.debouncedCalculateLines = debounce(this.calculateLines, 300)
    // this.getTags()
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
