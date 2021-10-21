<template>
  <v-container>
    <!-- 警告信息 -->
    <message ref='message'></message>

    <v-card
      v-if='this.$vuetify.breakpoint.mdAndUp && this.discussion'
      class='mx-auto mb-6'
      max-width='700px'
      style='margin-top: -32px; z-index: 99'
    >
      <v-card-text class='text--primary pb-2 pt-2 font-weight-medium'>
        <v-chip
          v-for='(tag, tindex) in discussion.tag'
          :key='tindex'
          :color='tag.color'
          outlined
          class='ma-1'
          ripple
        >
          {{ tag.name }}
        </v-chip>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-text class='text--primary pt-2 pb-2 text-center'>
        <span style='float: left'>#{{ discussion.id }}</span>
        <span style='float: inherit'>{{
            discussion.date_updated | timeDifference
          }}</span>
        <span style='float: right'>
          {{ discussion.count }}
          <v-icon small>mdi-message-processing-outline</v-icon>
        </span>
      </v-card-text>
    </v-card>

    <v-row
      justify='center'
      v-if='this.$vuetify.breakpoint.smAndDown && this.discussion'
    >
      <v-col cols='12' sm='10' md='8' lg='6' xl='4'>
        <v-card>
          <v-card-text class='text--primary pb-2 pt-2 font-weight-medium'>
            <v-chip
              v-for='(tag, tindex) in discussion.tag'
              :key='tindex'
              :color='tag.color'
              outlined
              class='ma-1'
              ripple
            >
              {{ tag.name }}
            </v-chip>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-text class='text--primary pt-2 pb-2 text-center'>
            <span style='float: left'>#{{ discussion.id }}</span>
            <span style='float: inherit'>{{
                discussion.date_updated | timeDifference
              }}</span>
            <span style='float: right'>
              {{ discussion.count }}
              <v-icon small>mdi-message-processing-outline</v-icon>
            </span>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row
      v-for='(post, index) in posts'
      :key='index'
      justify='center'
      align='start'
      v-viewer
    >
      <v-col cols='12' sm='10' md='8' lg='6' xl='4'>
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
            <v-card v-if="post['reply_to']" class='reply'>
              <!-- 回复框顶栏 -->
              <v-card-text class='pb-1 pt-2 text-body-2'>
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
              </v-card-text>
              <v-card-text class='reply-text'>
                {{ posts[getIndex(post.reply_to)].content | plainText }}
              </v-card-text>
            </v-card>

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
          <v-card v-if='replyIndex != null' class='reply'>
            <v-card-text>
              <span>
                {{ posts[replyIndex]['username'] }}
              </span>
            </v-card-text>
            <v-card-text class='reply-text'>
              {{ posts[replyIndex].content | plainText }}
            </v-card-text>
          </v-card>

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
      :length='posts.length'
      :loadList='getPosts'
    ></loading>
  </v-container>
</template>

<script lang='ts'>
import Loading from '@/components/Loading.vue'
import Editor from '@/components/Editor.vue'
import Message from '@/components/Message.vue'
import DiscussionMixin from '@/mixins/DiscussionMixin.vue'
import { Component } from 'vue-property-decorator'

@Component({
  components: {
    Loading,
    Editor,
    Message
  }
})
export default class Discussion extends DiscussionMixin {
  public get computedDiscussionId (): number {
    return parseInt(this.$route.params.id)
  }

  created () {
    this.getDiscussion(this.computedDiscussionId)
  }
}
</script>

<style lang='scss' scoped>
/* 回复模块 */
.reply {
  margin: 0 1rem 1rem;
  padding: 0.5rem 0.5rem 0 0.5rem;
  //background-color: #a5a4a4;
  //color: white;
  //overflow: hidden;
  //text-overflow: ellipsis;
  //display: -webkit-box;
  //-webkit-line-clamp: 4;
  //-webkit-box-orient: vertical;
}

.v-card__text.reply-text {
  margin-top: -1.2rem;
  color: #30312c;
}

/* 可点击 */
.clickable {
  cursor: pointer;
}

/* 浮动按钮 固定在右下角 */
.fixed {
  position: fixed;
  right: 8px;
  bottom: 64px;
}
</style>
