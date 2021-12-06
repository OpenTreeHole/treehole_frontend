<template>
  <v-sheet>
    <v-container class='double-column-panel'>
      <v-row class='ma-0' justify='center'>
        <v-col class='col-first'
               :class='firstColClass'
               :style="{marginTop: '-'+cposY.toString()+'px'}"
               @transitionend='onActivationEnd'
               @wheel='scrollFirstColWhenActive'>
          <slot name='first' />
        </v-col>
        <v-col v-if='showSecondCol' cols='5' />

        <v-col cols='6'>
          <slot name='second' />
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script lang='ts'>
import { Component, Emit, Watch } from 'vue-property-decorator'
import Vue from 'vue'
import { gsap } from 'gsap'

@Component
export default class DoubleColumnPanel extends Vue {
  public firstColActiveClass = 'col-first--active'
  public firstColInactiveClass = 'col-first--inactive'

  public isActive = false
  public isEnd = true

  public posY = 0
  public cposY = 0

  public viewport = 0

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

  public resetScrollTop () {
    this.cposY = this.posY = 0
  }

  public scrollFirstCol (e: WheelEvent): void {
    const ratio = 0.7
    this.posY = (this.posY > -e.deltaY * ratio ? this.posY + e.deltaY * ratio : 0)
    const els = document.getElementsByClassName('.col-first')
    if (!els || els.length === 0) return
    const firstCol = els[0] as HTMLElement
    const height = parseInt(window.getComputedStyle(firstCol).height)

    if (this.posY + this.viewport > height + 200) {
      this.posY = height - this.viewport + 200
    }
  }

  public wheelListener (e: WheelEvent) {
    if (!this.isActive && this.isEnd) {
      this.scrollFirstCol(e)
    }
  }

  public scrollFirstColWhenActive (e: any): void {
    if (this.isActive || !this.isEnd) {
      e.preventDefault()
      this.scrollFirstCol(e)
    }
  }

  mounted () {
    const mainElement = document.getElementsByClassName('v-main__wrap').item(0)
    if (mainElement instanceof HTMLElement) mainElement.addEventListener('wheel', this.wheelListener)
    this.viewport = window.innerHeight
    window.addEventListener('resize', () => {
      this.viewport = window.innerHeight
    })
  }

  destroyed () {
    const mainElement = document.getElementsByClassName('v-main__wrap').item(0)
    if (mainElement instanceof HTMLElement) mainElement.removeEventListener('wheel', this.wheelListener)
  }

  @Watch('showSecondCol')
  @Emit()
  showSecondColChanged (_val: boolean) {
  }

  @Watch('posY')
  posYChanged (newVal: number) {
    gsap.to(this.$data, {
      duration: 0.2,
      cposY: newVal
    })
  }
}
</script>

<style scoped>
.double-column-panel {
  overflow: visible
}

.col-first {
  position: fixed;
}

.col-first--inactive {
  transition: transform 0.5s, flex 0.5s, max-width 0.5s;
  transform: translateX(0);
  flex: 40vw;
  max-width: 40vw;
}

.col-first--active {
  transition: transform 0.5s, flex 0.5s, max-width 0.5s;
  transform: translateX(-18vw);
  flex: 28vw;
  max-width: 28vw;
}
</style>
