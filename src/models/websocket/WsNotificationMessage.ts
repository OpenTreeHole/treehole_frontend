import { DetailedFloor } from '@/api/hole'
import WsMessage, { IWsMessage } from '@/models/websocket/WsMessage'
import { checkType } from '@/utils'

/**
 * The model for notification message sent via WebSocket.
 *
 * e.g.
 * {
 *    'message': '所有未读消息已清空'
 * }
 */
export interface IWsNotificationMessage extends IWsMessage {
  messageId: number
  code: string
  data: DetailedFloor
  hasRead: boolean
  timeCreated: string
}

export function checkIWsNotificationMessage (message: any): boolean {
  const keys = ['message', 'messageId', 'code', 'data', 'hasRead', 'timeCreated']
  return checkType(message, keys)
}

export default class WsNotificationMessage extends WsMessage implements IWsNotificationMessage {
  code: string
  data: DetailedFloor
  hasRead: boolean
  messageId: number
  timeCreated: string
}