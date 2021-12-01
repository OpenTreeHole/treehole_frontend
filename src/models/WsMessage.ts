import { Floor } from '@/api/hole'

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
export interface WsMessage{
  messageId: number
  message: string
  code: string
  data: Floor
  hasRead: boolean
  timeCreated: string
}
