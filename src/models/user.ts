// noinspection JSUnusedGlobalSymbols

import { WrappedHole } from '@/models/hole'
import Vue from 'vue'
import { VueInstance } from '@/instance'

export interface UserProfile {
  userId: number
  nickname: string
  permission: {
    admin: Date
    silent: Array<any>
  }
  config: {
    showFolded: string
    notify: Array<string>
  }
  joinedTime: Date
  isAdmin: boolean
}

export class Collection {
  public collectionIds: Array<number> = []
  public updateHoleMap = new Map<string, Array<WrappedHole>>()

  public clearCollection () {
    this.collectionIds = []
  }

  public setCollection (collectionIds: Array<number>) {
    this.collectionIds = collectionIds
    this.update()
  }

  public update () {
    for (const value of this.updateHoleMap.values()) {
      for (let i = 0; i < value.length; i++) {
        if (value[i].isStarred !== this.isStarred(value[i].holeId)) {
          Vue.set(value, i, new WrappedHole(value[i]))
        }
      }
    }
  }

  public async getCollections () {
    try {
      const response = await VueInstance.$axios?.get('/user/favorites')
      this.clearCollection()
      response.data.forEach((holeItem: any) => {
        if (!holeItem.floors.first_floor || !holeItem.floors.last_floor || holeItem.reply < 0) return
        this.collectionIds.push(holeItem.hole_id)
      })
      this.update()
    } catch (error) {
      throw new Error(error)
    }
  }

  public isStarred (holeId: number): boolean {
    return this.collectionIds.includes(holeId)
  }

  public registerUpdateHoleArray (name: string, holeArray: Array<WrappedHole>) {
    this.updateHoleMap.set(name, holeArray)
  }

  public unregisterUpdateHoleArray (name: string) {
    this.updateHoleMap.delete(name)
  }
}
