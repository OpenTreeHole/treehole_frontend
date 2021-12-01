import { VueInstance } from '@/instance'

class WsClient {
  public ws: WebSocket | null = null

  public connect () {
    this.ws = new WebSocket(VueInstance.$feConfig)
  }
}
