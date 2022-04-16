<template>
  <v-container class="pa-0 max-height max-width">
    <v-toolbar
      v-if="silentTo"
      height="auto"
      class="pa-0"
      color="red"
    >
      <v-container class="pa-2"> 您的账号已被封禁，不能在本版块发帖、回帖，封禁至：{{ silentTo }}。 </v-container>
    </v-toolbar>
    <hole-list-mobile
      v-if="isMobile"
      ref="holeComp"
    ></hole-list-mobile>
    <hole-panel
      v-else
      ref="holeComp"
      @show-floor-list-changed="
        (val) => {
          showFloatBtns = !val
        }
      "
    ></hole-panel>

    <create-hole-dialog
      v-model="dialog"
      :division-id="divisionId"
      @refresh="reload"
    />

    <float-btn-group
      v-if="showFloatBtns"
      :float-btns="floatBtns"
    ></float-btn-group>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Provide, Ref } from 'vue-property-decorator'
import HolePanel from '@/components/panel/HolePanel.vue'
import HoleListMobile from '@/components/column/HoleListMobile.vue'
import BaseView from '@/mixins/BaseView.vue'
import CreateHoleDialog from '@/components/dialog/CreateHoleDialog.vue'
import HoleList from '@/components/column/HoleList.vue'
import UtilStore from '@/store/modules/UtilStore'
import UserStore from '@/store/modules/UserStore'
import FloatBtnGroup from '@/components/FloatBtnGroup.vue'

@Component({
  components: {
    FloatBtnGroup,
    HoleList,
    CreateHoleDialog,
    HolePanel,
    HoleListMobile
  }
})
export default class DivisionPage extends BaseView {
  dialog = false
  floatBtns = [
    {
      icon: 'mdi-autorenew',
      callback: this.reload
    },
    {
      icon: 'mdi-message-plus',
      callback: this.showHoleDialog
    }
  ]

  showFloatBtns = true

  @Prop({ required: true, type: Number }) divisionId: number
  @Ref() readonly holeComp!: HolePanel | HoleListMobile
  @Provide() holeListType = 'division'

  get silentTo() {
    const date = UserStore.user?.permission.silent[this.divisionId.toString()]
    if (date && date > new Date()) {
      return date.toLocaleString()
    }
    return null
  }

  showHoleDialog() {
    this.dialog = true
  }

  async mounted() {
    UtilStore.setCurrentDivisionId(this.divisionId)
  }

  reload(): void {
    this.clearTag(this.$route.name!)
    this.holeComp.refresh()
  }
}
</script>
