<template>
  <v-col class='mb-5' cols='6'>
    <!-- 警告信息 -->
    <message ref='message'></message>

    <!--    <v-card
          v-if="this.$vuetify.breakpoint.mdAndUp && this.discussion"
          class="mx-auto mb-6"
          max-width="670px"
          style="margin-top: -32px; z-index: 99"
        >
          <v-card-text class="text&#45;&#45;primary pb-2 pt-2 font-weight-medium">
            <v-chip
              v-for="(tag, tindex) in discussion.tag"
              :key="tindex"
              :color="tag.color"
              outlined
              class="ma-1"
              ripple
            >
              {{ tag.name }}
            </v-chip>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-text class="text&#45;&#45;primary pt-2 pb-2 text-center">
            <span style="float: left">#{{ discussion.id }}</span>
            <span style="float: inherit">{{
              discussion.date_updated | timeDifference
            }}</span>
            <span style="float: right">
              {{ discussion.count }}
              <v-icon small>mdi-message-processing-outline</v-icon>
            </span>
          </v-card-text>
        </v-card>-->
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
import Message from '@/components/Message.vue'

import marked from 'marked'

export default {
  props: {
    discussionId: Number
  },
  components: {
    Loading,
    Editor,
    Message
  },
  data () {
    return {
      // 帖子列表
      discussion: null,
      posts: [],
      page: 1,
      // 回复信息（可选回复）
      replyIndex: null, // 回复的贴子在 posts 数组中的序列
      replyPk: null, // 回复的贴子的 id
      // 发帖表单
      dialog: false,
      // content: '',
      requiredRules: [(v) => !!v || '内容不能为空'],
      valid: true
    }
  },
  computed: {
    contentName () {
      return 'discussion-' + this.$route.params.id + '-content'
    }
  },
  methods: {
    editorError (msg) {
      this.$refs.message.error(msg)
    },
    closeDialog () {
      this.dialog = false
      this.replyIndex = null
      this.replyPk = null
    },
    getIndex (pk) {
      // 接受一个 post 的 pk 并返回它在本页中的顺序（index）
      for (let i = 0; i < this.posts.length; i++) {
        if (this.posts[i].id === pk) {
          return i
        }
      }
      return 0
    },
    scrollTo (current_id, to_id) {
      const currentOffsetTop = document.getElementById(current_id).offsetTop
      const toOffsetTop = document.getElementById(to_id).offsetTop
      const scrollDistance = toOffsetTop - currentOffsetTop
      window.scrollBy({
        top: scrollDistance, //  正值向下
        left: 0,
        behavior: 'smooth'
      })
    },
    reply (pk) {
      // 接受一个 post 的 pk 并设置其为回复目标
      this.replyIndex = this.getIndex(pk)
      this.replyPk = pk
      this.dialog = true
    },
    getDiscussion (pk) {
      this.$axios
        .get('discussions/', { params: { discussion_id: pk } })
        .then((response) => {
          response.data.first_post.content = marked(
            response.data.first_post.content
          )
          this.discussion = response.data
        })
        .catch((error) => {
          this.$refs.message.error(error.response.data.msg)
        })
    },
    getPosts (page = this.page) {
      return this.$axios
        .get('posts/', {
          params: {
            id: this.discussionId,
            page: page
          }
        })
        .then((response) => {
          response.data.forEach(function (postItem) {
            postItem.content = marked(postItem.content)
          })
          this.posts.push.apply(this.posts, response.data)
          if (response.data.length > 0) {
            this.page++
          }
        })
        .catch((error) => {
          this.$refs.message.error(error.response.data.msg)
        })
    },
    getNewPosts () {
      this.$axios
        .get('posts/', {
          params: {
            id: this.$route.params.id,
            order: this.posts.length
          }
        })
        .then((response) => {
          this.posts.push.apply(this.posts, response.data)
        })
        .catch((error) => {
          this.$refs.message.error(error.response.data.msg)
        })
    },
    addPost () {
      if (this.$refs.form.validate() && this.$refs.editor.validate()) {
        // 先关闭对话框,优化用户体验
        this.dialog = false
        this.$axios
          .post('posts/', {
            content: this.$refs.editor.getContent(),
            discussion_id: this.$route.params.id,
            post_id: this.replyPk
          })
          .then(() => {
            // 动态更新页面
            this.$refs.loading.isLoading = true
            this.getNewPosts()
            // 重置回复信息
            this.replyIndex = null
            this.replyPk = null
            // 重置内容
            this.$refs.editor.setContent('')
          })
          .catch((error) => {
            console.log(error.response)
            this.$refs.message.error(error.response.data.msg)
          })
      }
    },
    report (post_id) {
      var msg = prompt('输入举报理由')
      this.$axios
        .post('reports/', {
          post_id: post_id,
          reason: msg
        })
        .then((response) => {
          if (response.status == 200) {
            this.$refs.message.success('举报成功')
          } else {
            this.$refs.message.error(error.response.data.msg)
          }
        })
    }
  },
  created () {
    console.log(this.discussionId)
    this.getDiscussion(this.discussionId)
  }
  // watch: {
  //   $route() {
  //     this.this.posts = []
  //     this.discussions = null
  //     this.getDiscussion(this.$route.params.id)
  //     this.$forceUpdate()
  //   },
  // },
}
</script>

<style scoped>
/* 回复模块 */
.reply {
  margin: 0rem 1rem 0rem 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0.5rem 0rem 0.5rem;
  background-color: #a5a4a4;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
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
