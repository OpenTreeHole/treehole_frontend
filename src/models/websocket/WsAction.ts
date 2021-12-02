export default interface WsAction {
  action: string
}

export interface WsReadAction extends WsAction {
  action: 'read'
  id: number
}

export interface WsUnreadAction extends WsAction {
  action: 'unread'
  id: number
}

export interface WsGetAction extends WsAction {
  action: 'get'
  id?: number
  unread?: boolean
}

export interface WsClearAction extends WsAction {
  action: 'clear'
}
