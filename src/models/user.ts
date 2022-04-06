export interface IUserAuthData {
  silent: any
  nickname: string
  offenseCount: number
  isAdmin: boolean
}

export interface IUserAuth extends IUserAuthData {
  id: number
  joinedTime: Date
}

export class UserAuth implements IUserAuth {
  id: number
  isAdmin: boolean
  joinedTime: Date
  nickname: string
  offenseCount: number
  silent: any

  constructor (user: IUserAuth) {
    this.id = user.id
    this.isAdmin = user.isAdmin
    this.joinedTime = user.joinedTime
    this.nickname = user.nickname
    this.offenseCount = user.offenseCount
    this.silent = user.silent
  }
}

export interface IPunishment {
  id: number,
  user: {
    id: number
  }
  madeBy: {
    id: number
  }
  reason: string
  scope: string
  startTime: Date
  endTime: Date
}

export class Punishment implements IPunishment {
  endTime: Date
  id: number
  madeBy: { id: number }
  reason: string
  scope: string
  startTime: Date
  user: { id: number }

  constructor (punishment: IPunishment) {
    this.id = punishment.id
    this.endTime = punishment.endTime
    this.madeBy = punishment.madeBy
    this.reason = punishment.reason
    this.scope = punishment.scope
    this.startTime = punishment.startTime
    this.user = punishment.user
  }
}

export interface IUser {
  userId: number
  nickname: string
  favorites: number[]
  permission: {
    admin: Date
    silent: { [key: string]: Date }
    offenseCount: number
  }
  config: {
    notify: string[],
    showFolded: boolean
  }
  joinedTime: Date
  isAdmin: boolean
}

export class User implements IUser {
  config: { notify: string[]; showFolded: boolean }
  favorites: number[]
  isAdmin: boolean
  joinedTime: Date
  nickname: string
  permission: { admin: Date; silent: { [p: string]: Date }; offenseCount: number }
  userId: number

  constructor (user: IUser) {
    this.userId = user.userId
    this.nickname = user.nickname
    this.favorites = user.favorites
    this.permission = user.permission
    this.config = user.config
    this.joinedTime = user.joinedTime
    this.isAdmin = user.isAdmin
  }
}
