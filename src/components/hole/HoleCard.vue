<template>
  <v-card :id='`#${hole.holeId}`' class='rounded' :class='isActive ? "hole-card--active" : "hole-card"'>
    <!-- 标签栏 -->
    <v-card-text class='d-flex pb-0 pt-2 pl-3 pr-3 font-weight-medium'>
      <span class='flex-left'>
        <tag-chip
          v-for='(tag, tindex) in hole.tags'
          :key='tindex'
          :tag='tag'
        >
        </tag-chip>
      </span>
      <span class='flex-right' v-if='pinned'>
        <v-icon>mdi-pin</v-icon>
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
        @click='activate(hole)'
        class='text--primary py-2 text-body-1 clickable'
        v-ripple
      >
        <div
          v-if='hole.styleData.fold'
          :id="'p' + index"
          class='fold'
          :style='fixHeight ? `max-height: ${fixedHeight};` : ""'
        >
          {{ hole.firstFloor.content | plainText }}
        </div>
        <div
          v-else
          :id="'p' + index"
          class='unfold'
          :style='fixHeight ? `max-height: ${fixedHeight};` : ""'>
          <div class='rich-text' v-html='hole.firstFloor.html' />
        </div>
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
        @click='activate(hole, hole.lastFloor.floorId,true)'
      >
        <v-row class='mx-0'>
          <span
            style='
              width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              color: rgba(19,13,10,0.83)
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
import { Component, Prop, Watch } from 'vue-property-decorator'
import { WrappedHole } from '@/models/hole'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import TagChip from '@/components/hole/TagChip.vue'

@Component({
  components: {
    TagChip
  }
})
export default class HoleCard extends BaseComponentOrView {
  @Prop({ required: true }) readonly hole: WrappedHole
  @Prop({ required: true, type: Number }) index: number
  @Prop({ required: true, type: Function }) activate: Function
  @Prop({ required: false, type: Boolean, default: false }) isActive: boolean
  @Prop({ type: Boolean, default: false }) fixHeight: boolean
  @Prop({ type: Boolean, default: false }) pinned: boolean

  public fixedHeight: string = '4.5rem'

  calculateFixHeight () {
    const element = document.getElementById('p' + this.index)
    if (element) {
      this.fixedHeight = window.getComputedStyle(element).height
    }
  }

  @Watch('fixHeight')
  onFixHeightChanged () {
    this.calculateFixHeight()
  }

  mounted () {
    this.calculateFixHeight()
  }

  public unfold (): void {
    this.hole.styleData.fold = false
  }

  public fold (): void {
    this.hole.styleData.fold = true
  }
}
</script>

<style lang='scss' scoped>
.hole-card {
  transition: 1s;
}

.hole-card--active {
  transition: 1s;
  background-color: #DFDFDF !important;
}
</style>
