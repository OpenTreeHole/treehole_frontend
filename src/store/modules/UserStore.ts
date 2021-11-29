import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import { Division } from '@/api/hole'
import { Collection, UserProfile } from '@/api/user'
import { camelizeKeys } from '@/utils'
import UtilStore from '@/store/modules/UtilStore'

@Module({ store: store, dynamic: true, name: 'UserStore', namespaced: true })
class UserStore extends VuexModule {
  public _collection: Collection = new Collection()
  public _divisions: Division[] = []
  public _userProfile: UserProfile | null = null

  get divisions () {
    return this._divisions
  }

  get collection () {
    return this._collection
  }

  get userProfile () {
    return this._userProfile
  }

  @Mutation
  public clear () {
    this._collection = new Collection()
    this._divisions = []
  }

  @Mutation
  public setDivisions (divisions: Division[]) {
    this._divisions = divisions
  }

  @Mutation
  public setUserProfile (userProfile: UserProfile) {
    this._userProfile = userProfile
  }

  @Action
  public async requestDivision () {
    await UtilStore.axios.get('/divisions').then((response) => {
      const divisions: Division[] = camelizeKeys(response.data)
      this.setDivisions(divisions)
    })
  }

  @Action
  public async requestUserProfile () {
    await UtilStore.axios.get('/users').then((response) => {
      this.setUserProfile(camelizeKeys(response.data))
    })
  }
}

const module = getModule(UserStore)
export default module
