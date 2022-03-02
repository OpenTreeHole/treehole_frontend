<template>
  <v-container class='pa-0 max-height max-width'>
    <!-- 帖子列表 -->
    <component :is='isMobile ? "HoleListMobile" : "HolePanel"' @show-floor-list-changed='onShowFloatBtnChanged'></component>

    <!-- 新帖编辑器及浮动按钮 -->
    <div :class='floatBtnClass' v-show='showFloatBtn'>
      <v-btn v-if='!this.isMobile' fab color='secondary' @mousedown.prevent @click='reload'>
        <v-icon>mdi-autorenew</v-icon>
      </v-btn>
      <br />
      <create-hole-dialog :division-id='divisionId' @refresh='reload'>
        <template #activator='{ on, attrs }'>
          <v-btn
            fab
            color='secondary'
            v-bind='attrs'
            v-on='on'
            @mousedown.prevent
          >
            <v-icon>mdi-message-plus</v-icon>
          </v-btn>
        </template>
      </create-hole-dialog>
    </div>

  </v-container>
</template>

<script lang='ts'>
import { Component, Prop, Ref } from 'vue-property-decorator'
import HolePanel from '@/components/panel/HolePanel.vue'
import HoleListMobile from '@/components/column/HoleListMobile.vue'
import BaseView from '@/mixins/BaseView.vue'
import CreateHoleDialog from '@/components/dialog/CreateHoleDialog.vue'
import UserStore from '@/store/modules/UserStore'

@Component({
  components: {
    CreateHoleDialog,
    HolePanel,
    HoleListMobile
  }
})
export default class DivisionPage extends BaseView {
  public showFloatBtn = true

  @Prop({ required: true, type: Number }) divisionId: number
  @Ref() readonly holeComp!: HolePanel | HoleListMobile

  get floatBtnClass () {
    return this.isMobile ? 'float-btn' : 'float-btn-mobile'
  }

  public reload (): void {
    this.clearTag(this.$route.name!)
    this.holeComp.refresh()
  }

  public onPreloaded () {
    if (!UserStore.divisions.find(v => v.divisionId === this.divisionId)) {
      this.$router.push('/division/1')
    }
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
