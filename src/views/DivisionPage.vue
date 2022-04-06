<template>
  <v-container class='pa-0 max-height max-width'>
    <HoleListMobile v-if='isMobile' ref='holeComp'></HoleListMobile>
    <HolePanel v-else ref='holeComp'></HolePanel>

    <create-hole-dialog v-model='showDialog' :division-id='divisionId' @refresh='reload' />

  </v-container>
</template>

<script lang='ts'>
import { Component, Prop, Provide, Ref } from 'vue-property-decorator'
import HolePanel from '@/components/panel/HolePanel.vue'
import HoleListMobile from '@/components/column/HoleListMobile.vue'
import BaseView from '@/mixins/BaseView.vue'
import CreateHoleDialog from '@/components/dialog/CreateHoleDialog.vue'
import UserStore from '@/store/modules/UserStore'
import HoleList from '@/components/column/HoleList.vue'
import UtilStore from '@/store/modules/UtilStore'
import FloatBtnStore from '@/store/modules/FloatBtnStore'

@Component({
  components: {
    HoleList,
    CreateHoleDialog,
    HolePanel,
    HoleListMobile
  }
})
export default class DivisionPage extends BaseView {
  showDialog = false

  @Prop({ required: true, type: Number }) divisionId: number
  @Ref() readonly holeComp!: HolePanel | HoleListMobile
  @Provide() holeListType = 'division'

  async mounted () {
    FloatBtnStore.setLayer({
      order: 1,
      floatBtns: [
        {
          icon: 'mdi-autorenew',
          callback: this.reload
        },
        {
          icon: 'mdi-message-plus',
          callback: () => {
            this.showDialog = true
          }
        }
      ]
    })
  }

  reload (): void {
    this.clearTag(this.$route.name!)
    this.holeComp.refresh()
  }

  onPreloaded () {
    const currentDivision = UserStore.divisions.find(v => v.divisionId === this.divisionId)
    if (!currentDivision) {
      this.$router.push('/division/1')
    } else {
      UtilStore.setCurrentDivision(currentDivision)
    }
  }
}
</script>
