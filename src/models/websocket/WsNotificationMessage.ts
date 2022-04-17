import WsMessage, { IWsMessage } from '@/models/websocket/WsMessage'
import { checkType } from '@/utils/utils'
import { IDetailedFloor } from '@/models/floor'

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
  data: IDetailedFloor
  hasRead: boolean
  timeCreated: Date | string
}

export function checkIWsNotificationMessage(message: any): boolean {
  const keys = ['message', 'messageId', 'code', 'data', 'hasRead', 'timeCreated']
  return checkType(message, keys)
}

export default class WsNotificationMessage extends WsMessage implements IWsNotificationMessage {
  code: string
  data: IDetailedFloor
  hasRead: boolean
  messageId: number
  timeCreated: Date

  constructor(msg: IWsNotificationMessage) {
    super(msg)
    this.messageId = msg.messageId
    this.code = msg.code
    this.data = msg.data
    this.hasRead = msg.hasRead
    this.timeCreated = new Date(msg.timeCreated)
  }
}
