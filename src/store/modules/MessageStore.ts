import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import Message from '@/components/Message.vue'
import store from '@/store'

@Module({ store: store, dynamic: true, name: 'MessageStore', namespaced: true })
class MessageStore extends VuexModule {
  /**
   * The message instance in the current page.
   */
  public message: Message | null = null

  /**
   * Set the message instance in the current page.
   * <p> Should be called when a new page is created, in order to make the message showed in the correct place. </p>
   * @param messageInstance - the message instance in the current page.
   */
  @Mutation
  public setMessageComponent (messageInstance: Message): void {
    this.message = messageInstance
  }

  /**
   * Display an error message in the Message component.
   * @param str - the message.
   */
  @Action({ rawError: true })
  public messageError (str: string): void {
    if (this.message) this.message.error(str)
  }

  /**
   * Display a success message in the Message component.
   * @param str - the message.
   */
  @Action({ rawError: true })
  public messageSuccess (str: string): void {
    if (this.message) this.message.success(str)
  }

  /**
   * Display a warning message in the Message component.
   * @param str - the message.
   */
  @Action({ rawError: true })
  public messageWarning (str: string): void {
    if (this.message) this.message.warning(str)
  }

  /**
   * Display an info message in the Message component.
   * @param str - the message.
   */
  @Action({ rawError: true })
  public messageInfo (str: string): void {
    if (this.message) this.message.info(str)
  }
}

export default getModule(MessageStore)
