import 'vue-router'
import { RouteConfig } from 'vue-router/types/router'

declare module 'vue-router' {
  interface RouteMeta {
    requireAdmin?: boolean
    requireAuth?: boolean
    hide?: boolean
    icon?: string
    title?: string
    params?: any
    allowBack?: boolean
    children?: RouteConfig[]
  }
}
