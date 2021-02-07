<template>
<v-container fill-height>
  
  <v-row justify="center">
    <v-col>
      <v-alert type="error" transition="fade-transition" :value="alert" >网络错误</v-alert>
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

        

        <div v-if="styleData[index]['lines']>3">

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
          <v-btn text block depressed x-small disabled></v-btn>
        </div>
          
        
        <v-card-text class="pt-0 pb-2 text-center text-body-2">
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
      discussions: [],
      styleData: [],
      page: 1,
      lineHeight: 0,
      alert: false,
      loadingMsg: '加载中......',
      isRipple: false,
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
    div(){
      console.log('div')
    },
    addDiscussion(){
      this.$axios.post('discussions/', {content: 'The Material Design color system helps you apply color to your UI in a meaningful way. In this system, you select a primary and a secondary color to represent ...', tags: ['tag1', 'tag2', 'tag3']})
        .then(response => {
          console.log(response.data)
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
  v-btn{
    position: absolute;
    z-index: 999;
  }

</style>
