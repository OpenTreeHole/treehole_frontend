<template>
<v-container fill-height>
  <v-alert type="error" transition="fade-transition" :value="alert" >网络错误</v-alert>
    <v-row v-for="(discussion, index) in discussions" :key="index" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <v-card class="px-4">
          <v-card-text class="pb-2 pt-2">
            <br>
          </v-card-text>
          <v-card-text class="py-0">

            <p :class="{fold: styleData[index]['fold'], unfold: !styleData[index]['fold']}" :id="index" class="ma-0 text-body-1" >{{index}}{{discussion['first_post']['content']}}
            </p>

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
            
          </v-card-text>
          <v-card-text class="pt-0 pb-2 text-center text-body-2">
            <span style="float:left">#{{ discussion['id'] }}</span>
            <span style="float:inherit">{{ discussion['date_updated'] | timeDifference }}</span>
            <span style="float:right">{{ discussion['count'] }}<v-icon>mdi-message-processing-outline</v-icon></span>
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
    }
  },
  methods: {
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
    // countLines(index){
    //   let element = document.getElementById(index)
    //   let totalHeight = element.scrollHeight
    //   let lineHeight = window.getComputedStyle(element, null).getPropertyValue('line-height')
    //   lineHeight = parseInt(lineHeight)
    //   console.log(totalHeight)
    //   console.log(lineHeight)
    //   console.log(totalHeight / lineHeight)
    //   return totalHeight / lineHeight
    // },
    // unfold(index){
    //   this.styleData[index]['height'] = 100 * this.lineHeight + 'px'
    //   this.styleData[index]['fold'] = 0
    // },
    // fold(index){
    //   this.styleData[index]['height'] = 3 * this.lineHeight + 'px'
    //   this.styleData[index]['fold'] = 1
    // },
    calcuteLines(){
      for(let i=0; i<this.styleData.length; i++){
        let element = document.getElementById(i)
        let totalHeight = element.scrollHeight
        this.styleData[i]['lines'] = totalHeight / this.lineHeight
      }
      console.log('calculated')
    },

  },
  watch: {
    discussions: function() {
      setTimeout(() => {
        let element = document.getElementById(1)
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
    // console.log(this.tags)
    // this.addDiscussion()
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

</style>
