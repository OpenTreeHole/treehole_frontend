<template>
<v-container fill-height>
  
  <v-row justify="center">
    <v-col>
      <v-alert type="error" transition="fade-transition" :value="alert" >
        {{alertMessage}}
      </v-alert>
    </v-col>
  </v-row>

  <v-row v-for="(discussion, index) in discussions" :key="index" justify="center">
    <v-col cols="12" sm="10" md="8" lg="6" xl="4">

      <v-card>
        
      <!-- :href="'#/discussion/' + discussion['id']" -->
        <v-card-text class="pb-1 pt-2 font-weight-medium" >
          <v-chip v-for="(tag, tindex) in discussion['tag']" :key="tindex" :color="tag['color']" outlined class="mx-2" small ripple>
            {{tag['name']}}
          </v-chip> 
        </v-card-text>
 <!-- @click="toDiscussion(discussion['id'], index)" -->

        <v-card-text @click="toDiscussion(discussion['id'], index)" class="py-0 text-body-1 clickable" v-ripple>
          <p :class="{fold: styleData[index]['fold'], unfold: !styleData[index]['fold']}" :id="'p' + index" class="ma-0" >
            {{discussion['first_post']['content']}}
          </p>
        </v-card-text>

        

        <div v-if="styleData[index]['lines'] > 3">

          <div v-if="styleData[index]['fold']">
            <v-btn text block depressed x-small 
              color="grey lighten-1"
              @click="styleData[index]['fold'] = false">
              <v-icon>mdi-chevron-double-down</v-icon>
            </v-btn>
          </div>

          <div v-else>
            <v-btn text block depressed x-small 
              color="grey lighten-1"
              @click="styleData[index]['fold'] = true">
              <v-icon>mdi-chevron-double-up</v-icon>
            </v-btn>
          </div>

        </div>
        <div v-else>
          <div style="height: 0.5rem;"></div>
        </div>
          
        
        <v-card-text class="pt-0 pb-0 text-center caption">
          <span style="float:left">#{{ discussion['id'] }}</span>
          <span style="float:inherit">{{ discussion['date_updated'] | timeDifference }}</span>
          <span style="float:right">
            {{ discussion['count'] }}
            <v-icon small>mdi-message-processing-outline</v-icon>
          </span>
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
          color="success"
          class="fixed"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon>mdi-message-plus</v-icon>
        </v-btn>
      </template>

      <v-card>

        <v-card-title>
          <span class="headline">发表树洞</span>
        </v-card-title>

        <v-card-text>

          <!-- 警告信息 -->
          <v-alert type="error" transition="fade-transition" :value="formAlert" >{{formAlertMessage}}</v-alert>

          <!-- 发帖表单 -->
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
            @click="dialog = false"
          >
            关闭
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            :disabled="!valid"
            @click="addDiscussion"
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
      discussions: [],
      page: 1,
      // 展开折叠样式数据
      styleData: [], 
      lineHeight: 0,
      // 发帖表单
      content: '',
      tags: [],
      dialog: false,
      requiredRules: [v => !!v || '内容不能为空',],
      valid: true,
      // 底部加载
      loadingMsg: '加载中......',
    }
  },
  methods: {
    toDiscussion(discussion_id, card_id){
      setTimeout(() => {
         this.$router.push({
        path:`/discussion/${discussion_id}`,
      })
      }, 50)
    },

    addDiscussion(){
      // this.refs.form.validate()
      this.$axios
        .post('discussions/', { content: this.content, tags: this.tags })
        .then(response => {
          console.log(response.data)
          // 重新加载页面
          this.discussions = []
          this.page = 1
          this.getDiscussions()
          // 关闭对话框并重置 tag 信息
          this.dialog = false
          this.tags = []
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
    
    getDiscussions(){
      this.$axios
        .get('discussions/', { params: { page: this.page } })
        .then(response => {
          this.alert = false
          if(response.data.length === 0){this.loadingMsg = '没有然后了......'}
          else{
            this.page++
            for (let i=0; i<response.data.length; i++){
              this.styleData.push({'fold': true, 'lines': 3})
            }
            this.discussions.push.apply(this.discussions, response.data)
            console.log(response.data)
          }
        })
        .catch(() => {
          this.alert = true
        })
    },

    getTags(){ // 获取 所有的 tags
      this.$axios
        .get('tags/')
        .then(response => {
            this.tags = response.data
            console.log(response.data)
            this.formAlert = false
          })
        .catch((response) => {
          console.log(response.data)
          this.formAlert = true
          this.formAlertMessage = error.response.data['msg']
        })
    },
    onIntersect (entries, observer) {
        if(entries[0].isIntersecting){
          this.getDiscussions()
        }
      },
    calcuteLines(){
      for(let i=0; i<this.styleData.length; i++){
        let element = document.getElementById('p' + i)
        let totalHeight = element.scrollHeight
        this.styleData[i]['lines'] = totalHeight / this.lineHeight
      }
    },

  },
  watch: {
    discussions: function() {
      setTimeout(() => {
        let element = document.getElementById('p1')
        this.lineHeight = parseInt(window.getComputedStyle(element, null).getPropertyValue('line-height'))
        this.calcuteLines()
      }, 100)
    }
  },
  mounted() {
    
    window.onresize = () => {
      this.debouncedCalculateLines()
    } 
  },

  created(){
    this.debouncedCalculateLines = debounce(this.calcuteLines, 300)
    this.getTags()
  },

}
</script>

<style scoped>

  .fold{
    overflow: hidden;
    max-height: 4.5rem;
    transition: max-height 0.5s cubic-bezier(0, 1, 0, 1);
  }
  .unfold{
    overflow: hidden;
    max-height: 100rem;
    transition: max-height 1s ease-in-out;
  }
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
