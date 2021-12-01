<template>
  <v-container>
    <v-card>
      <v-card-title>FDU Hole</v-card-title>

      <!-- 以下为本开源项目的版权属名，按照开源协议及《中华人民共和国合同法》您不应该以任何方式修改或移动它，否则 FDUHole-Dev 或将考虑通过法律途径解决问题。 -->
      <v-card-text>
        Made with ❤ by
        <a href='https://github.com/fduhole' target='_blank'>FDUHole-Dev</a>
      </v-card-text>
      <!-- 以上为本开源项目的版权属名，按照开源协议及《中华人民共和国合同法》您不应该以任何方式修改或移动它，否则 FDUHole-Dev 或将考虑通过法律途径解决问题。 -->

      <v-card-text>
        使用 FDU Hole 意味着你同意
        <router-link to='/license'>
          相关协议
        </router-link>
      </v-card-text>
    </v-card>

    <!-- 版本信息 -->
    <v-card>
      <v-card-title>版本信息</v-card-title>
      <v-card-text v-if='!installed'>
        您正在使用网页版 FDU Hole，请<span>安装本应用</span>以获得更好的体验！
      </v-card-text>
      <!-- <v-card-subtitle>前端版本</v-card-subtitle> -->
      <v-card-text>
        当前版本：{{ $feConfig.feVersion }}<br />
        最新版本：{{ latestVersion }} <br />
        {{ updateMsg[updateMsgIndex] }}
      </v-card-text>
      <!-- <v-card-subtitle>后端版本</v-card-subtitle>
      <v-card-text>获取失败</v-card-text> -->
    </v-card>

    <!-- 联系我们 -->
    <v-card>
      <v-card-title>联系我们</v-card-title>
      <v-card-subtitle>项目首页</v-card-subtitle>
      <v-card-text>
        <a :href='$feConfig.feRepository'>{{ $feConfig.feRepository }}</a>
      </v-card-text>

      <v-card-subtitle>团队首页</v-card-subtitle>
      <v-card-text>
        <a :href='$feConfig.teamHomepage'>{{ $feConfig.teamHomepage }}</a>
      </v-card-text>

      <v-card-subtitle>团队邮箱</v-card-subtitle>
      <v-card-text>
        <a :href="'mailto:' + $feConfig.teamMail">
          {{
            $feConfig.teamMail
          }}
        </a>
      </v-card-text>
    </v-card>

    <!-- 友情链接 -->
    <v-card>
      <v-card-title>友情链接</v-card-title>
      <v-card-text>
        <ul>
          <li v-for='(item, i) in $feConfig.friendLinks' :key='i'>
            <a :href='item.link'>{{ item.author }}: {{ item.siteName }}</a>
          </li>
        </ul>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title>
        <!--suppress HtmlUnknownTarget -->
        <a href='/report.html'>
          查看构建报告
        </a>
      </v-card-title>
    </v-card>
  </v-container>
</template>

<script lang='ts'>
import { Component } from 'vue-property-decorator'
import BaseView from '@/mixins/BaseView.vue'

@Component
export default class About extends BaseView {
  public latestVersion = '正在获取'
  public installed =
    window.matchMedia('(display-mode: standalone)').matches

  public updateMsg = [
    '您正在使用开发版，如遇 BUG 请前往 GitHub 提交 Issue 或 Pull Request！',
    '检测到新版本，重载应用以升级！',
    '您正在使用最新版的FDU Hole！'
  ]

  public updateMsgIndex = 2

  public updateUpdateMsgIndex (): number {
    const currentVersion = this.$feConfig.feVersion.split('.')
    const latestVersion = this.latestVersion.split('.')
    if (
      latestVersion[0] < currentVersion[0] ||
      latestVersion[1] < currentVersion[1] ||
      latestVersion[2] < currentVersion[2]
    ) {
      return 0 // 正在使用开发板
    } else if (
      latestVersion[0] > currentVersion[0] ||
      latestVersion[1] > currentVersion[1] ||
      latestVersion[2] > currentVersion[2]
    ) {
      return 1 // 有新版
    } else {
      return 2 // 正在使用最新发布版
    }
  }

  public getLatestVersion (): void {
    this.$axios
      .request({
        url: this.$feConfig.latestReleasePkgJSON,
        transformRequest: [
          (data, headers) => {
            delete headers.Authorization
            return data
          }
        ]
      })
      .then((response) => {
        this.latestVersion = response.data.version
        this.updateMsgIndex = this.updateUpdateMsgIndex()
      })
      .catch((error) => {
        this.latestVersion = '获取失败 ' + error.message
      })
  }

  mounted (): void {
    this.getLatestVersion()
  }
}
</script>

<style scoped>
.v-card {
  margin: 20px;
  padding: 15px;
}
</style>
