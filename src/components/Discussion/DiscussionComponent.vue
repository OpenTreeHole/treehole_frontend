<template>
  <v-container style='overflow: visible'>
    <v-row justify='center' class='ma-0'>
      <v-col class='mb-5 transrow'
             :class='isActive+" "+isEnd+" "+isStatic'
             id='transrow'
             :style="{marginTop: '-'+posY.toString()+'px'}"
             @animationend='Fix'
             @mousewheel='ScrollDiscussionListWhenActive'
      >
        <DiscussionList
          :discussion-component='instance'
          :activate='Activate'
          :api='api'
        />
      </v-col>
      <v-col v-if='displayCardId!==-1 && showDiscussion' class='mb-5' cols='5' />
      <Discussion
        v-if='displayCardId!==-1 && showDiscussion'
        :key='displayCardId'
        :discussionId='displayCardId'
      />
    </v-row>
  </v-container>
</template>

<script>
import DiscussionList from '@/components/Discussion/DiscussionList'
import Discussion from '@/components/Discussion/DiscussionCol'

import { gsap } from 'gsap'

export default {
  name: 'DiscussionComponent',
  props: {
    api: null
  },
  components: {
    Discussion,
    DiscussionList
  },
  data () {
    return {
      isActive: 'right',
      isEnd: 'end',
      isStatic: '',
      showDiscussion: false,
      displayCardId: -1,
      posY: 0,
      marginTopY: 0,
      viewport: 0,
      isLoadingVisible: false,
      instance: this
    }
  },
  methods: {
    GetPageScroll () {
      let x, y
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
      }
      const elements = document.getElementsByClassName('discussion-card')
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].getAttribute('num') === this.displayCardId.toString()) {
          elements[i].classList.add('active')
          console.log('e: ' + elements[i].offsetTop + '; p: ' + elements[i].offsetParent.offsetTop)
        } else {
          elements[i].classList.remove('active')
        }
      }
    },
    Fix () {
      this.isEnd = 'end'
      if (this.isActive === 'left') {
        document.body.scrollTop = document.documentElement.scrollTop = 0
        this.showDiscussion = true
      } else {
      }
    },
    ScrollDiscussionList (e) {
      // if (!this.isLoadingVisible || e.wheelDelta > 0) {
      const ratio = 0.7
      // this.pos.Y = (this.pos.Y > e.wheelDelta * ratio ? this.pos.Y - e.wheelDelta * ratio : 0)
      this.marginTopY = (this.marginTopY > e.wheelDelta * ratio ? this.marginTopY - e.wheelDelta * ratio : 0)

      const height = parseInt(window.getComputedStyle(document.getElementById('cardlist')).height)

      console.log('1: ' + this.marginTopY + ';2: ' + this.viewport + ';3: ' + height)
      if (this.marginTopY + this.viewport > height + 300) {
        this.marginTopY = height - this.viewport + 300
        //  }
      }
    },
    ScrollDiscussionListWhenActive (e) {
      if (this.isActive === 'left' || this.isEnd !== 'end') {
        e.preventDefault()
        this.ScrollDiscussionList(e)
      }
    },
    getOffsetTop (el) {
      return el.offsetParent
        ? el.offsetTop + this.getOffsetTop(el.offsetParent)
        : el.offsetTop
    },
    DeActivate (id) {
      if (this.displayCardId !== -1) {
        this.Activate(id)
      }
    },
    DeActivateWhenClickEmptyArea (e) {
      var el = e.target
      while (el !== document.body) {
        if (el.id === 'header' || el.id === 'footer') {
          return
        }
        if (el.tagName.toUpperCase() === 'DIV' && (
          el.id === 'transrow' ||
          el.id === 'discol' ||
          el.classList.contains('v-dialog__content') ||
          el.classList.contains('v-overlay')
        )) {
          return
        }
        el = el.parentNode
      }
      this.DeActivate(this.displayCardId)
    }
  },
  mounted () {
    this.viewport = window.innerHeight
    window.addEventListener('mousewheel', (e) => {
      if (this.isActive === 'right' && this.isEnd === 'end') {
        this.ScrollDiscussionList(e)
      }
    })
    window.addEventListener('resize', () => {
      this.viewport = window.innerHeight
    })
    document.body.addEventListener('click', this.DeActivateWhenClickEmptyArea)
  },
  watch: {
    showDiscussion (val) {
      this.$parent.showFloatBtn = !val
    },
    marginTopY (newVal) {
      gsap.to(this.$data, {
        duration: 0.2,
        posY: newVal
      })
    }
  }
}
</script>

<style>
.transrow {
  position: fixed;
}

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
