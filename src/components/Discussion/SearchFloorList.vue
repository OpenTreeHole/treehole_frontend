<template>
  <v-container>
    <v-card
      v-if='this.$route.name==="discussion" && !this.initiating'
      class='mx-auto mb-6'
      max-width='700px'
    >
      <v-card-text class='text--primary pb-2 pt-2 font-weight-medium'>
        <v-chip
          v-for='(tag, tindex) in hole.hole.tags'
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
        <span style='float: left'>#{{ hole.hole.holeId }}</span>
        <span style='float: inherit'>{{
            hole.hole.timeUpdated | timeDifference
          }}</span>
        <span style='float: right'>
          {{ hole.hole.reply }}
          <v-icon small>mdi-message-processing-outline</v-icon>
        </span>
      </v-card-text>
    </v-card>

    <transition-group name='slide-fade'>
      <v-row
        v-for='(floor, index) in floors'
        :key='`${index}-${floor.html}`'
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

            <v-card-text class='py-0'>
              <!-- 正文部分 -->
              <div
                :index='index'
                class='floor-body markdown-body rich-text text--primary ma-0 text-body-1'
                v-html='floor.html'
              ></div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </transition-group>

    <!-- 载入中信息 -->
    <loading :request='[]' ref='loading' :pause-loading='initiating' />
  </v-container>
</template>

<script lang='ts'>
import Loading from '@/components/Loading.vue'
import Editor from '@/components/Editor.vue'
import { Component, Prop } from 'vue-property-decorator'
import { MarkedFloor } from '@/api/hole'
import Mention from '@/components/Discussion/Mention.vue'
import hljs from 'highlight.js'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { SearchFloorListRequest } from '@/api'

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
