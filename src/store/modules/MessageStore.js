import { __decorate } from "tslib";
import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators';
let MessageStore = class MessageStore extends VuexModule {
    constructor() {
        super(...arguments);
        /**
         * The message instance in the current page.
         */
        this.message = null;
    }
    /**
     * Set the message instance in the current page.
     * <p> Should be called when a new page is created, in order to make the message showed in the correct place. </p>
     * @param messageInstance - the message instance in the current page.
     */
    setMessageComponent(messageInstance) {
        this.message = messageInstance;
    }
    MESSAGE_ERROR(str) {
        if (this.message)
            this.message.error(str);
    }
    MESSAGE_SUCCESS(str) {
        if (this.message)
            this.message.success(str);
    }
    MESSAGE_INFO(str) {
        if (this.message)
            this.message.info(str);
    }
    MESSAGE_WARNING(str) {
        if (this.message)
            this.message.warning(str);
    }
    messageError(str) {
        this.context.commit('MESSAGE_ERROR', str);
    }
    messageSuccess(str) {
        this.context.commit('MESSAGE_SUCCESS', str);
    }
    messageWarning(str) {
        this.context.commit('MESSAGE_WARNING', str);
    }
    messageInfo(str) {
        this.context.commit('MESSAGE_INFO', str);
    }
};
__decorate([
    Mutation
], MessageStore.prototype, "setMessageComponent", null);
__decorate([
    Mutation
], MessageStore.prototype, "MESSAGE_ERROR", null);
__decorate([
    Mutation
], MessageStore.prototype, "MESSAGE_SUCCESS", null);
__decorate([
    Mutation
], MessageStore.prototype, "MESSAGE_INFO", null);
__decorate([
    Mutation
], MessageStore.prototype, "MESSAGE_WARNING", null);
__decorate([
    Action
], MessageStore.prototype, "messageError", null);
__decorate([
    Action
], MessageStore.prototype, "messageSuccess", null);
__decorate([
    Action
], MessageStore.prototype, "messageWarning", null);
__decorate([
    Action
], MessageStore.prototype, "messageInfo", null);
MessageStore = __decorate([
    Module({ namespaced: true })
], MessageStore);
export default MessageStore;
//# sourceMappingURL=message.js.map