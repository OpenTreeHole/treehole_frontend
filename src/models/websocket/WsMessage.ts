/**
 * The model for message sent via WebSocket.
 *
 * e.g.
 * {
 *    "message_id": 9,
 *    "message": "你的帖子被修改了",
 *    "code": "modify",
 *    "data": "Floor 对象",
 *    "has_read": false,
 *    "time_created": "2021-10-04T19:34:03.356480+08:00"
 * }
 */
import { checkType } from '@/utils/utils'
import WsNotificationMessage, { checkIWsNotificationMessage } from '@/models/websocket/WsNotificationMessage'

export interface IWsMessage {
  message: string
}

export function checkIWsMessage(message: any): boolean {
  const keys = ['message']
  return checkType(message, keys)
}

export function parseMessage(message: any): WsMessage | null {
  if (checkIWsNotificationMessage(message)) return new WsNotificationMessage(message)
  if (checkIWsMessage(message)) return new WsMessage(message)
  return null
}

export default class WsMessage implements IWsMessage {
  message: string

  constructor(wsMessage: IWsMessage) {
    this.message = wsMessage.message
  }
}
