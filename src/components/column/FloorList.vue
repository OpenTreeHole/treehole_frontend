<template>
  <v-container class='pa-0'>
    <v-card
      v-if='this.$route.name === "hole" && hole'
      class='mx-1 mb-2'
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

      <v-card-text class='pt-2 pb-2 text-center d-flex text-body-2'>
        <span class='flex-left'>#{{ hole.holeId }}</span>
        <span class='flex-center'>
          {{ hole.timeUpdated | timeDifference }}
        </span>
        <span class='flex-right'>
          <v-icon small>mdi-message-processing-outline</v-icon>
          {{ hole.reply }}
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

    <float-btn-group :float-btns='floatBtns' />

    <create-floor-dialog v-model='floorDialog' operation='add' :hole-id='holeId' @continue-load='continueLoad' />
    <modify-tag-dialog v-model='tagDialog' :hole='hole' @submit='v=>{$emit("modify-hole",v)}'/>

    <the-loader v-if='hole' ref='loading' :request='[getFloors]' />
  </v-container>
</template>

<script lang='ts'>
import TheLoader from '@/components/TheLoader.vue'
import AppEditor from '@/components/app/AppEditor.vue'
import { Component, Prop, Ref } from 'vue-property-decorator'
import { Hole } from '@/models/hole'
import hljs from 'highlight.js'
import FloorCard from '@/components/card/FloorCard.vue'
import { Floor } from '@/models/floor'
import { scrollToFloor } from '@/utils/floor'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import CreateFloorDialog from '@/components/dialog/CreateFloorDialog.vue'
import { addFavorites, deleteFavorites, getHole, listFloors, modifyDivision } from '@/apis/api'
import UserStore from '@/store/modules/UserStore'
import FloatBtnGroup from '@/components/FloatBtnGroup.vue'
import { max } from '@/utils/utils'
import ModifyTagDialog from '@/components/dialog/ModifyTagDialog.vue'

@Component({
  components: {
    ModifyTagDialog,
    FloatBtnGroup,
    CreateFloorDialog,
    TheLoader,
    AppEditor,
    FloorCard
  }
})
export default class FloorList extends BaseComponentOrView {
  hole: Hole | null = null
  floorDialog = false
  tagDialog = false
  // content: '',
  requiredRules = [(v: any) => !!v || '内容不能为空']
  valid = true
  loadedLength = 0

  @Prop({ default: null }) displayFloorId: number | null
  @Prop({ required: true }) wrappedHoleOrId: Hole | number

  @Ref() readonly form!: HTMLFormElement
  @Ref() readonly editor!: AppEditor
  @Ref() readonly loading!: TheLoader
  @Ref() readonly floorCards!: FloorCard[]

  get adminFloatBtns () {
    return [
      {
        icon: 'mdi-tag',
        callback: this.showTagDialog
      },
      {
        name: 'pin',
        icon: this.isPinned ? 'mdi-pin' : 'mdi-pin-outline',
        style: this.isPinned ? 'color: #0096C7' : 'color: #FFFFFF',
        callback: this.changePinnedStatus
      }
    ]
  }

  get userFloatBtns () {
    return [
      {
        icon: 'mdi-send',
        callback: this.showFloorDialog
      },
      {
        name: 'star',
        icon: 'mdi-star',
        style: this.isStarred ? 'color: #FF9300' : 'color: #FFFFFF',
        callback: this.changeCollectionStatus
      }
    ]
  }

  get floatBtns () {
    return [...(UserStore.user?.isAdmin ? this.adminFloatBtns : []), ...this.userFloatBtns]
  }

  get isStarred () {
    return !!UserStore.collection.find(v => v.holeId === this.holeId)
  }

  set isStarred (newVal: boolean) {
    if (!this.hole) throw new ReferenceError('Hole is undefined!')

    if (newVal) {
      if (!this.isStarred) UserStore.collectionAdd(this.hole)
    } else {
      UserStore.collectionRemove(this.holeId)
    }
  }

  get isPinned () {
    if (!this.hole) return false
    const division = UserStore.divisions.find(v => v.divisionId === this.hole!.divisionId)
    return !!division?.pinned.find(v => v.holeId === this.holeId)
  }

  set isPinned (newVal) {
    if (!this.hole) throw ReferenceError('Hole is undefined!')
    const division = UserStore.divisions.find(v => v.divisionId === this.hole!.divisionId)
    if (!division) throw new Error(`Division ${this.hole.divisionId} Not Found!`)

    if (newVal) {
      if (!this.isPinned) division.pinned.push(this.hole)
    } else {
      division.pinned = division.pinned.filter(v => v.holeId !== this.holeId)
    }
  }

