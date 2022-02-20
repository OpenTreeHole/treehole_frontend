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
import { Component } from 'vue-property-decorator'
import { UserProfile } from '@/models/user'
import { convertDate } from '@/utils/utils'
import UserStore from '@/store/modules/UserStore'
import BaseView from '@/mixins/BaseView.vue'
import LocalStorageStore from '@/store/modules/LocalStorageStore'

@Component
export default class MePage extends BaseView {
  public profile: UserProfile | null = null
  public joinedTimeDisplayMsg: string

  public getUserInfo (): void {
    this.profile = UserStore.userProfile
    this.joinedTimeDisplayMsg = convertDate(UserStore.userProfile?.joinedTime)
  }

  public logout (): void {
    LocalStorageStore.clear()
    UserStore.clear()
    this.$router.push('/login')
  }

  public changePassWd (): void {
    this.$router.push('/changepassword')
  }

  public onPreloaded () {
    this.getUserInfo()
  }
}
</script>
