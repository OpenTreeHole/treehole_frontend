<template>
  <v-container>
    <v-row justify='center'>
      <v-col cols='12' md='8' lg='6'>
        <v-container>
          <transition-group name='slide-fade'>
            <v-row
              v-for='(floor, index) in floors'
              :key='`${index}`'
              justify='center'
              align='start'
              v-viewer
            >
              <v-col>
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
                      class='floor-body markdown-body rich-text text--primary ma-0 text-body-1'
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

          <!-- 载入中信息 -->
          <loading :request='[]' ref='loading' :pause-loading='initiating' />
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
import Loading from '@/components/Loading.vue'
import Editor from '@/components/Editor.vue'
import { Component, Prop } from 'vue-property-decorator'
import { MarkedFloor } from '@/api/hole'
import Mention from '@/components/hole/Mention.vue'
import hljs from 'highlight.js/lib/core'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { SearchFloorListRequest } from '@/api'
import { gotoHole } from '@/utils/floor'

@Component({
  components: {
    Mention,
    Loading,
    Editor
  }
})
export default class SearchFloorList extends BaseComponentOrView {
  @Prop({ required: true }) private searchStr: string
  public floors: Array<MarkedFloor> = []

  public request: SearchFloorListRequest

  public initiating = true

  mounted () {
    this.request = new SearchFloorListRequest(this.searchStr)
    this.floors = this.request.datas
    this.request.request().then(() => {
      this.initiating = false
    }).catch((error) => {
      if (error.response === undefined) this.messageError(JSON.stringify(error))
      else this.messageError(error.response.data.msg)
    })
  }

  updated () {
    hljs.highlightAll()
  }

  gotoHole (holeId: number, floorId?: number) {
    this.$router.push('/division/1').then(() => {
      gotoHole(holeId, floorId)
    })
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
