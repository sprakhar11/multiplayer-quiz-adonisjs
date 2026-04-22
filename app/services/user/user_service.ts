import UserDao from '#dao/user_dao'
import type { UserPublic } from '#types/user'

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
    return user
  }

  async updateProfile(userId: number, fullName: string): Promise<UserPublic> {
    const user = await this.userDao.updateName(userId, fullName)
    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }
    return user
  }
}
