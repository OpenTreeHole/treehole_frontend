<template>
  <v-combobox
    v-model='selectedTags'
    :items='tags'
    item-text='name'
    item-value='name'
    label='标签'
    hint='回车新增标签'
    :rules='tagRules'
    :error-messages='errorMsg'
    :counter='5'
    hide-selected
    clearable
    multiple
  >
    <!-- 自定义标签样式 -->
    <template v-slot:selection='data'>
      <tag-chip
        :tag='data.item'
        @click='selectedTags=selectedTags.filter(v=>v!==data.item)'
      >
        <span class='tag-icon'>
          <v-icon x-small color='red'>mdi-fire</v-icon>
        </span>
        <span class='red--text'>
          {{ data.item.temperature }}
        </span>
      </tag-chip>
    </template>

    <!-- 自定义下拉框样式 -->
    <template v-slot:item='data'>
      <v-list-item-content>
        <span :class="parseTagColor(data.item.name) + '--text'">
          {{ data.item.name }}
          <v-icon color='red' class='tag-icon' small>
            mdi-fire
          </v-icon>
          <span class='tag-count red--text'>
            {{ data.item.temperature }}
          </span>
        </span>
      </v-list-item-content>
    </template>
  </v-combobox>
</template>

<script lang='ts'>
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { Component, ModelSync, Watch } from 'vue-property-decorator'
import TagChip from '@/components/chip/TagChip.vue'
import { ITag } from '@/models/tag'
import UserStore from '@/store/modules/UserStore'
import { parseTagColor } from '@/utils/utils'

@Component({
  components: { TagChip }
})
export default class TagInput extends BaseComponentOrView {
  tagRules = [
    (v: ITag[]) => v.length <= 5 || '标签不能多于5个',
    (v: ITag[]) => v.length >= 1 || '请至少选择1个标签'
  ]

  errorMsg = ''
  parseTagColor = parseTagColor
  @ModelSync('selectedTagsProp', 'change', { default: () => [] }) selectedTags: ITag[]

  get tags () {
    return UserStore.tags
  }

  get coloredTags (): Array<any> {
    return this.tags.map(v => {
      return { ...v, color: parseTagColor(v.name) }
    })
  }

  @Watch('selectedTags')
  selectedTagsChanged () {
    for (let i = 0; i < this.selectedTags.length; i++) {
      if (typeof this.selectedTags[i] === 'string') {
        const tagStr = (this.selectedTags[i] as unknown as string).trim()
        // 校验新增的 tag
        if (tagStr.length > 8) {
          this.errorMsg = '标签不能超过8个字符'
          this.selectedTags.pop()
          break
        } else if (
          this.tags.find(
            (tag) => tag.name.toLowerCase() === tagStr.toLowerCase()
          )
        ) {
          this.errorMsg = '标签不能重复'
          this.selectedTags.pop()
          break
        } else if (tagStr.length === 0) {
          this.errorMsg = '标签不能为空'
          this.selectedTags.pop()
          break
        } else {
          this.errorMsg = ''
          this.selectedTags[i] = {
            name: tagStr,
            temperature: 0,
            tagId: -1
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.tag-icon {
  margin-left: 0.25rem;
}

.tag-count {
  margin-left: -0.25rem;
}
</style>
