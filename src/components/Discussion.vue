<template>
<v-container fill-height>
  
  <v-row justify="center">
    <v-col>
      <v-alert type="error" transition="fade-transition" :value="alert" >网络错误</v-alert>
    </v-col>
  </v-row>

  <v-row v-for="(post, index) in posts" :key="index" justify="center">
    <v-col cols="12" sm="10" md="8" lg="6" xl="4">

      <v-card >
        <v-card-text class="pb-1 pt-2 text-body-2" >
          <p> {{ post['username']}} </p>      
        </v-card-text>

        <v-card-text class="py-0">
          <p class="ma-0 text-body-1" >
            {{post['content']}}
          </p>
        </v-card-text>

        <v-card-text class="pt-0 pb-2 text-center text-body-2">
          <span style="float:left">
            #{{ index }}
          </span>
          <span style="float:right">
            {{ post['date_created'] | timeDifference }}
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
      posts: [],
      page: 1,
      alert: false,
      loadingMsg: '加载中......',
    }
  },

  methods: {

    getPosts(){
      this.$axios
        .get('posts/', { params: { id: this.$route.params.id, page: this.page } })
        .then(response => {
          this.alert = false
          if(response.data.length === 0){this.loadingMsg = '没有然后了......'}
          else{
            this.page++
            this.posts.push.apply(this.posts, response.data)
            console.log(response.data)
          }
        })
        .catch(() => {
          this.alert = true
        })
    },
    onIntersect (entries, observer) {
        if(entries[0].isIntersecting){
          this.getPosts()
        }
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


</style>
