import type { HttpContext } from '@adonisjs/core/http'
import UserService from '#services/user/user_service'
import { updateProfileValidator } from '#validators/user_validator'
import app from '@adonisjs/core/services/app'

export default class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  async show({ response, user }: HttpContext) {
    try {
      const profile = await this.userService.getProfile(user!.userId)
      return response.ok(profile)
    } catch (error) {
      if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
        return response.notFound({
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
      return response.ok(profile)
    } catch (error) {
      if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
        return response.notFound({
          message: 'User account no longer exists',
          code: 'USER_NOT_FOUND',
        })
      }
      throw error
    }
  }

  async uploadPicture({ request, response, user }: HttpContext) {
    const picture = request.file('picture', {
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (!picture) {
      return response.badRequest({
        message: 'No picture file provided',
        code: 'NO_FILE',
      })
    }

    if (!picture.isValid) {
      return response.badRequest({
        message: picture.errors[0]?.message || 'Invalid file',
        code: 'INVALID_FILE',
      })
    }

    // save with a unique name: userId_timestamp.ext
    const filename = `${user!.userId}_${Date.now()}.${picture.extname}`
    await picture.move(app.makePath('storage', 'uploads'), { name: filename })

    if (!picture.fileName) {
      return response.internalServerError({
        message: 'Failed to save file',
        code: 'UPLOAD_FAILED',
      })
    }

    try {
      const url = await this.userService.updateProfilePicture(user!.userId, filename)
      return response.ok({ profile_picture_url: url })
    } catch (error) {
      throw error
    }
  }
}
