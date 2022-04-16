import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'

const jwtAxios = axios.create()

export default class JWTManager {
  failedRequestList: AxiosRequestConfig[] = []
  responseList: PromiseSettledResult<AxiosResponse<any>>[] = []
  refreshing = false
  refresh: () => Promise<string>
  needRefresh: (originalError: AxiosError) => boolean
  refreshErrorCallback: (refreshError: AxiosError) => unknown
  interval = 20
  timeout = 10000

  constructor (
    refresh: () => Promise<string>,
    needRefresh: (originalError: AxiosError) => boolean = (originalError: AxiosError) => originalError.response?.status === 401,
    refreshErrorCallback: (refreshError: AxiosError) => void = () => {
    }) {
    this.refresh = refresh
    this.needRefresh = needRefresh
    this.refreshErrorCallback = refreshErrorCallback
  }

  responseErrorInterceptor = async (e: AxiosError) => {
    if (this.needRefresh(e)) {
      this.failedRequestList.push(e.config)
      const id = this.failedRequestList.length - 1
      if (!this.refreshing) {
        this.refreshing = true
        try {
          const authorization = await this.refresh()
          const requestPromises = this.failedRequestList.map((v) => {
            if (v.headers) {
              v.headers.Authorization = 'Bearer ' + authorization
            }
            return jwtAxios.request(v)
          })
          this.failedRequestList = []
          this.responseList = await Promise.allSettled(requestPromises)
          this.refreshing = false
        } catch (refreshError: any) {
          this.responseList = []
          this.refreshing = false
          this.refreshErrorCallback(refreshError)
          return Promise.reject(e)
        }
      } else {
        for (let waitingTime = 0; waitingTime < this.timeout; waitingTime += this.interval) {
          await new Promise((resolve) => setTimeout(resolve, this.interval))
          if (!this.refreshing) break
        }
      }
      if (this.responseList[id]?.status === 'fulfilled') {
        return Promise.resolve((this.responseList[id] as PromiseFulfilledResult<AxiosResponse<any>>).value)
      }
      return Promise.reject(e)
    }
    return Promise.reject(e)
  }
}
