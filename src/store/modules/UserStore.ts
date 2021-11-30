import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import { Division } from '@/api/hole'
import { Collection, UserProfile } from '@/api/user'
import { camelizeKeys } from '@/utils'
import UtilStore from '@/store/modules/UtilStore'

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
    await UtilStore.axios?.get('/divisions').then((response) => {
      const divisions: Division[] = camelizeKeys(response.data)
      this.setDivisions(divisions)
    })
  }

  @Action
  public async requestUserProfile () {
    await UtilStore.axios?.get('/users').then((response) => {
      this.setUserProfile(camelizeKeys(response.data))
    })
  }
}

const module = getModule(UserStore)
export default module
