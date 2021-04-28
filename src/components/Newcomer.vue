<template>
  <v-dialog v-if="newcomer" v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title> 欢迎来到树洞 </v-card-title>
      <v-card-subtitle class="pt-2"> 玩得开心! </v-card-subtitle>

      <v-card-text>
        <!-- 内容部分 -->
        <ul>
          <li class="first-block">
            这是内部测试版本, 如有 bug 欢迎与开发团队联系
          </li>

          <li class="first-block">
            匿名
            <ul>
              <li>&#8226; 你会以一个随机的匿名ID发帖</li>
              <li>&#8226; 在同一个讨论帖中, 你拥有相同的匿名身份</li>
              <li>
                &#8226; 在后续的版本更新中, 你将可以自由选择是否以匿名身份发帖
              </li>
            </ul>
          </li>

          <li class="first-block">
            安全
            <ul>
              <li>
                &#8226; 你的注册邮箱和密码已使用哈希算法加密,
                即使网站的数据库被攻破也不会有人知道你的密码与真实身份
              </li>
              <li>
                &#8226; 本站服务器位于中国香港特别行政区,
                受当地法律保护。使用本树洞意味着你同意<router-link to="/licence"
                  >相关协议</router-link
                >
              </li>
            </ul>
          </li>

          <li class="first-block">
            友善
            <ul>
              <li>&#8226; 没有人知道你是谁, 所以, 请友善地对待他人</li>
            </ul>
          </li>
        </ul>
      </v-card-text>

      <!-- 关闭对话框 -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="closeDialog"> 关闭 </v-btn>
        <v-btn color="primary" text @click="acceptDialog"> 接受 </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'newcomer',
  data() {
    return {
      newcomer: '',
      dialog: true,
    }
  },
  methods: {
    acceptDialog() {
      this.dialog = false
      localStorage.removeItem('newcomer')
    },
    closeDialog() {
      this.dialog = false
      this.$router.replace('login')
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.newcomer = localStorage.getItem('newcomer')
      },
    },
  },
}
</script>

<style scoped>
.first-block {
  margin-bottom: 0.5rem;
}
</style>
