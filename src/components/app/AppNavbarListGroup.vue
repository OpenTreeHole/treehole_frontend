<template>
  <v-list-group ref='group' :color="`blue ${isDarkTheme ? 'lighten-1' : 'darken-2'}`" :value='true' no-action>
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

  get isDarkTheme () {
    return this.$vuetify.theme.dark
  }

  public activate (isActive: boolean) {
  }

  @Watch('$route')
  async routeChanged () {
    this.activate(this.$route.path.includes(this.route))
  }

  async mounted () {
    this.activate(this.$route.path.includes(this.route))
  }
}
</script>

<style scoped>

</style>
