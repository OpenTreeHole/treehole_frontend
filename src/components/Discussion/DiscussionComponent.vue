<template>
  <v-container style='overflow: visible' v-click-outside='DeActivateWhenClickEmptyArea'>
    <v-row justify='center' class='ma-0'>
      <v-col class='mb-5 transrow'
             :class='isActive+" "+isEnd+" "+isStatic'
             id='transrow'
             :style="{marginTop: '-'+posY.toString()+'px'}"
             @animationend='Fix'
             @wheel='ScrollDiscussionListWhenActive'
      >
        <DiscussionList
          :activate='Activate'
          :api='api'
          ref='discussionList'
          @add-tag='addTag'
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

<script lang='ts'>
import DiscussionList from '@/components/Discussion/DiscussionList.vue'
import Discussion from '@/components/Discussion/DiscussionCol.vue'

import { gsap } from 'gsap'
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator'

@Component({
  components: {
    Discussion,
    DiscussionList
  }
})
export default class DiscussionComponent extends Vue {
  @Prop({ required: true, type: String }) api: string
  public isActive = 'right'
  public isEnd = 'end'
  public isStatic = ''
  public showDiscussion = false
  public displayCardId = -1
  public posY = 0
  public marginTopY = 0
  public viewport = 0
  public isLoadingVisible = false

  $refs: {
    discussionList: DiscussionList
  }

  get tagName (): any {
    return this.$refs.discussionList.tagName
  }

  set tagName (val) {
    this.$refs.discussionList.tagName = val
  }

  public refresh (): void {
    this.$refs.discussionList.refresh()
  }

  @Emit()
  public addTag (tag: { color: string, count: number, name: string }) {
  }

  public Activate (id: number): void {
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
      } else {
        elements[i].classList.remove('active')
      }
    }
  }

  public Fix (): void {
    this.isEnd = 'end'
    if (this.isActive === 'left') {
      document.body.scrollTop = document.documentElement.scrollTop = 0
      this.showDiscussion = true
    }
  }

  public ScrollDiscussionList (e: WheelEvent): void {
    const ratio = 0.7
    this.marginTopY = (this.marginTopY > -e.deltaY * ratio ? this.marginTopY + e.deltaY * ratio : 0)

    const height = this.$refs.discussionList.height()

    // console.log('1: ' + this.marginTopY + ';2: ' + this.viewport + ';3: ' + height)
    if (this.marginTopY + this.viewport > height + 300) {
      this.marginTopY = height - this.viewport + 300
    }
  }

  public ScrollDiscussionListWhenActive (e: WheelEvent): void {
    if (this.isActive === 'left' || this.isEnd !== 'end') {
      e.preventDefault()
      this.ScrollDiscussionList(e)
    }
  }

  public DeActivate (id: number): void {
    if (this.displayCardId !== -1) {
      this.Activate(id)
    }
  }

  public DeActivateWhenClickEmptyArea (): void {
    this.DeActivate(this.displayCardId)
  }

  mounted () {
    this.viewport = window.innerHeight
    window.addEventListener('wheel', (e) => {
      if (this.isActive === 'right' && this.isEnd === 'end') {
        this.ScrollDiscussionList(e)
      }
    })
    window.addEventListener('resize', () => {
      this.viewport = window.innerHeight
    })
  }

  @Watch('showDiscussion')
  @Emit()
  showDiscussionChanged (val: boolean) {
  }

  @Watch('marginTopY')
  marginTopYChanged (newVal: number) {
    gsap.to(this.$data, {
      duration: 0.2,
      posY: newVal
    })
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
