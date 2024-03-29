<template>
  <v-sheet style="height: 100%">
    <v-container class="pa-0 double-column-panel">
      <v-row
        class="ma-0 max-height"
        justify="center"
      >
        <v-col class="col-first">
          <div
            id="divColFirst"
            style="display: block; height: 100%; width: 100%"
          >
            <div style="padding: 0 20px">
              <slot name="first" />
            </div>
          </div>
        </v-col>

        <v-col
          class="col-second"
          cols="6"
        >
          <div
            id="divColSecond"
            style="display: block; height: 100%; width: 100%"
          >
            <div style="padding: 0 20px">
              <slot name="second" />
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <slot />
  </v-sheet>
</template>

<script lang="ts">
import { Component, Emit, Watch } from 'vue-property-decorator'
import Vue from 'vue'
import { EventBus } from '@/event-bus'
import OverlayScrollbars, { Options } from 'overlayscrollbars'
import { gsap } from '@/plugins/gsap'
import { Power3 } from 'gsap/gsap-core'

@Component
export default class DoubleColumnPanel extends Vue {
  viewport = 0

  osOptions: Options = {
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

  osColFirst: OverlayScrollbars
  osColSecond: OverlayScrollbars

  showSecondCol = false

  deactivate(): void {
    gsap.to('.col-first', {
      x: '50%',
      flex: '50%',
      maxWidth: '50%',
      duration: 0.5,
      ease: Power3.easeOut,
      onStart: () => {
        this.showSecondCol = false
      }
    })
  }

  activate(): void {
    gsap.to('.col-first', {
      x: 0,
      flex: '37%',
      maxWidth: '37%',
      duration: 0.5,
      ease: Power3.easeOut,
      onComplete: () => {
        this.showSecondCol = true
        document.body.scrollTop = document.documentElement.scrollTop = 0
      }
    })
  }

  scrollToHole(holeId: number) {
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

  scrollToFloor(toIndex: number) {
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

  async mounted() {
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

  destroyed() {
    EventBus.$off('scroll-to-floor', this.scrollToFloor)
    EventBus.$off('scroll-to-hole', this.scrollToHole)
  }

  @Watch('showSecondCol')
  @Emit()
  async showSecondColChanged(_val: boolean) {}
}
</script>

<style scoped>
.double-column-panel {
  overflow: hidden;
  height: 100%;
}

.col-first {
  position: relative;
  height: 100%;
  flex: 50%;
  max-width: 50%;
  transform: translateX(50%);
  z-index: 2;
}

.col-second {
  position: relative;
  height: 100%;
}
</style>
