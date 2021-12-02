import { VueInstance } from '@/instance'
import { camelizeKeys } from '@/utils'
import { EventBus } from '@/event-bus'
import LocalStorageStore from '@/store/modules/LocalStorageStore'
import WsMessage, { parseMessage } from '@/models/websocket/WsMessage'

export class WsClient {
  public ws: WebSocket | null = null
  public unhandledMessages: string[] = []

  public isConnecting (): boolean {
    if (!this.ws) return false
    return this.ws.readyState === WebSocket.CONNECTING
  }

  public isConnected (): boolean {
    if (!this.ws) return false
    return this.ws.readyState === WebSocket.OPEN
  }

  public connect () {
    const token = LocalStorageStore.tokenNoPrefix
    if (!token) {
      throw new Error('No Token!')
    }

    this.ws = new WebSocket(`${VueInstance.$feConfig.backEndWebsocketApi}?token=${token}`)
    this.ws.onmessage = this.onMessage
    this.ws.onopen = this.onOpen
    this.ws.onerror = this.onError
    this.ws.onclose = this.onClose
  }

  public send (msg: string) {
    if (!this.ws) this.unhandledMessages.push(msg)
    else this.ws.send(msg)
  }

  public sendAction (action: any) {
    this.send(JSON.stringify(action))
  }

  public onOpen (this: WebSocket) {
    if (VueInstance.$ws.unhandledMessages.length > 0) {
      VueInstance.$ws.unhandledMessages.forEach(m => {
        // eslint-disable-next-line no-unused-expressions
        VueInstance.$ws.ws?.send(m)
      })
      VueInstance.$ws.unhandledMessages = []
    }
  }

  public onError () {

  }

  public onClose (this: WebSocket) {
    VueInstance.$ws.ws = null
  }

  public onMessage (this: WebSocket, e: MessageEvent) {
    const raw = (typeof e.data) === 'string' ? JSON.parse(e.data) : e.data
    const msg: WsMessage | null = parseMessage(camelizeKeys(raw))
    if (msg) {
      EventBus.$emit('receive-ws-message', msg)
    }
  }
}

export default new WsClient()
