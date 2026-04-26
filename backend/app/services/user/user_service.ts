import UserDao from '#dao/user_dao'
import env from '#start/env'
import type { UserPublic } from '#types/user'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'

const UPLOADS_DIR = join(process.cwd(), 'storage', 'uploads')

export default class UserService {
  private userDao: UserDao

  constructor() {
    this.userDao = new UserDao()
  }

  async getProfile(userId: number): Promise<UserPublic> {
    const user = await this.userDao.findPublicById(userId)
    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }
    return this.addPictureUrl(user)
  }

  async updateProfile(userId: number, fullName: string): Promise<UserPublic> {
    const user = await this.userDao.updateName(userId, fullName)
    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }
    return this.addPictureUrl(user)
  }

  async updateProfilePicture(userId: number, filename: string): Promise<string> {
    const { old_picture } = await this.userDao.updateProfilePicture(userId, filename)

    // delete old file if it exists
    if (old_picture) {
      try {
        await unlink(join(UPLOADS_DIR, old_picture))
      } catch {
        // old file might already be gone, that's fine
      }
    }

    return this.buildPictureUrl(filename)!
  }

  // replace raw profile_picture filename with a full url
  private addPictureUrl(user: UserPublic): UserPublic {
    const url = this.buildPictureUrl(user.profile_picture)
    const { profile_picture, ...rest } = user
    return { ...rest, profile_picture: profile_picture, profile_picture_url: url }
  }

  private buildPictureUrl(filename: string | null): string | null {
    if (!filename) return null
    const appUrl = env.get('APP_URL')
    return `${appUrl}/uploads/${filename}`
  }
}
