<template>
  <v-container v-if='profile'>
    <h1>注册时间：{{ joinedTimeDisplayMsg }}</h1>
    <h1 v-if='profile.isAdmin'>您当前为管理员身份</h1>

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
import DiscussionCard from '@/components/Discussion/DiscussionCard.vue'
import { Component } from 'vue-property-decorator'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { UserProfile } from '@/api/user'
import { camelizeKeys, convertDate } from '@/utils'

@Component({
  components: {
    DiscussionCard
  }
})
export default class Me extends BaseComponentOrView {
  public profile: UserProfile | null = null
  public joinedTimeDisplayMsg: string

  public getUserInfo (): void {
    this.$axios.get('/users').then((response) => {
      const profile : UserProfile = camelizeKeys(response.data)
      this.profile = profile
      this.joinedTimeDisplayMsg = convertDate(profile.joinedTime)
      this.$user.userProfile = profile
    }).catch((error) => {
      this.messageError(error)
    })
  }

  public logout (): void {
    localStorage.clear()
    this.$user.clear()
    this.$router.push('/login')
  }

  public changePassWd (): void {
    alert('还没写完')
  }

  created () {
    this.getUserInfo()
  }
}
</script>
