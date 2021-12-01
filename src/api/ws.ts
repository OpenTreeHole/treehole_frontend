import { VueInstance } from '@/instance'
import { camelizeKeys } from '@/utils'
import { WsMessage } from '@/models/WsMessage'
import { EventBus } from '@/event-bus'
import LocalStorageStore from '@/store/modules/LocalStorageStore'

export class WsClient {
  private ws: WebSocket | null = null
  private unhandledMessages: string[] = []

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

  public onOpen () {
    if (this.unhandledMessages.length > 0) {
      this.unhandledMessages.forEach(m => {
        // eslint-disable-next-line no-unused-expressions
        this.ws?.send(m)
      })
      this.unhandledMessages = []
    }
  }

  public onError () {

  }

  public onClose () {
    this.ws = null
  }

  public onMessage (e: MessageEvent) {
    const msg: WsMessage = camelizeKeys(e.data)
    EventBus.$emit('receive-ws-message', msg)
  }
}

export default new WsClient()
