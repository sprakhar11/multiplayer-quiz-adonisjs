import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '#services/auth/auth_service'
import { registerValidator, loginValidator, refreshValidator, logoutValidator } from '#validators/auth_validator'

export default class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  async register({ request, response }: HttpContext) {
    const data = await request.validateUsing(registerValidator)

    try {
      const result = await this.authService.register(data.full_name, data.email, data.password)
      return response.created({
        status: 'success',
        message: 'User registered successfully',
        data: result,
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
        return response.conflict({
          status: 'error',
          message: 'Email already registered',
          code: 'EMAIL_ALREADY_EXISTS',
        })
      }
      throw error
    }
  }

  async login({ request, response }: HttpContext) {
    const data = await request.validateUsing(loginValidator)

    try {
      const result = await this.authService.login(data.email, data.password)
      return response.ok({
        status: 'success',
        message: 'Login successful',
        data: result,
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
        return response.unauthorized({
          status: 'error',
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        })
      }
      throw error
    }
  }

  async refresh({ request, response }: HttpContext) {
    const data = await request.validateUsing(refreshValidator)

    try {
      const tokens = await this.authService.refresh(data.refresh_token)
      return response.ok({
        status: 'success',
        message: 'Tokens refreshed successfully',
        data: tokens,
      })
    } catch (error) {
      if (error instanceof Error && ['INVALID_REFRESH_TOKEN', 'REFRESH_TOKEN_EXPIRED'].includes(error.message)) {
        return response.unauthorized({
          status: 'error',
          message: 'Invalid or expired refresh token',
          code: error.message,
        })
      }
      throw error
    }
  }

  async logout({ request, response }: HttpContext) {
    const data = await request.validateUsing(logoutValidator)

    await this.authService.logout(data.refresh_token)
    return response.ok({
      status: 'success',
      message: 'Logged out successfully',
    })
  }

  async guest({ response }: HttpContext) {
    const result = this.authService.generateGuestToken()
    return response.ok({
      status: 'success',
      message: 'Guest token generated',
      data: result,
    })
  }
}
