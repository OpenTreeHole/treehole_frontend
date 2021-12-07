<template>
  <v-sheet>
    <v-container class='pa-0 double-column-panel'>
      <v-row class='ma-0' justify='center'>

        <v-col class='col-first'
               :class='firstColClass'
               @transitionend='onActivationEnd'
        >
          <overlay-scrollbars ref='osColFirst' :options='osOptions' style='display: block; height: 100%; width: 100%;'>
            <div style='padding: 12px 20px'>
              <slot name='first' />
            </div>
          </overlay-scrollbars>
        </v-col>

        <v-col class='col-second' cols='6'>
          <overlay-scrollbars ref='osColSecond' :options='osOptions' style='display: block; height: 100%; width: 100%;'>
            <div style='padding: 12px 20px'>
              <slot name='second' />
            </div>
          </overlay-scrollbars>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script lang='ts'>
import { Component, Emit, Ref, Watch } from 'vue-property-decorator'
import Vue from 'vue'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import { EventBus } from '@/event-bus'

@Component
export default class DoubleColumnPanel extends Vue {
  public firstColActiveClass = 'col-first--active'
  public firstColInactiveClass = 'col-first--inactive'

  public isActive = false
  public isEnd = true

  public viewport = 0

  public osOptions = {
    className: 'os-theme-dark',
    resize: 'none',
    sizeAutoCapable: true,
    clipAlways: true,
    normalizeRTL: true,
    paddingAbsolute: false,
    autoUpdate: null,
    autoUpdateInterval: 33,
    updateOnLoad: ['img'],
    nativeScrollbarsOverlaid: {
      showNativeScrollbars: false,
      initialize: true
    },
    overflowBehavior: {
      x: 'v-h',
      y: 'scroll'
    },
    scrollbars: {
      visibility: 'auto',
      autoHide: 'leave',
      autoHideDelay: 400,
      dragScrolling: true,
      clickScrolling: false,
      touchSupport: true,
      snapHandle: false
    },
    textarea: {
      dynWidth: false,
      dynHeight: false,
      inheritedAttrs: ['style', 'class']
    },
    callbacks: {
      onInitialized: null,
      onInitializationWithdrawn: null,
      onDestroyed: null,
      onScrollStart: null,
      onScroll: null,
      onScrollStop: null,
      onOverflowChanged: null,
      onOverflowAmountChanged: null,
      onDirectionChanged: null,
      onContentSizeChanged: null,
      onHostSizeChanged: null,
      onUpdated: null
    }
  }

  @Ref() osColFirst: OverlayScrollbarsComponent
  @Ref() osColSecond: OverlayScrollbarsComponent

  get firstColClass () {
    return this.isActive ? this.firstColActiveClass : this.firstColInactiveClass
  }

  get showSecondCol () {
    return this.isActive && this.isEnd
  }

  public changeActiveStatus (): void {
    this.isEnd = false
    this.isActive = !this.isActive
  }

  public deactivate (): void {
    if (this.isActive) this.changeActiveStatus()
  }

  public activate (): void {
    if (!this.isActive) this.changeActiveStatus()
  }

  public onActivationEnd (e: TransitionEvent): void {
    if (e.propertyName === 'transform') {
      this.isEnd = true
      if (this.isActive) {
        document.body.scrollTop = document.documentElement.scrollTop = 0
      }
    }
  }

  public scrollToEl (toIndex: number) {
    const el = document.getElementById(toIndex.toString())
    if (!el) {
      console.error(`Not Found Element with Id: ${toIndex}!`)
      return
    }
    const instance = this.osColSecond.osInstance()
    if (!instance) {
      console.error('OverlayScrollbar has no instance!')
      return
    }
    instance.scroll(el, 1300)
  }

  mounted () {
    this.viewport = window.innerHeight
    window.addEventListener('resize', () => {
      this.viewport = window.innerHeight
    })

    EventBus.$on('scroll-to', this.scrollToEl)
  }

  destroyed () {
    EventBus.$off('scroll-to', this.scrollToEl)
  }

  @Watch('showSecondCol')
  @Emit()
  async showSecondColChanged (_val: boolean) {
  }
}
</script>

<style scoped>
.double-column-panel {
  overflow: hidden
}

.col-first {
  position: relative;
  height: 92vh;
}

.col-second {
  position: relative;
  height: 92vh;
}

.col-first--inactive {
  transition: transform 0.5s, flex 0.5s, max-width 0.5s;
  transform: translateX(22vw);
  flex: 40vw;
  max-width: 40vw;
}

.col-first--active {
  transition: transform 0.5s, flex 0.5s, max-width 0.5s;
  transform: translateX(0);
  flex: 32vw;
  max-width: 32vw;
}
</style>
