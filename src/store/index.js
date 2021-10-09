import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    message: null
  },
  mutations: {
    setMessageComponent (state, messageInstance) {
      state.message = messageInstance
    }
  },
  actions: {
    messageError (context, str) {
      context.state.message.error(str)
    },
    messageSuccess (context, str) {
      context.state.message.success(str)
    },
    messageInfo (context, str) {
      context.state.message.info(str)
    },
    messageWarning (context, str) {
      context.state.message.warning(str)
    }
  },
  modules: {}
})
