import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import { UserAuth } from '@/models/user'
import { Division } from '@/models/division'
import Vue from 'vue'
import { getCurrentUser, listDivisions } from '@/apis/api'
import { Hole } from '@/models/hole'

@Module({ store: store, dynamic: true, name: 'UserStore', namespaced: true })
class UserStore extends VuexModule {
  public collection: Hole[] = []
  public divisions: Division[] = []
  public user: UserAuth | null = null

  @Mutation
  public clear () {
    this.collection = []
    this.divisions = []
  }

  @Mutation
  public setDivisions (divisions: Division[]) {
    this.divisions = divisions
  }

  @Mutation
  public setDivision (payload: {divisionId: number, division: Division}) {
    const index = this.divisions.findIndex(v => v.divisionId === payload.divisionId)
    Vue.set(this.divisions, index, payload.division)
  }

  @Mutation
  public setUser (userProfile: UserAuth) {
    this.user = userProfile
  }

  @Action
  public async requestDivision () {
    this.setDivisions(await listDivisions())
  }

  @Action
  public async requestUser () {
    this.setUser(await getCurrentUser())
  }
}

const module = getModule(UserStore)
export default module
