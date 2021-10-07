<template>
  <v-row
    class='py-4'
    v-intersect='{
      handler: onIntersect,
      options: { threshold: [0,0.2] },
    }'
  >
    <v-col class='text-center'>
      <v-progress-linear
        :active='isLoading'
        indeterminate
        absolute
        top
        color='teal'
      >
      </v-progress-linear>

      <div v-if='isLoading'>
        <v-progress-circular indeterminate color='teal'></v-progress-circular>
      </div>
      <div v-if='!hasNext && !isLoading'>没有然后了......</div>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'loading',
  props: ['length', 'loadList'],
  data () {
    return {
      // 加载状态
      hasNext: true,
      isLoading: true
    }
  },
  methods: {
    onIntersect (entries, observer) {
      if (entries[0].isIntersecting) {
        this.load()
      }
      if (entries[0].isIntersecting && entries[0].intersectionRatio >= 0.2) {
        this.$emit('intersectionChange', true)
      } else {
        this.$emit('intersectionChange', false)
      }
    },

    async load () {
      if (!this.hasNext) {
        return
      }
      this.isLoading = true
      const beforeLength = this.length
      await this.loadList()
      const afterLength = this.length
      this.isLoading = false
      if (afterLength < 10) {
        this.hasNext = false
        return
      }
      if (beforeLength === afterLength) {
        this.hasNext = false
        return
      }
      this.hasNext = true
    }
  },

  watch: {
    length () {
      this.isLoading = false
      if (this.length % 10 !== 0) {
        this.hasNext = false
      }
    }
  }
}
</script>
