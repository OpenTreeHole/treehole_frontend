export interface IUserAuthData {
  silent: any
  nickname: string
  offenseCount: number
  isAdmin: boolean
}

export interface IUserAuth extends IUserAuthData {
  id: number
  joinedTime: Date | string
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
    this.joinedTime = new Date(user.joinedTime)
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
  startTime: Date | string
  endTime: Date | string
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
    this.endTime = new Date(punishment.endTime)
    this.madeBy = punishment.madeBy
    this.reason = punishment.reason
    this.scope = punishment.scope
    this.startTime = new Date(punishment.startTime)
    this.user = punishment.user
  }
}

export interface IUser {
  userId: number
  nickname: string
  favorites: number[]
  permission: {
    admin: Date | string
    silent: { [key: string]: Date | string }
    offenseCount: number
  }
  config: {
    notify: string[],
    showFolded: boolean
  }
  joinedTime: Date | string
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
    this.permission = {
      admin: new Date(user.permission.admin),
      silent: {},
      offenseCount: user.permission.offenseCount
    }
    for (const key in user.permission.silent) {
      this.permission.silent[key] = new Date(user.permission.silent[key])
    }
    this.config = user.config
    this.joinedTime = new Date(user.joinedTime)
    this.isAdmin = user.isAdmin
  }
}
