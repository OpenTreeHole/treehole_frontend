<script lang='ts'>
import marked from 'marked'
import { Component, Vue } from 'vue-property-decorator'
import Loading from '@/components/Loading.vue'
import Editor from '@/components/Editor.vue'

@Component
export default class DiscussionMixin extends Vue {
  // 帖子列表
  public discussion = null
  public posts: Array<any> = []
  public page = 1
  // 回复信息（可选回复）
  public replyIndex: any = null // 回复的贴子在 posts 数组中的序列
  public replyPk: any = null // 回复的贴子的 id
  // 发帖表单
  public dialog = false
  // content: '',
  public requiredRules = [(v: any) => !!v || '内容不能为空']
  public valid = true
  public escListener = (e: KeyboardEvent) => {
    if (e && e.key === 'Escape') { // 按Esc
      this.closeDialog()
    }
  }

  $refs: {
    form: HTMLFormElement
    editor: Editor
    loading: Loading
  }

  get computedDiscussionId (): number {
    return -1
  }

  public editorError (msg: string): void {
    this.$store.dispatch('messageError', msg)
  }

  public closeDialog (): void {
    this.dialog = false
    this.replyIndex = null
    this.replyPk = null
  }

  public getIndex (pk: number): number {
    // 接受一个 post 的 pk 并返回它在本页中的顺序（index）
    for (let i = 0; i < this.posts.length; i++) {
      if (this.posts[i].id === pk) {
        return i
      }
    }
    return 0
  }

  public scrollTo (currentId: string, toId: string): void {
    const currentOffsetTop = document.getElementById(currentId)?.offsetTop
    const toOffsetTop = document.getElementById(toId)?.offsetTop
    const scrollDistance = currentOffsetTop && toOffsetTop ? toOffsetTop - currentOffsetTop : 0
    window.scrollBy({
      top: scrollDistance, //  正值向下
      left: 0,
      behavior: 'smooth'
    })
  }

  public reply (pk: number): void {
    // 接受一个 post 的 pk 并设置其为回复目标
    this.replyIndex = this.getIndex(pk)
    this.replyPk = pk
    this.dialog = true
  }

  public getDiscussion (pk: number): void {
    this.$axios
      .get('discussions/', { params: { discussion_id: pk } })
      .then((response) => {
        response.data.first_post.content = marked(
          response.data.first_post.content
        )
        this.discussion = response.data
      })
      .catch((error) => {
        this.$store.dispatch('messageError', error.response.data.msg)
      })
  }

  public getPosts (page = this.page): Promise<any> {
    return this.$axios
      .get('posts/', {
        params: {
          id: this.computedDiscussionId,
          page: page
        }
      })
      .then((response) => {
        response.data.forEach(function (postItem: any) {
          postItem.content = marked(postItem.content)
        })
        this.posts.push.apply(this.posts, response.data)
        if (response.data.length > 0) {
          this.page++
        }
      })
      .catch((error) => {
        this.$store.dispatch('messageError', error.response.data.msg)
      })
  }

  public getNewPosts (): void {
    this.$axios
      .get('posts/', {
        params: {
          id: this.computedDiscussionId,
          order: this.posts.length
        }
      })
      .then((response) => {
        this.posts.push.apply(this.posts, response.data)
      })
      .catch((error) => {
        this.$store.dispatch('messageError', error.response.data.msg)
      })
  }

  public addPost (): void {
    if (this.$refs.form.validate() && this.$refs.editor.validate()) {
      // 先关闭对话框,优化用户体验
      this.dialog = false
      this.$axios
        .post('posts/', {
          content: this.$refs.editor.getContent(),
          discussion_id: this.computedDiscussionId,
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
          this.$store.dispatch('messageError', error.response.data.msg)
        })
    }
  }

  public report (postId: number): void {
    const msg = prompt('输入举报理由')
    if (msg === '') {
      this.$store.dispatch('messageError', '举报理由不能为空！')
    }
    this.$axios
      .post('reports/', {
        post_id: postId,
        reason: msg
      })
      .then((response) => {
        if (response.status === 200) {
          this.$store.dispatch('messageSuccess', '举报成功')
        } else {
          this.$store.dispatch('messageError', response.data.msg)
        }
      })
  }

  public CloseDialogWhenClickEmptyArea (e: Event): void {
    let el = e.target as HTMLElement
    while (el !== document.body) {
      if (el.id === 'header' || el.id === 'footer') {
        return
      }
      if (el.tagName.toUpperCase() === 'DIV' && (
        el.classList.contains('v-card')
      )) {
        return
      }
      if (!el.parentNode) return
      el = el.parentNode as HTMLElement
    }
    this.closeDialog()
  }

  get contentName (): string {
    return 'discussion-' + this.computedDiscussionId + '-content'
  }

  mounted () {
    document.body.addEventListener('click', this.CloseDialogWhenClickEmptyArea)
    window.addEventListener('keydown', this.escListener)
  }

  destroyed () {
    document.body.removeEventListener('click', this.CloseDialogWhenClickEmptyArea)
    window.removeEventListener('keydown', this.escListener)
  }
}
</script>

<style scoped>

</style>
