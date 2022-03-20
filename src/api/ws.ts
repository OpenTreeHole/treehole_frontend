import { camelizeKeys } from '@/utils/utils'
import { EventBus } from '@/event-bus'
import LocalStorageStore from '@/store/modules/LocalStorageStore'
import WsMessage, { parseMessage } from '@/models/websocket/WsMessage'
import FDUHoleFEConfig from '@/opentreehole-fe.config'

export class WsClient {
  public ws: WebSocket | null = null
  public unhandledMessages: string[] = []
  public api: string

  constructor (api: string) {
    this.api = api
  }

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

    this.ws = new WebSocket(`${this.api}?token=${token}`)
    this.ws.onmessage = (e: MessageEvent) => this.onMessage(e)
    this.ws.onopen = () => this.onOpen()
    this.ws.onerror = () => this.onError()
    this.ws.onclose = () => this.onClose()
  }

  public send (msg: string) {
    if (!this.ws) this.unhandledMessages.push(msg)
    else {
      this.ws.send(msg)
    }
  }

  public sendAction (action: any) {
    this.send(JSON.stringify(action))
  }

  public onOpen () {
    if (this.unhandledMessages.length > 0) {
      this.unhandledMessages.forEach(m => {
        this.ws!.send(m)
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
    const raw = (typeof e.data) === 'string' ? JSON.parse(e.data) : e.data
    const msg: WsMessage | null = parseMessage(camelizeKeys(raw))
    if (msg) {
      EventBus.$emit('receive-ws-message', msg)
    }
  }
}

export default new WsClient(FDUHoleFEConfig.backEndWebsocketNotificationApi)
export const wsImage = new WsClient(FDUHoleFEConfig.backEndWebsocketImageApi)
