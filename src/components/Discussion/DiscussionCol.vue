<!--suppress HtmlUnknownAttribute -->
<template>
  <v-col class='mb-5' cols='6' id='discol'>
    <transition-group name='slide-fade'>
      <v-row
        v-for='(post, index) in posts'
        :key='index'
        justify='center'
        align='start'
        v-viewer
      >
        <v-col>
          <v-card :id='index'>
            <v-card-text class='pb-1 pt-2 text-body-2'>
              <p>
                {{ post['username'] }}
                <span style='float: right'>
                {{ post['date_created'] | timeDifference }}
              </span>
              </p>
            </v-card-text>

            <v-card-text class='py-0'>
              <!-- 回复部分 -->
              <div v-if="post['reply_to']" class='reply text-body-2'>
                <!-- 回复框顶栏 -->
                <div>
                <span>
                  {{ posts[getIndex(post.reply_to)].username }}
                </span>
                  <v-icon
                    @click='
                    scrollTo(index, getIndex(posts[getIndex(post.reply_to)].id))
                  '
                    small
                    style='float: right'
                  >
                    mdi-arrow-collapse-up
                  </v-icon>
                </div>
                <div>
                  {{ posts[getIndex(post.reply_to)].content | plainText }}
                </div>
              </div>

              <!-- 正文部分 -->
              <div
                class='rich-text text--primary ma-0 text-body-1'
                v-html='post.content'
              ></div>
            </v-card-text>

            <!-- 脚标 -->
            <v-card-text class='d-flex justify-space-between text-body-2 pb-2'>
              <div>#{{ index }}</div>
              <v-btn
                x-small
                text
                @click="reply(post['id'])"
                class='grey--text'
                style='padding-bottom: -10px'
              >
                <v-icon>mdi-reply-outline</v-icon>
                回复
              </v-btn>
              <v-btn
                x-small
                text
                @click='report(post.id)'
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

      <v-card>
        <v-card-title>
          <span class='headline'>发表回复</span>
        </v-card-title>

        <v-card-text>
          <!-- 回复内容 -->
          <div v-if='replyIndex != null' class='reply text-body-2'>
            <div>
              <span>
                {{ posts[replyIndex]['username'] }}
              </span>
            </div>
            <div>
              {{ posts[replyIndex].content | plainText }}
            </div>
          </div>

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
          <v-btn color='primary' text :disabled='!valid' @click='addPost'>
            发送
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 载入中信息 -->
    <loading
      ref='loading'
      :length='posts.length'
      :loadList='getPosts'
    ></loading>
  </v-col>
</template>

<script>
import Loading from '@/components/Loading.vue'
import Editor from '@/components/Editor.vue'
import DiscussionMixin from '@/mixins/DiscussionMixin'

export default {
  extends: DiscussionMixin,
  props: {
    discussionId: Number
  },
  components: {
    Loading,
    Editor
  },
  created () {
    this.getDiscussion(this.discussionId)
  }
}
</script>

<style scoped>
/* 回复模块 */
.reply {
  margin: 0 1rem 0 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0.5rem 0 0.5rem;
  background-color: #a5a4a4;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
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
