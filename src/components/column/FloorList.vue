<!--suppress HtmlUnknownAttribute -->
<template>
  <v-container class='pa-0'>
    <v-card
      v-if='this.$route.name === "hole" && !this.initiating'
      class='mt-n2 mx-n2 mb-3'
      max-width='700px'
    >
      <v-card-text class='text--primary pb-2 pt-2 font-weight-medium'>
        <v-chip
          v-for='(tag, tindex) in hole.tags'
          :key='tindex'
          color='red'
          outlined
          class='ma-1'
          ripple
        >
          {{ tag.name }}
        </v-chip>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-text class='text--primary pt-2 pb-2 text-center'>
        <span style='float: left'>#{{ hole.holeId }}</span>
        <span style='float: inherit'>{{
            hole.timeUpdated | timeDifference
          }}</span>
        <span style='float: right'>
          {{ hole.reply }}
          <v-icon small>mdi-message-processing-outline</v-icon>
        </span>
      </v-card-text>
    </v-card>

    <transition-group name='slide-fade'>
      <v-row
        class='ma-0'
        v-for='(floor, index) in floors'
        :key='`${index}`'
        justify='center'
      >
        <v-col :class='colClass'>
          <FloorCard
            :floor='floor'
            ref='floorCards'
            :division-id='hole.divisionId'
            :index='index'
            @continue-load='continueLoad'
            @update-floor='updateFloor'
            @scroll-to-floor='getAndScrollToFloor'
          />
        </v-col>
      </v-row>
    </transition-group>

    <!-- 弹出式表单及浮动按钮 -->
    <div class='float-btn' v-if='!initiating'>
      <create-floor-dialog operation='add' :hole-id='holeId' @continue-load='continueLoad'>
        <!-- 浮动按钮 -->
        <template v-slot:activator='{ on, attrs }'>
          <v-btn fab color='secondary' @mousedown.prevent v-bind='attrs' v-on='on'>
            <v-icon>mdi-send</v-icon>
          </v-btn>
        </template>
      </create-floor-dialog>

      <br />

      <v-btn fab color='secondary' @mousedown.prevent @click='changeCollectionStatus'>
        <v-icon :class='hole.isStarred ? "v-icon--starred" : ""'>mdi-star</v-icon>
      </v-btn>
    </div>

    <!-- 载入中信息 -->
    <loading :request='[getFloors]' ref='loading' :pause-loading='initiating' />
  </v-container>
</template>

<script lang='ts'>
import Loading from '@/components/Loading.vue'
import AppEditor from '@/components/app/AppEditor.vue'
import { Component, Prop, Ref } from 'vue-property-decorator'
import { Hole } from '@/models/hole'
import MentionCard from '@/components/card/MentionCard.vue'
import hljs from 'highlight.js'
import FloorCard from '@/components/card/FloorCard.vue'
import { Floor } from '@/models/floor'
import { FloorListRequest } from '@/api'
import { camelizeKeys } from '@/utils/utils'
import UserStore from '@/store/modules/UserStore'
import Vue from 'vue'
import { scrollToFloor } from '@/utils/floor'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import CreateFloorDialog from '@/components/dialog/CreateFloorDialog.vue'

@Component({
  components: {
    CreateFloorDialog,
    MentionCard,
    Loading,
    AppEditor,
    FloorCard
  }
})
export default class FloorList extends BaseComponentOrView {
  // 帖子列表
  public hole: Hole
  public floors: Array<Floor> = []
  // 发帖表单
  public dialog = false
  // content: '',
  public requiredRules = [(v: any) => !!v || '内容不能为空']
  public valid = true

  public request: FloorListRequest

  @Prop({ type: Number, default: -1 }) displayFloorId: number
  @Prop({ required: true }) wrappedHoleOrId: Hole | number

  @Ref() readonly form!: HTMLFormElement
  @Ref() readonly editor!: AppEditor
  @Ref() readonly loading!: Loading
  @Ref() readonly floorCards!: FloorCard[]

  public initiating = true

  /**
   * Clear the floor list and reload.
   */
  public refresh (): void {
    this.request.clear()
    this.floors = this.request.datas
    this.loading.continueLoad()
  }

