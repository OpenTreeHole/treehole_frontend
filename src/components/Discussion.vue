<template>
<v-container >
  
  <v-row justify="center">
    <v-col>
      <v-alert type="error" transition="fade-transition" :value="alert" >{{alertMessage}}</v-alert>
    </v-col>
  </v-row>

  <v-row v-for="(post, index) in posts" :key="index" justify="center" align="start">
    <v-col cols="12" sm="10" md="8" lg="6" xl="4">

      <v-card :id="index">
        <v-card-text class="pb-1 pt-2 text-body-2" >
          <p> {{ post['username']}} </p>     
        </v-card-text>

        <v-card-text class="py-0">

          <!-- 回复部分 -->
          <div v-if="post['reply_to']" class="reply text-body-2">
            <div >
              <span >
                {{ post['reply_to']['username'] }} 
              </span>
              <v-icon @click="scrollTo(getIndex(post['reply_to']['id']))" small style="float:right">
                mdi-arrow-collapse-up
              </v-icon>
            </div>
            {{ post['reply_to']['content']}}
          </div>

          <!-- 正文部分 -->
          <div @click="reply(post['id'])" class="ma-0 text-body-1 clickable" v-ripple>
            {{post['content']}}
          </div>

        </v-card-text>

        <!-- 脚标 -->
        <v-card-text class="text-center text-body-2 pb-2">
          <span style="float:left">
            #{{ index }}
          </span>
          <span style="float:right">
            {{ post['date_created'] | timeDifference }}
          </span>
          <p></p>
        </v-card-text>

      </v-card>
    </v-col>      
  </v-row>
  
  <!-- 弹出式表单及浮动按钮 -->

    <v-dialog
      v-model="dialog"
      persistent
      max-width="600px"
    >
      <!-- 浮动按钮 -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          fab
          color="primary"
          class="fixed"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon>mdi-send</v-icon>
        </v-btn>
      </template>

      <v-card>

        <v-card-title>
          <span class="headline">发表回复</span>
        </v-card-title>

        <v-card-text>

          <!-- 警告信息 -->
          <v-alert type="error" transition="fade-transition" :value="formAlert" >{{formAlertMessage}}</v-alert>

          <!-- 回复内容 -->
           <div v-if="replyIndex != null" class="reply text-body-2">
            <div >
              <span >
                {{ posts[replyIndex]['username'] }} 
              </span>
              <!-- <v-icon @click="scrollTo(getIndex(post['reply_to']['id']))" small style="float:right">
                mdi-arrow-collapse-up
              </v-icon> -->
            </div>
            {{ posts[replyIndex]['content']}}
          </div>

          <!-- 回贴表单 -->
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-textarea
              v-model="content"
              :rules="requiredRules"
              label="说些什么......"
              required
              auto-grow
            ></v-textarea>
          </v-form>
         
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="dialog = false; replyIndex = null"
          >
            关闭
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            :disabled="!valid"
            @click="addPost"
          >
            发送
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  <!-- 载入中信息 -->
  <v-row 
    v-intersect="{
      handler: onIntersect,
      options: { threshold: 0 }}"
  >
    <v-col class="text-center">
      {{loadingMsg}}
    </v-col>
  </v-row>

</v-container>
</template>
  
<script>
import debounce from 'lodash.debounce'
export default {
  data(){
    return {
      // 提示信息
      alert: false,
      alertMessage: '网络错误',
      formAlert: false,
      formAlertMessage: '网络错误',
      // 帖子列表
      posts: [],
      page: 1,
      // 回复信息（可选回复） 为回复的贴子在 posts 数组中的序列
      replyIndex: null,
      // 发帖表单
      dialog: false,
      content: '',
      requiredRules: [v => !!v || '内容不能为空',],
      valid: true,
      // 底部加载
      loadingMsg: '加载中......',
    }
  },

  methods: {
    getIndex(pk){  // 接受一个 post 的 pk 并返回它在本页中的顺序（index）
      for(let i=0; i<this.posts.length; i++){
        if(this.posts[i]['id'] === pk){
          return i
        }
      }
      return 0
    },
    scrollTo(id){
      document.getElementById(id).scrollIntoView({ block: 'start', behavior: 'smooth' })
    },
    reply(pk){  // 接受一个 post 的 pk 并设置其为回复目标
      this.replyIndex = this.getIndex(pk)
      this.dialog = true
    }, 
    getPosts(page=this.page){
      this.$axios
        .get('posts/', { params: { id: this.$route.params.id, page: page } })
        .then(response => {
          this.alert = false
          if(response.data.length === 0){this.loadingMsg = '没有然后了......'}
          else{
            this.page++
            this.posts.push.apply(this.posts, response.data)
          }
        })
        .catch((error) => {
          console.log(error.response)
          this.alert = true
          this.alertMessage = error.response.data['msg']
        })
    },
    addPost(){
      // this.refs.form.validate()
      this.$axios
        .post('posts/', { content: this.content, discussion_id: this.$route.params.id })
        .then(response => {
          // 重新加载页面
          this.posts = []
          this.page = 1
          this.getPosts()
          // 关闭对话框并重置回复信息
          this.dialog = false
          this.replyIndex = null
          // 重置 formAlert 信息
          this.formAlert = false
          this.formAlertMessage = ''
        })
        .catch((error) => {
          console.log(error.response)
          this.formAlert = true
          this.formAlertMessage = error.response.data['msg']
        })
    },
    onIntersect (entries, observer) {
        if(entries[0].isIntersecting){
          this.getPosts()
        }
        setTimeout(() =>{
          if(entries[0].isIntersecting){
            this.getPosts()
          }
        }, 500)
      },

  },
  watch: {
    
  },
  mounted() {
    
  },

  created(){
    
  },

}
</script>

<style scoped>
  /* 回复模块 */
  .reply{
    margin: 0rem 1rem 0rem 1rem;
    margin-bottom: 1rem;
    padding: 0.5rem 0.5rem 0rem 0.5rem;
    background-color: #FFF3E0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
  }

  /* 可点击 */
  .clickable{
    cursor: pointer;
  }

  /* 浮动按钮 固定在右下角 */
  .fixed{
    position:fixed;
    right: 8px;
    bottom: 64px;
  }

</style>
