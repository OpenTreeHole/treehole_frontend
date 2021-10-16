<template>
  <v-container>
    <message ref='message'></message>

    <h1>{{ profile.user.username }}</h1>

    <h2>我的收藏</h2>
    <p v-if='profile.favored_discussion.length === 0'>
      该功能正在开发中，敬请期待~
    </p>
    <DiscussionCard
      v-for='discussion in profile.favored_discussion'
      :key='discussion.id'
      :discussion='discussion'
    ></DiscussionCard>

    <v-row justify='space-around' style='margin: 20px 0; width: 100%'
    >
      <v-btn color='primary' width='40%' @click='changePassWd'>
        修改密码
      </v-btn>
      <v-btn color='error' width='40%' @click='logout'>退出登录</v-btn>
    </v-row
    >
  </v-container>
</template>

<script lang='ts'>
import Message from '@/components/Message.vue'
import DiscussionCard from '@/components/Discussion/DiscussionCard.vue'
import { Component, Watch, Vue } from 'vue-property-decorator'

@Component({
  components: {
    Message,
    DiscussionCard
  }
})
export default class Me extends Vue {
  public profile = {}

  public getUserInfo (): void {
    this.$axios
      .get('/profile/')
      .then((r) => {
        this.profile = r.data
      })
      .catch((e) => {
        this.$store.dispatch('messageError', e.r.data.msg)
      })
  }

  public logout (): void {
    localStorage.clear()
    console.log('111111111')
    this.$feUtils.reloadAll()
    console.log('2222222222222222')
  }

  public changePassWd (): void {
    alert('还没写完')
  }

  @Watch('$route', {
    immediate: true
  })
  routeChanged () {
    this.getUserInfo()
  }
}
</script>
