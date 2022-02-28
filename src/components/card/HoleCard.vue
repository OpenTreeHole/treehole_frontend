<template>
  <v-card :id='`#${hole.holeId}`' :class='{"hole-card--active": isActive}' class='rounded' elevation='1'>
    <!-- 标签栏 -->
    <v-card-text class='d-flex pb-0 pt-2 pl-3 pr-3 font-weight-medium'>
      <span class='flex-left'>
        <label-chip
          v-if='hole.firstFloor.specialTag'
          :label='hole.firstFloor.specialTag'
        ></label-chip>
        <tag-chip
          v-for='(tag, tindex) in hole.tags'
          :key='tindex'
          :tag='tag'
          @click='addTag($route.path, tag)'
        >
        </tag-chip>
      </span>
      <span class='flex-right' v-if='isAdmin'>
        <v-icon v-if='pinned' color='blue' v-ripple @click='unpin'>mdi-pin</v-icon>
        <v-icon v-else color='blue' v-ripple @click='pin'>mdi-pin-outline</v-icon>
      </span>
      <span class='flex-right' v-else-if='pinned'>
        <v-icon color='blue'>mdi-pin</v-icon>
      </span>
    </v-card-text>
    <v-card-text class='folded-hint' v-if='hole.isFolded' color='grey'>
      该内容已折叠：
      <span class='clickable' @click='hole.styleData.displayIt = !hole.styleData.displayIt'>
        {{ hole.styleData.displayIt ? '收起' : '展开' }}
      </span>
    </v-card-text>
    <div class='post-content' v-if='hole.styleData.displayIt'>
      <!-- 内容主体 -->
      <v-card-text
        @click='openHole(hole)'
        class='text--primary py-2 text-body-1 clickable'
        v-ripple
      >
        <fix-height-div
          v-if='hole.styleData.fold'
          :id="'p' + index"
          class='fold'
          :fix='fixHeight'
        >
          <p>{{ hole.firstFloor.content | plainText }}</p>
        </fix-height-div>
        <fix-height-div
          v-else
          :id="'p' + index"
          class='unfold'
          :fix='fixHeight'
        >
          <div class='rich-text' v-html='hole.firstFloor.html' />
        </fix-height-div>
      </v-card-text>

      <!-- 展开折叠按钮 -->
      <div v-if='hole.styleData.lines > 3 && isMobile'>
        <div v-if='hole.styleData.fold'>
          <v-btn
            text
            block
            depressed
            x-small
            color='grey lighten-1'
            @click='unfold()'
          >
            <v-icon>mdi-chevron-double-down</v-icon>
          </v-btn>
        </div>

        <div v-else>
          <v-btn
            text
            block
            depressed
            x-small
            color='grey lighten-1'
            @click='fold()'
          >
            <v-icon>mdi-chevron-double-up</v-icon>
          </v-btn>
        </div>
      </div>
      <div v-else>
        <div style='height: 0.5rem'></div>
      </div>

      <v-card-text
        v-if='hole.firstFloor.floorId !== hole.lastFloor.floorId'
        v-ripple
        class='clickable'
        @click='openHole(hole, hole.lastFloor.floorId,true)'
      >
        <v-row class='mx-0'>
          <span
            style='
              width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            '
          >
            RE：{{ hole.lastFloor.content | plainText | wordLimit }}
          </span>
        </v-row>
      </v-card-text>

      <!-- 脚标 -->
      <v-card-actions class='pt-0 pb-0 caption'>
        <span>#{{ hole.holeId }}</span>
        <v-spacer />
        <span>{{ hole.timeUpdated | timeDifference }}</span>
        <v-spacer />
        <span>
          <v-icon small>mdi-message-processing-outline</v-icon>
          {{ hole.reply }}
        </span>
      </v-card-actions>
    </div>
  </v-card>
</template>

<!--suppress JSUnusedLocalSymbols -->
<script lang='ts'>
import { Component, Emit, Prop } from 'vue-property-decorator'
import { Hole } from '@/models/hole'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import TagChip from '@/components/chip/TagChip.vue'
import LabelChip from '@/components/chip/LabelChip.vue'
import UserStore from '@/store/modules/UserStore'
import { remove } from 'lodash-es'
import { Division } from '@/models/division'
import { camelizeKeys } from '@/utils/utils'
import FixHeightDiv from '@/components/animation/FixHeightDiv.vue'

@Component({
  components: {
    FixHeightDiv,
    LabelChip,
    TagChip
  }
})
export default class HoleCard extends BaseComponentOrView {
  @Prop({ required: true }) readonly hole: Hole
  @Prop({ required: true, type: Number }) index: number
  @Prop({ required: false, type: Boolean, default: false }) isActive: boolean
  @Prop({ type: Boolean, default: false }) fixHeight: boolean
  @Prop({ type: Boolean, default: false }) pinned: boolean

  get isAdmin () {
    return UserStore.userProfile?.isAdmin
  }

  @Emit()
  openHole (_hole: Hole, _floorId?: number, _preventClose?: boolean) {
  }

  public unfold (): void {
    this.hole.styleData.fold = false
  }

  public fold (): void {
    this.hole.styleData.fold = true
  }

  @Emit('update-pin-info')
  async unpin () {
    const division = UserStore.divisions.find(v => v.divisionId === this.hole.divisionId) as Division
    const pinnedIdList = division!.pinned.map(v => v.holeId)
    remove(pinnedIdList, v => v === this.hole.holeId)
    const response = await this.$axios.put(`/divisions/${this.hole.divisionId}`, {
      pinned: pinnedIdList
    })
    UserStore.setDivision({ divisionId: this.hole.divisionId, division: camelizeKeys(response.data) })
  }

  @Emit('update-pin-info')
  async pin () {
    const division = UserStore.divisions.find(v => v.divisionId === this.hole.divisionId) as Division
    const pinnedIdList = division!.pinned.map(v => v.holeId)
    pinnedIdList.push(this.hole.holeId)
    const response = await this.$axios.put(`/divisions/${this.hole.divisionId}`, {
      pinned: pinnedIdList
    })
    UserStore.setDivision({ divisionId: this.hole.divisionId, division: camelizeKeys(response.data) })
  }
}
</script>

<style lang='scss' scoped>
.v-card {
  transition: background-color 0.5s;
}

.theme--light.hole-card--active {
  background-color: #CFCFCF !important;
}

.theme--dark.hole-card--active {
  background-color: #707070 !important;
}
</style>
