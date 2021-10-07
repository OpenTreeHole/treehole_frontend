<script>
import marked from 'marked'

export default {
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
    scrollTo (currentId, toId) {
      const currentOffsetTop = document.getElementById(currentId).offsetTop
      const toOffsetTop = document.getElementById(toId).offsetTop
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
    report (postId) {
      var msg = prompt('输入举报理由')
      this.$axios
        .post('reports/', {
          post_id: postId,
          reason: msg
        })
        .then((response) => {
          if (response.status === 200) {
            this.$refs.message.success('举报成功')
          } else {
            this.$refs.message.error(response.data.msg)
          }
        })
    }
  },
  computed: {
    contentName () {
      return 'discussion-' + this.$route.params.id + '-content'
    }
  }
}
</script>

<style scoped>

</style>
