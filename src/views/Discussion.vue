<template>
  <v-container>
    <!-- 警告信息 -->
    <message ref="message"></message>

    <v-card
      v-if="this.$vuetify.breakpoint.mdAndUp && this.discussion"
      class="mx-auto mb-6"
      max-width="700px"
      style="margin-top: -32px; z-index: 99"
    >
      <v-card-text class="pb-2 pt-2 font-weight-medium">
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

      <v-card-text class="pt-2 pb-2 text-center">
        <span style="float: left">#{{ discussion.id }}</span>
        <span style="float: inherit">{{
          discussion.date_updated | timeDifference
        }}</span>
        <span style="float: right">
          {{ discussion.count }}
          <v-icon small>mdi-message-processing-outline</v-icon>
        </span>
      </v-card-text>
    </v-card>

    <v-row
      justify="center"
      v-if="this.$vuetify.breakpoint.smAndDown && this.discussion"
    >
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <v-card>
          <v-card-text class="pb-2 pt-2 font-weight-medium">
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

          <v-card-text class="pt-2 pb-2 text-center">
            <span style="float: left">#{{ discussion.id }}</span>
            <span style="float: inherit">{{
              discussion.date_updated | timeDifference
            }}</span>
            <span style="float: right">
              {{ discussion.count }}
              <v-icon small>mdi-message-processing-outline</v-icon>
            </span>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row
      v-for="(post, index) in posts"
      :key="index"
      justify="center"
      align="start"
    >
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <v-card :id="index">
          <v-card-text class="pb-1 pt-2 text-body-2">
            <p>{{ post['username'] }}</p>
          </v-card-text>

          <v-card-text class="py-0">
            <!-- 回复部分 -->
            <div v-if="post['reply_to']" class="reply text-body-2">
              <!-- 回复框顶栏 -->
              <div>
                <span>
                  {{ posts[getIndex(post.reply_to)].username }}
                </span>
                <v-icon
                  @click="
                    scrollTo(index, getIndex(posts[getIndex(post.reply_to)].id))
                  "
                  small
                  style="float: right"
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
              class="ma-0 text-body-1"
              id="rich-text"
              v-html="post.content"
            ></div>
          </v-card-text>

          <!-- 脚标 -->
          <v-card-text class="d-flex justify-space-between text-body-2 pb-2">
            <div>#{{ index }}</div>
            <v-btn
              x-small
              text
              @click="reply(post['id'])"
              class="grey--text"
              style="padding-bottom: -10px"
            >
              回复
              <v-icon>mdi-reply-outline</v-icon>
            </v-btn>
            <div>
              {{ post['date_created'] | timeDifference }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 弹出式表单及浮动按钮 -->

    <v-dialog v-model="dialog" persistent max-width="600px">
      <!-- 浮动按钮 -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn fab color="primary" class="fixed" v-bind="attrs" v-on="on">
          <v-icon>mdi-send</v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-card-title>
          <span class="headline">发表回复</span>
        </v-card-title>

        <v-card-text>
          <!-- 回复内容 -->
          <div v-if="replyIndex != null" class="reply text-body-2">
            <div>
              <span>
                {{ posts[replyIndex]['username'] }}
              </span>
            </div>
            <div>
              {{ posts[replyIndex].content | plainText }}
            </div>
          </div>

          <v-form ref="form" v-model="valid" lazy-validation>
            <!-- 回贴表单 -->

            <!-- 富文本输入框 -->
            <editor
              ref="editor"
              :contentName="contentName"
              @invalid="editorInvalid"
            ></editor>
          </v-form>
        </v-card-text>

        <!-- 下方按钮 -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="closeDialog"> 关闭 </v-btn>
          <v-btn color="primary" text :disabled="!valid" @click="addPost">
            发送
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 载入中信息 -->
    <loading
      ref="loading"
      :length="posts.length"
      :loadList="getPosts"
    ></loading>
  </v-container>
</template>

<script>
import Loading from '@/components/Loading.vue'
import Editor from '@/components/Editor.vue'
import Message from '@/components/Message.vue'

export default {
  components: {
    Loading,
    Editor,
    Message,
  },
  data() {
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
      valid: true,
    }
  },
  computed: {
    contentName() {
      return 'discussion-' + this.$route.params.id + '-content'
    },
  },
  methods: {
    editorInvalid(msg) {
      this.$refs.message.error(msg)
    },
    closeDialog() {
      this.dialog = false
      this.replyIndex = null
      this.replyPk = null
    },
    getIndex(pk) {
      // 接受一个 post 的 pk 并返回它在本页中的顺序（index）
      for (let i = 0; i < this.posts.length; i++) {
        if (this.posts[i].id === pk) {
          return i
        }
      }
      return 0
    },
    scrollTo(current_id, to_id) {
      const currentOffsetTop = document.getElementById(current_id).offsetTop
      const toOffsetTop = document.getElementById(to_id).offsetTop
      const scrollDistance = toOffsetTop - currentOffsetTop
      window.scrollBy({
        top: scrollDistance, //  正值向下
        left: 0,
        behavior: 'smooth',
      })
    },
    reply(pk) {
      // 接受一个 post 的 pk 并设置其为回复目标
      this.replyIndex = this.getIndex(pk)
      this.replyPk = pk
      this.dialog = true
    },
    getDiscussion(pk) {
      this.$axios
        .get('discussions/', { params: { discussion_id: pk } })
        .then((response) => {
          this.discussion = response.data
        })
        .catch((error) => {
          this.$refs.message.error(error.response.data.msg)
        })
    },
    getPosts(page = this.page) {
      return this.$axios
        .get('posts/', { params: { id: this.$route.params.id, page: page } })
        .then((response) => {
          this.posts.push.apply(this.posts, response.data)
          if (response.data.length > 0) {
            this.page++
          }
        })
        .catch((error) => {
          this.$refs.message.error(error.response.data.msg)
        })
    },
    getNewPosts() {
      this.$axios
        .get('posts/', {
          params: { id: this.$route.params.id, order: this.posts.length },
        })
        .then((response) => {
          this.posts.push.apply(this.posts, response.data)
        })
        .catch((error) => {
          this.$refs.message.error(error.response.data.msg)
        })
    },
    addPost() {
      if (this.$refs.form.validate() && this.$refs.editor.validate()) {
        //先关闭对话框,优化用户体验
        this.dialog = false
        this.$axios
          .post('posts/', {
            content: this.$refs.editor.content,
            discussion_id: this.$route.params.id,
            post_id: this.replyPk,
          })
          .then(() => {
            // 动态更新页面
            this.$refs.loading.isLoading = true
            this.getNewPosts()
            // 重置回复信息
            this.replyIndex = null
            this.replyPk = null
            // 重置内容
            this.$refs.editor.content = ''
          })
          .catch((error) => {
            console.log(error.response)
            this.$refs.message.error(error.response.data.msg)
          })
      }
    },
  },
  created() {
    this.getDiscussion(this.$route.params.id)
  },
}
</script>

<style scoped>
/* 回复模块 */
.reply {
  margin: 0rem 1rem 0rem 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0.5rem 0rem 0.5rem;
  background-color: #fff3e0;
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
</style>
