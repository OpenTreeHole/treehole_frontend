<template>
  <v-list-group ref='group' no-action :color="`primary ${$vuetify.theme.dark ? 'lighten-1' : 'darken-2'}`">
    <template #activator>
      <slot
        name='activator'
      />
    </template>

    <slot />
  </v-list-group>
</template>

<script lang='ts'>
import Vue from 'vue'
import { Component, Prop, Ref, Watch } from 'vue-property-decorator'

@Component
export default class AppNavbarListGroup extends Vue {
  @Ref() readonly group: any
  @Prop({ required: true, type: String }) route: string

  public activate (isActive: boolean) {
    this.group.isActive = isActive
  }

  @Watch('$route')
  async routeChanged () {
    await this.$nextTick()
    this.activate(this.$route.path.includes(this.route))
  }

  async mounted () {
    await this.$nextTick()
    await this.$nextTick()
    this.activate(this.$route.path.includes(this.route))
  }
}
</script>

<style scoped>

</style>