  /**
   * Get the index of a floor in the current hole by its floor id.
   *
   * @param floorId - the floor id.
   * @returns the index, or -1 if the floor doesn't exist in the current hole.
   */
  public getIndex (floorId: number): number {
    for (let i = 0; i < this.floors.length; i++) {
      if (this.floors[i].floorId === floorId) {
        return i
      }
    }
    return -1
  }

  public continueLoad () {
    this.loading.continueLoad()
  }

  /**
   * Get the hole object by hole id from the backend.
   * <p> the hole object contains only brief information of the prefetched floors.
   *
   * @param holeId - the hole id
   */
  public async getHole (holeId: number) {
    const response = await this.$axios.get('/holes/' + holeId)
    if (response.data) {
      this.hole = new Hole(camelizeKeys(response.data))
    }
  }

  public async changeCollectionStatus () {
    this.hole.isStarred = !this.hole.isStarred
    try {
      let response
      if (!this.hole.isStarred) {
        response = await this.$axios.delete('/user/favorites', {
          data: {
            hole_id: this.hole.holeId
          }
        })
      } else {
        response = await this.$axios.post('/user/favorites', {
          hole_id: this.hole.holeId
        })
      }
      this.messageSuccess(response.data.message)
      UserStore.collection.setCollection(response.data.data)
    } catch (error) {
      this.hole.isStarred = !this.hole.isStarred
    }
  }

  /**
   * Get floors from backend.
   */
  public async getFloors (): Promise<boolean> {
    if (!this.request) return false
    return await this.request.request()
  }

  public updateFloor (floor: Floor) {
    this.checkAndRerenderFloors(floor)
    Vue.set(this.floors, this.getIndex(floor.floorId), floor)
  }

  public checkAndRerenderFloors (mentionFloor: Floor) {
    for (const floorCard of this.floorCards) {
      floorCard.rerenderSpecificMention(mentionFloor)
    }
  }

  public async getFloorsUntil (waitingFloorId: number): Promise<number> {
    for (let i = 0; i < this.request.loadedLength; i++) {
      if (this.floors[i].floorId === waitingFloorId) {
        return i
      }
    }
    if (this.loading.hasNext) {
      await this.loading.load()
      return await this.getFloorsUntil(waitingFloorId)
    }
    return -1
  }

  public async getAndScrollToFloor (floorId: number) {
    if (floorId !== -1) {
      const index = await this.getFloorsUntil(floorId)
      scrollToFloor(index)
    }
  }

  public async loadPrefetched () {
    while (this.request.loadedLength < this.floors.length && this.loading.hasNext) {
      await this.loading.load()
    }
  }

  public async init (displayFloorId: number) {
    this.request = new FloorListRequest(this.hole.markedFloors, this.holeId)
    this.floors = this.request.datas
    this.initiating = false
    await this.$nextTick()
    await this.getAndScrollToFloor(displayFloorId)
    await this.loadPrefetched()
  }

  async mounted () {
    if (this.wrappedHoleOrId instanceof Hole) {
      this.hole = this.wrappedHoleOrId
    } else {
      await this.getHole(this.wrappedHoleOrId)
    }
    await this.init(this.displayFloorId)
  }

  get editorWidth () {
    return this.isMobile ? '98vw' : '70vw'
  }

  get holeId (): number {
    if (this.wrappedHoleOrId instanceof Hole) {
      return this.wrappedHoleOrId.holeId
    } else {
      return this.wrappedHoleOrId
    }
  }

  get colClass () {
    if (this.isMobile) return 'px-1 py-1'
    else return 'px-1 py-2'
  }

  updated () {
    hljs.highlightAll()
  }
}
</script>

<style lang='scss' scoped>
/* 回复模块 */
.reply {
  margin: 0 1rem 1rem;
  padding: 0.5rem 0.5rem 0 0.5rem;
}

.v-card__text.reply-text {
  margin-top: -1.2rem;
  color: #30312c;
}

/* 可点击 */
/*noinspection CssUnusedSymbol*/
.clickable {
  cursor: pointer;
}

/* 浮动按钮 固定在右下角 */
.float-btn {
  position: fixed;
  right: 8px;
  bottom: 64px;

  .v-btn {
    margin: 5px;

    .v-btn__content {
      .v-icon--starred {
        color: #FF9300;
      }
    }
  }
}

.slide-fade-enter-active {
  transition: all .3s ease;
}

.slide-fade-leave-active {
  transition: all .1s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>
