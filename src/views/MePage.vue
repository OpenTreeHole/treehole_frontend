<template>
  <v-container>
    <v-card v-if='profile'>
      <v-card-title>
        <p>注册时间：{{ joinedTimeDisplayMsg }}</p>
      </v-card-title>
      <v-card-text v-if='profile.isAdmin'>
        <p>您当前为管理员身份</p>
      </v-card-text>
      <v-card-text class='d-flex'>
        <v-switch
          v-model='$vuetify.theme.dark'
          :label='darkModeLabel'
          :value='true'
          color='dark'
          hide-details
        />
      </v-card-text>
      <v-card-text class='d-flex'>
        <span class='d-flex'>
          <v-btn color='primary' width='40vw' @click='changePassWd'>修改密码</v-btn>
        </span>
        <span class='d-flex'>
          <v-btn color='error' width='40vw' @click='logout'>退出登录</v-btn>
        </span>
      </v-card-text>
    </v-card>
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

  get darkModeLabel(): string {
    return this.$vuetify.theme.dark ? '夜间模式开启' : '夜间模式关闭'
  }

  public getUserInfo(): void {
    this.profile = UserStore.userProfile
    this.joinedTimeDisplayMsg = convertDate(UserStore.userProfile?.joinedTime)
  }

  public logout(): void {
    LocalStorageStore.clear()
    UserStore.clear()
    this.$router.push('/login')
  }

  public changePassWd(): void {
    this.$router.push('/changepassword')
  }

  public onPreloaded() {
    this.getUserInfo()
  }
}
</script>

<style scoped>
.v-card {
  margin: 20px;
  padding: 15px;
}
</style>
