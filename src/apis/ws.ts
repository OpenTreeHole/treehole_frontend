import { camelizeKeys } from '@/utils/utils'
import { EventBus } from '@/event-bus'
import WsMessage, { parseMessage } from '@/models/websocket/WsMessage'
import FDUHoleFEConfig from '@/opentreehole-fe.config'
import Cookies from 'js-cookie'

export class WsClient {
  ws: WebSocket | null = null
  unhandledMessages: string[] = []
  api: string

  constructor(api: string) {
    this.api = api
  }

  isConnecting(): boolean {
    if (!this.ws) return false
    return this.ws.readyState === WebSocket.CONNECTING
  }

  isConnected(): boolean {
    if (!this.ws) return false
    return this.ws.readyState === WebSocket.OPEN
  }

  connect() {
    const token = Cookies.get('access')
    if (!token) {
      throw new Error('No Token!')
    }

    this.ws = new WebSocket(`${this.api}?token=${token}`)
    this.ws.onmessage = (e: MessageEvent) => this.onMessage(e)
    this.ws.onopen = () => this.onOpen()
    this.ws.onerror = () => this.onError()
    this.ws.onclose = () => this.onClose()
  }

  send(msg: string) {
    if (!this.ws) this.unhandledMessages.push(msg)
    else {
      this.ws.send(msg)
    }
  }

  sendAction(action: any) {
    this.send(JSON.stringify(action))
  }

  onOpen() {
    if (this.unhandledMessages.length > 0) {
      this.unhandledMessages.forEach((m) => {
        this.ws!.send(m)
      })
      this.unhandledMessages = []
    }
  }

  onError() {}

  onClose() {
    this.ws = null
  }

  onMessage(e: MessageEvent) {
    const raw = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
    const msg: WsMessage | null = parseMessage(camelizeKeys(raw))
    if (msg) {
      EventBus.$emit('receive-ws-message', msg)
    }
  }
}

export default new WsClient(FDUHoleFEConfig.backEndWebsocketNotificationApi)
