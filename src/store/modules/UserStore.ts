import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import { User } from '@/models/user'
import { Division } from '@/models/division'
import Vue from 'vue'
import { getUserProfile, listDivisions, listTags } from '@/apis/api'
import { Hole } from '@/models/hole'
import { Tag } from '@/models/tag'

@Module({ store: store, dynamic: true, name: 'UserStore', namespaced: true })
class UserStore extends VuexModule {
  collection: Hole[] = []
  divisions: Division[] = []
  tags: Tag[] = []
  user: User | null = null

  @Mutation
  clear () {
    this.collection = []
    this.divisions = []
    this.tags = []
  }

  @Mutation
  setDivisions (divisions: Division[]) {
    this.divisions = divisions
  }

  @Mutation
  collectionAdd (hole: Hole) {
    this.collection.push(hole)
  }

  @Mutation
  collectionRemove (holeId: number) {
    this.collection = this.collection.filter(v => v.holeId !== holeId)
  }

  @Mutation
  setDivision (payload: {divisionId: number, division: Division}) {
    const index = this.divisions.findIndex(v => v.divisionId === payload.divisionId)
    Vue.set(this.divisions, index, payload.division)
  }

  @Mutation
  setUser (userProfile: User) {
    this.user = userProfile
  }

  @Mutation
  setTags (tags: Tag[]) {
    this.tags = tags
  }

  @Action({ rawError: true })
  async requestDivisions () {
    this.setDivisions(await listDivisions())
  }

  @Action({ rawError: true })
  async requestUser () {
    this.setUser(await getUserProfile())
  }

  @Action({ rawError: true })
  async requestTags () {
    this.setTags(await listTags())
  }
}

const module = getModule(UserStore)
export default module
