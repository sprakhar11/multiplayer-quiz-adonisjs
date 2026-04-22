import type { HttpContext } from '@adonisjs/core/http'
import UserService from '#services/user/user_service'
import { updateProfileValidator } from '#validators/user_validator'

export default class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  async show({ response, user }: HttpContext) {
    try {
      const profile = await this.userService.getProfile(user!.userId)
      return response.ok({
        status: 'success',
        data: profile,
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
        return response.notFound({
          status: 'error',
          message: 'User account no longer exists',
          code: 'USER_NOT_FOUND',
        })
      }
      throw error
    }
  }

  async update({ request, response, user }: HttpContext) {
    const data = await request.validateUsing(updateProfileValidator)

    try {
      const profile = await this.userService.updateProfile(user!.userId, data.full_name)
      return response.ok({
        status: 'success',
        message: 'Profile updated successfully',
        data: profile,
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
        return response.notFound({
          status: 'error',
          message: 'User account no longer exists',
          code: 'USER_NOT_FOUND',
        })
      }
      throw error
    }
  }
}
