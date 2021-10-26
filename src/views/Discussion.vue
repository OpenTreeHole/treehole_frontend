<template>
  <DiscussionCol :wrapped-hole-or-id='computedDiscussionId'/>
</template>

<script lang='ts'>
import { Component } from 'vue-property-decorator'
import DiscussionCol from '@/components/Discussion/DiscussionCol.vue'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'

@Component({
  components: {
    DiscussionCol
  }
})
export default class Discussion extends BaseComponentOrView {
  public get computedDiscussionId (): number {
    return parseInt(this.$route.params.id)
  }
}
</script>

<style lang='scss' scoped>
/* 回复模块 */
.reply {
  margin: 0 1rem 1rem;
  padding: 0.5rem 0.5rem 0 0.5rem;
}

.v-card__text.reply-text {
  margin-top: -1.2rem;
  color: #30312c;
}

/* 可点击 */
.clickable {
  cursor: pointer;
}

/* 浮动按钮 固定在右下角 */
.fixed {
  position: fixed;
  right: 8px;
  bottom: 64px;
}
</style>
