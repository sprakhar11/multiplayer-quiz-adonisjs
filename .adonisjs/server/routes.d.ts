import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.refresh': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.guest': { paramsTuple?: []; params?: {} }
    'user.show': { paramsTuple?: []; params?: {} }
    'user.update': { paramsTuple?: []; params?: {} }
    'quiz.index': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'user.show': { paramsTuple?: []; params?: {} }
    'quiz.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'user.show': { paramsTuple?: []; params?: {} }
    'quiz.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.refresh': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.guest': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'user.update': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}