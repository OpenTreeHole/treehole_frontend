<template>
  <v-container class='pa-0 max-height max-width'>
    <!-- 帖子列表 -->
    <HolePanel v-if='!isMobile' ref='holeComp' @show-floor-list-changed='onShowFloatBtnChanged' />
    <HoleListMobile v-else ref='holeComp' />

    <!-- 新帖编辑器及浮动按钮 -->
    <div :class='floatBtnClass' v-show='showFloatBtn'>
      <v-btn v-if='!this.isMobile' fab color='secondary' @mousedown.prevent @click='reload'>
        <v-icon>mdi-autorenew</v-icon>
      </v-btn>
      <br />
      <add-hole-btn @refresh='reload'/>
    </div>

  </v-container>
</template>

<script lang='ts'>
import { Component, Ref } from 'vue-property-decorator'
import HolePanel from '@/components/hole/HolePanel.vue'
import HoleListMobile from '@/components/hole/HoleListMobile.vue'
import Editor from '@/components/Editor.vue'
import BaseView from '@/mixins/BaseView.vue'
import AddHoleBtn from '@/components/button/AddHoleBtn.vue'

@Component({
  components: {
    AddHoleBtn,
    Editor,
    HolePanel,
    HoleListMobile
  }
})
export default class Division extends BaseView {
  public showFloatBtn = true

  @Ref() readonly holeComp!: HolePanel | HoleListMobile

  get floatBtnClass () {
    return this.isMobile ? 'float-btn' : 'float-btn-mobile'
  }

  public reload (): void {
    this.clearTag(this.$route.name!)
    this.holeComp.refresh()
  }

  public mounted () {
    this.$nextTick(() => {
      this.checkDevice()
    })
    window.addEventListener('resize', () => {
      this.checkDevice()
    })
  }

  public destroyed () {
    window.removeEventListener('resize', this.checkDevice)
  }

  public onShowFloatBtnChanged (val: boolean): void {
    this.showFloatBtn = !val
  }
}
</script>

<style lang='scss'>
.float-btn {
  position: fixed;
  right: 8px;
  bottom: 64px;

  .v-btn {
    margin: 5px;
  }
}

.float-btn-mobile {
  position: fixed;
  right: 8px;
  bottom: 16px;

  .v-btn {
    margin: 5px;
  }
}
</style>
