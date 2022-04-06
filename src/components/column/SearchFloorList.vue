<template>
  <v-container>
    <transition-group name='slide-fade'>
      <v-row
        v-for='(floor, index) in floors'
        :key='`${index}`'
        justify='center'
        align='start'
      >
        <v-col :class='colClass' lg='6' md='8' cols='12'>
          <v-card :id='index'>
            <v-card-text class='pb-1 pt-2 text-body-2'>
              <p>
                {{ floor.anonyname }}
                <span style='float: right'>
                  {{ floor.timeUpdated | timeDifference }}
                </span>
              </p>
            </v-card-text>

            <v-card-text
              class='py-0 clickable'
              v-ripple
              @click='gotoHole(floor.holeId,floor.floorId)'
            >
              <!-- 正文部分 -->
              <div
                :index='index'
                class='floor-body rich-text text--primary ma-0 text-body-1'
                v-html='floor.html'
              ></div>
            </v-card-text>

            <v-card-text class='d-flex text-body-2 pb-2'>
              <span class='clickable' @click='gotoHole(floor.holeId,floor.floorId)'>#{{ floor.floorId }}</span>
              <v-spacer />
              <span class='clickable' @click='gotoHole(floor.holeId)'>From #{{ floor.holeId }}</span>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </transition-group>
  </v-container>
</template>

<script lang='ts'>
import { Component, Prop } from 'vue-property-decorator'
import hljs from 'highlight.js/lib/core'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { openDivisionAndGotoHole } from '@/utils/floor'
import { Floor } from '@/models/floor'
import { searchFloors } from '@/apis/api'

@Component
export default class SearchFloorList extends BaseComponentOrView {
  @Prop({ required: true }) searchStr: string
  floors: Floor[] = []

  get colClass () {
    if (this.isMobile) return 'px-1 py-1'
    else return 'px-1 py-2'
  }

  async mounted () {
    await searchFloors(this.searchStr, 20, 0)
  }

  updated () {
    hljs.highlightAll()
  }

  gotoHole (holeId: number, floorId?: number) {
    openDivisionAndGotoHole(holeId, floorId)
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
