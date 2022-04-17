<template>
  <v-container>
    <v-card v-if="profile">
      <v-card-title> 注册时间：{{ joinedTimeDisplayMsg }} </v-card-title>
      <v-card-text v-if="profile.isAdmin"> 您当前为<span style="color: mediumvioletred">管理员</span>身份 </v-card-text>
      <v-card-text>
        屏蔽标签：<tag-input
          v-model="blockedTags"
          :tag-rules="[]"
        ></tag-input>
      </v-card-text>
      <v-card-text>
        <v-radio-group
          class="ma-0"
          v-model="showNSFW"
          row
        >
          <template v-slot:label>
            <span>NSFW 内容：</span>
          </template>
          <v-radio
            label="隐藏"
            :value="0"
          />
          <v-radio
            label="折叠"
            :value="1"
          />
          <v-radio
            label="显示"
            :value="2"
          />
        </v-radio-group>
      </v-card-text>
      <v-card-text class="d-flex">
        <v-switch
          class="ma-0"
          v-model="$vuetify.theme.dark"
          :label="darkModeLabel"
          :value="true"
          color="dark"
          hide-details
        />
      </v-card-text>
      <v-card-text class="d-flex">
        <span
          class="d-flex mx-3"
          style="flex-grow: 1"
        >
          <v-btn
            color="primary"
            width="100%"
            @click="changePassWd"
            >修改密码</v-btn
          >
        </span>
        <span
          class="d-flex mx-3"
          style="flex-grow: 1"
        >
          <v-btn
            color="error"
            width="100%"
            @click="logout"
            >退出登录</v-btn
          >
        </span>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import { User } from '@/models/user'
import { convertDate } from '@/utils/utils'
import UserStore from '@/store/modules/UserStore'
import BaseView from '@/mixins/BaseView.vue'
import LocalStorageStore from '@/store/modules/LocalStorageStore'
import TagInput from '@/components/input/TagInput.vue'
import TagStore from '@/store/modules/TagStore'

@Component({
  components: { TagInput }
})
export default class MePage extends BaseView {
  profile: User | null = null
  joinedTimeDisplayMsg: string

  get showNSFW() {
    return UserStore.showNSFW
  }

  set showNSFW(v) {
    UserStore.setShowNSFW(v)
  }

  get blockedTags() {
    return TagStore.blockedTags
  }

  set blockedTags(v) {
    TagStore.setBlockedTags(v)
  }

  get darkModeLabel(): string {
    return this.$vuetify.theme.dark ? '夜间模式开启' : '夜间模式关闭'
  }

  getUserInfo(): void {
    if (!UserStore.user) throw new Error('User Not Found!')
    this.profile = UserStore.user
    this.joinedTimeDisplayMsg = convertDate(UserStore.user.joinedTime)
  }

  logout(): void {
    LocalStorageStore.clear()
    UserStore.clear()
    this.$router.push('/login')
  }

  changePassWd(): void {
    this.$router.push('/changepassword')
  }

  onPreloaded() {
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
