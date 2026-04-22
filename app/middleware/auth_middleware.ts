import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import JwtService from '#services/auth/jwt_service'
import type { JwtPayload } from '#types/auth'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    user?: JwtPayload
  }
}

export default class AuthMiddleware {
  private jwtService: JwtService

  constructor() {
    this.jwtService = new JwtService()
  }

  async handle(ctx: HttpContext, next: NextFn) {
    const authHeader = ctx.request.header('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ctx.response.unauthorized({
        status: 'error',
        message: 'Missing or invalid authorization header',
        code: 'UNAUTHORIZED',
      })
    }

    const token = authHeader.substring(7)

    try {
      const payload = this.jwtService.verifyToken(token)

      if (payload.role === 'guest') {
        return ctx.response.forbidden({
          status: 'error',
          message: 'Guest users cannot access this resource',
          code: 'GUEST_NOT_ALLOWED',
        })
      }

      ctx.user = payload
      return next()
    } catch {
      return ctx.response.unauthorized({
        status: 'error',
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      })
    }
  }
}
