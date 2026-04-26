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
    'user.upload_picture': { paramsTuple?: []; params?: {} }
    'quiz.index': { paramsTuple?: []; params?: {} }
    'session.start': { paramsTuple?: []; params?: {} }
    'session.join': { paramsTuple?: []; params?: {} }
    'session.results': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leaderboard.index': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'user.show': { paramsTuple?: []; params?: {} }
    'quiz.index': { paramsTuple?: []; params?: {} }
    'session.results': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leaderboard.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'user.show': { paramsTuple?: []; params?: {} }
    'quiz.index': { paramsTuple?: []; params?: {} }
    'session.results': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leaderboard.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.refresh': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.guest': { paramsTuple?: []; params?: {} }
    'user.upload_picture': { paramsTuple?: []; params?: {} }
    'session.start': { paramsTuple?: []; params?: {} }
    'session.join': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'user.update': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}