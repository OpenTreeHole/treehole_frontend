import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import { Collection, UserProfile } from '@/models/user'
import { camelizeKeys } from '@/utils/utils'
import { VueInstance } from '@/instance'
import { Division } from '@/models/division'

@Module({ store: store, dynamic: true, name: 'UserStore', namespaced: true })
class UserStore extends VuexModule {
  public collection: Collection = new Collection()
  public divisions: Division[] = []
  public userProfile: UserProfile | null = null

  @Mutation
  public clear () {
    this.collection = new Collection()
    this.divisions = []
  }

  @Mutation
  public setDivisions (divisions: Division[]) {
    this.divisions = divisions
  }

  @Mutation
  public setUserProfile (userProfile: UserProfile) {
    this.userProfile = userProfile
  }

  @Action
  public async requestDivision () {
    const response = await VueInstance.$axios?.get('/divisions')
    const divisions: Division[] = camelizeKeys(response.data)
    this.setDivisions(divisions)
  }

  @Action
  public async requestUserProfile () {
    const response = await VueInstance.$axios?.get('/users')
    this.setUserProfile(camelizeKeys(response.data))
  }
}

const module = getModule(UserStore)
export default module
