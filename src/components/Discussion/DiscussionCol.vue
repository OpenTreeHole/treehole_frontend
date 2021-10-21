<!--suppress HtmlUnknownAttribute -->
<template>
  <v-col class='mb-5' cols='6' id='discol'>
    <transition-group name='slide-fade'>
      <v-row
        v-for='(floor, index) in floors'
        :key='index'
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
                class='floor-body rich-text text--primary ma-0 text-body-1'
                v-html='floor.content'
              ></div>
            </v-card-text>

            <!-- 脚标 -->
            <v-card-text class='d-flex justify-space-between text-body-2 pb-2'>
              <div>{{ index }}L</div>
              <v-btn
                x-small
                text
                @click="reply(floor.floorId)"
                class='grey--text'
                style='padding-bottom: -10px'
              >
                <v-icon>mdi-reply-outline</v-icon>
                回复
              </v-btn>
              <v-btn
                x-small
                text
                @click='report(floor.floorId)'
                class='grey--text'
                style='padding-bottom: -10px'
              >
                <v-icon>mdi-alert-outline</v-icon>
                举报
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </transition-group>

    <!-- 弹出式表单及浮动按钮 -->

    <v-dialog v-model='dialog' persistent max-width='600px'>
      <!-- 浮动按钮 -->
      <template v-slot:activator='{ on, attrs }'>
        <v-btn fab color='secondary' class='fixed' v-bind='attrs' v-on='on'>
          <v-icon>mdi-send</v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-card-title>
          <span class='headline'>发表回复</span>
        </v-card-title>

        <v-card-text>
          <!-- 回复内容 -->
          <Mention :mention-floor='replyFloor'/>

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
          <v-btn color='primary' text :disabled='!valid' @click='addFloor'>
            发送
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 载入中信息 -->
    <loading
      ref='loading'
      :length='floors.length'
      :loadList='getPosts'
    ></loading>
  </v-col>
</template>

<script lang='ts'>
import Loading from '@/components/Loading.vue'
import Editor from '@/components/Editor.vue'
import DiscussionMixin from '@/mixins/DiscussionMixin.vue'
import { Component, Prop } from 'vue-property-decorator'
import { WrappedHole } from '@/components/Discussion/hole'
import Mention from '@/components/Discussion/Mention.vue'

@Component({
  components: {
    Mention,
    Loading,
    Editor
  }
})
export default class DiscussionCol extends DiscussionMixin {
  @Prop({ required: true, type: WrappedHole }) private wrappedHole: WrappedHole

  public get computedDiscussionId (): number {
    return this.wrappedHole.hole.holeId
  }

  created () {
    this.hole = this.wrappedHole
    this.getPosts()
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
.fixed {
  position: fixed;
  right: 8px;
  bottom: 64px;

  .v-btn {
    margin: 5px;
  }
}

.slide-fade-enter-active {
  transition: all .3s ease;
}

.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>