  get floors () {
    return this.hole?.cFloors
  }

  get holeId () {
    if (this.wrappedHoleOrId instanceof Hole) {
      return this.wrappedHoleOrId.holeId
    } else {
      return this.wrappedHoleOrId
    }
  }

  get editorWidth () {
    return this.isMobile ? '98vw' : '70vw'
  }

  get colClass () {
    if (this.isMobile) return 'px-1 py-1'
    else return 'px-1 py-2'
  }

  async mounted () {
    if (this.wrappedHoleOrId instanceof Hole) {
      this.hole = this.wrappedHoleOrId
    } else {
      await this.getHole(this.wrappedHoleOrId)
    }
    await this.$nextTick()
    await this.getAndScrollToFloor(this.displayFloorId)
    await this.loadPrefetched()
  }

  async changePinnedStatus () {
    if (!this.hole) return Promise.reject(new ReferenceError('Hole is undefined!'))

    const division = UserStore.divisions.find(v => v.divisionId === this.hole!.divisionId)
    if (!division) return Promise.reject(new Error(`Division ${this.hole.divisionId} Not Found!`))

    this.isPinned = !this.isPinned

    try {
      const isPinned = this.isPinned
      const pinnedIdList = division.pinned.map(v => v.holeId)
      const modified = await modifyDivision(this.hole.divisionId, {
        pinned: pinnedIdList
      })
      if (isPinned) this.messageSuccess('置顶成功！')
      else this.messageSuccess('取消置顶成功！')
      UserStore.setDivision({ divisionId: this.hole.divisionId, division: modified })
    } catch (e) {
      this.isPinned = !this.isPinned
      throw e
    }
  }

  showTagDialog () {
    this.tagDialog = true
  }

  showFloorDialog () {
    this.floorDialog = true
  }

  async changeCollectionStatus () {
    this.isStarred = !this.isStarred
    try {
      let message
      if (this.isStarred) message = await addFavorites(this.holeId)
      else message = await deleteFavorites(this.holeId)
      this.messageSuccess(message)
    } catch (e) {
      this.isStarred = !this.isStarred
      return Promise.reject(e)
    }
  }

  updated () {
    hljs.highlightAll()
  }

  continueLoad () {
    this.loading.continueLoad()
  }

  /**
   * Clear the floor list and reload.
   */
  refresh (): void {
    if (!this.hole) throw new ReferenceError('Hole is undefined!')

    this.hole.cFloors = []
    this.continueLoad()
  }

  /**
   * Get the hole object by hole id from the backend.
   * <p> the hole object contains only brief information of the prefetched floors.
   *
   * @param holeId - the hole id
   */
  async getHole (holeId: number) {
    this.hole = await getHole(holeId)
  }

  /**
   * Get floors from backend.
   */
  async getFloors (): Promise<boolean> {
    if (!this.floors) return Promise.reject(new ReferenceError('Hole is undefined!'))
    const loadedLength = this.loadedLength
    const currentLoadedFloors = await listFloors(this.holeId, 10, this.loadedLength)

    this.floors.splice(loadedLength, currentLoadedFloors.length, ...currentLoadedFloors)
    this.loadedLength = max(currentLoadedFloors.length + loadedLength, this.loadedLength)

    return currentLoadedFloors.length > 0
  }

  updateFloor (index: number) {
    if (!this.floors) throw new ReferenceError('Hole is undefined!')
    this.checkAndRerenderFloors(this.floors[index])
  }

  checkAndRerenderFloors (mentionFloor: Floor) {
    for (const floorCard of this.floorCards) {
      floorCard.rerenderSpecificMention(mentionFloor)
    }
  }

  async getFloorsUntil (waitingFloorId: number): Promise<Floor | null> {
    if (!this.floors) return Promise.reject(new ReferenceError('Hole is undefined!'))
    while (this.loading.hasNext) {
      await this.loading.load()
      const result = this.floors.find(v => v.floorId === waitingFloorId)
      if (result) return result
    }
    return null
  }

  async getAndScrollToFloor (floorId: number | null) {
    if (!floorId) return
    const floor = await this.getFloorsUntil(floorId)
    if (floor) scrollToFloor(floor.storey)
    else return Promise.reject(new Error(`Cannot scroll to floor with id: ${floorId}!`))
  }

  async loadPrefetched () {
    if (!this.floors) return Promise.reject(new ReferenceError('Hole is undefined!'))
    while (this.loadedLength < this.floors.length && this.loading.hasNext) {
      await this.loading.load()
    }
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

.clickable {
  cursor: pointer;
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
