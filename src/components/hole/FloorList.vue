<!--suppress HtmlUnknownAttribute -->
<template>
  <v-container>
    <v-card
      v-if='this.$route.name==="hole" && !this.initiating'
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
        v-viewer
      >
        <v-col>
          <FloorCard :floor='floor' :index='index' @reply='reply(floor.floorId)' @edit='edit(floor.floorId)'/>
        </v-col>
      </v-row>
    </transition-group>

    <!-- 弹出式表单及浮动按钮 -->
    <div class='float-btn' v-if='!initiating'>
      <v-dialog v-model='dialog' persistent max-width='600px'>
        <!-- 浮动按钮 -->
        <template v-slot:activator='{ on, attrs }'>
          <v-btn fab color='secondary' @mousedown.prevent v-bind='attrs' v-on='on'>
            <v-icon>mdi-send</v-icon>
          </v-btn>
        </template>

        <v-card>
          <v-card-title>
            <span class='headline'>发表回复</span>
          </v-card-title>

          <v-card-text>
            <!-- 回复内容 -->
            <Mention :mention-floor='replyFloor' />

            <v-form ref='form' v-model='valid' lazy-validation>
              <!-- 回贴表单 -->

              <!-- 富文本输入框 -->
              <editor
                ref='editor'
                :contentName='contentName'
                @error='editorError'
              ></editor>
            </v-form>
          </v-card-text>

          <!-- 下方按钮 -->
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color='primary' text @click='closeDialog'> 关闭</v-btn>
            <v-btn v-if='operation === "reply" || operation === "add"' color='primary' text :disabled='!valid' @click='addFloor'>
              发送
            </v-btn>
            <v-btn v-else-if='operation === "edit"' color='primary' text :disabled='!valid' @click='editFloor'>
              修改
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

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
import Editor from '@/components/Editor.vue'
import FloorListMixin from '@/mixins/FloorListMixin.vue'
import { Component, Prop } from 'vue-property-decorator'
import { WrappedHole } from '@/api/hole'
import Mention from '@/components/hole/Mention.vue'
import { FloorListRequest } from '@/api'
import hljs from 'highlight.js'
import { scrollTo } from '@/utils'
import FloorCard from '@/components/hole/FloorCard.vue'

@Component({
  components: {
    Mention,
    Loading,
    Editor,
    FloorCard
  }
})
export default class FloorList extends FloorListMixin {
  @Prop({ required: true }) private wrappedHoleOrId: WrappedHole | number

  public initiating = true

  public get computedDiscussionId (): number {
    if (this.wrappedHoleOrId instanceof WrappedHole) {
      return this.wrappedHoleOrId.hole.holeId
    } else {
      return this.wrappedHoleOrId
    }
  }

  public tryScrollTo (currentIndex:number, toIndex:number, retryTimes: number, interval: number) {
    setTimeout(() => {
      if (document.getElementById(currentIndex.toString()) && document.getElementById(toIndex.toString())) {
        console.log(retryTimes)
        scrollTo(currentIndex, toIndex)
      } else {
        this.tryScrollTo(currentIndex, toIndex, retryTimes - 1, interval)
      }
    }, interval)
  }

  public getFloorsRecursive (waitingFloorId: number = -1) {
    this.loading.load().then(() => {
      let found = false
      if (waitingFloorId !== -1) {
        for (let i = 0; i < this.request.loadedLength; i++) {
          if (this.floors[i].floorId === waitingFloorId) {
            console.log(i)
            this.tryScrollTo(0, i, 5, 350)
            found = true
            break
          }
        }
      }
      if (this.loading.hasNext && this.request.datas.length > this.request.loadedLength) {
        if (waitingFloorId !== -1 && !found) this.getFloorsRecursive(waitingFloorId)
        else this.getFloorsRecursive()
      }
    })
  }

  public init (displayFloorId: number) {
    this.request = new FloorListRequest(this.hole.floors, this.computedDiscussionId, this.getIndex)
    this.floors = this.request.datas
    this.initiating = false
    this.$nextTick(() => this.getFloorsRecursive(displayFloorId))
  }

  mounted () {
    if (this.wrappedHoleOrId instanceof WrappedHole) {
      this.hole = this.wrappedHoleOrId
      this.init(this.displayFloorId)
    } else {
      this.getDiscussion(this.wrappedHoleOrId).then(() => {
        this.init(this.displayFloorId)
      })
    }
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
