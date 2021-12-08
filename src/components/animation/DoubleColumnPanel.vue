<template>
  <v-sheet style='height: 100%'>
    <v-container class='pa-0 double-column-panel'>
      <v-row class='ma-0 max-height' justify='center'>

        <v-col class='col-first'
               :class='firstColClass'
               @transitionend='onActivationEnd'
        >
          <div id='divColFirst' style='display: block; height: 100%; width: 100%;'>
            <div style='padding: 12px 20px'>
              <slot name='first' />
            </div>
          </div>
        </v-col>

        <v-col class='col-second' cols='6'>
          <div id='divColSecond' style='display: block; height: 100%; width: 100%;'>
            <div style='padding: 12px 20px'>
              <slot name='second' />
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script lang='ts'>
import { Component, Emit, Watch } from 'vue-property-decorator'
import Vue from 'vue'
import { EventBus } from '@/event-bus'
import OverlayScrollbars, { Options } from 'overlayscrollbars'
@Component
export default class DoubleColumnPanel extends Vue {
  public firstColActiveClass = 'col-first--active'
  public firstColInactiveClass = 'col-first--inactive'

  public isActive = false
  public isEnd = true

  public viewport = 0

  public osOptions: Options = {
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

  public osColFirst: OverlayScrollbars
  public osColSecond: OverlayScrollbars

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

  public scrollToHole (holeId: number) {
    const el = document.getElementById(`#${holeId}`)
    if (!el) {
      console.error(`Not Found Element with Id: #${holeId}!`)
      return
    }
    if (!this.osColFirst) {
      console.error('OverlayScrollbar has no instance!')
      return
    }
    this.osColFirst.scroll(el, 1000)
  }

  public scrollToFloor (toIndex: number) {
    const el = document.getElementById(toIndex.toString())
    if (!el) {
      console.error(`Not Found Element with Id: ${toIndex}!`)
      return
    }
    if (!this.osColSecond) {
      console.error('OverlayScrollbar has no instance!')
      return
    }
    this.osColSecond.scroll(el, 1300)
  }

  mounted () {
    this.viewport = window.innerHeight
    window.addEventListener('resize', () => {
      this.viewport = window.innerHeight
    })

    const divColFirst = document.getElementById('divColFirst') as HTMLElement
    const divColSecond = document.getElementById('divColSecond') as HTMLElement

    this.osColFirst = OverlayScrollbars(divColFirst, this.osOptions)
    this.osColSecond = OverlayScrollbars(divColSecond, this.osOptions)
    EventBus.$on('scroll-to-floor', this.scrollToFloor)
    EventBus.$on('scroll-to-hole', this.scrollToHole)
  }

  destroyed () {
    EventBus.$off('scroll-to-floor', this.scrollToFloor)
    EventBus.$off('scroll-to-hole', this.scrollToHole)
  }

  @Watch('showSecondCol')
  @Emit()
  async showSecondColChanged (_val: boolean) {
  }
}
</script>

<style scoped>
@import "../../style/fix-height.scss";

.double-column-panel {
  overflow: hidden;
  height: 100%
}

.col-first {
  position: relative;
  height: 100%;
  z-index: 2;
}

.col-second {
  position: relative;
  height: 100%;
  z-index: 1;
}

.col-first--inactive {
  transition: transform 0.5s, flex 0.5s, max-width 0.5s;
  transform: translateX(50%);
  flex: 50%;
  max-width: 50%;
}

.col-first--active {
  transition: transform 0.5s, flex 0.5s, max-width 0.5s;
  transform: translateX(0);
  flex: 37%;
  max-width: 37%;
}
</style>
