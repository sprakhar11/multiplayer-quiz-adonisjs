import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import UserDao from '#dao/user_dao'
import JwtService from '#services/auth/jwt_service'
import type { TokenPair } from '#types/auth'
import type { UserPublic } from '#types/user'

export default class AuthService {
  private userDao: UserDao
  private jwtService: JwtService

  constructor() {
    this.userDao = new UserDao()
    this.jwtService = new JwtService()
  }

  async register(fullName: string, email: string, password: string): Promise<{ user: UserPublic; tokens: TokenPair }> {
    const existing = await this.userDao.findByEmail(email)
    if (existing) {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await this.userDao.create(fullName, email, hashedPassword)

    const tokens = await this.generateAndStoreTokens(user.id, user.email, user.role)

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        profile_picture: user.profile_picture,
        created_at: user.created_at,
      },
      tokens,
    }
  }

  async login(email: string, password: string): Promise<{ user: UserPublic; tokens: TokenPair }> {
    const user = await this.userDao.findByEmail(email)
    if (!user) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const tokens = await this.generateAndStoreTokens(user.id, user.email, user.role)

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        profile_picture: user.profile_picture,
        created_at: user.created_at,
      },
      tokens,
    }
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload
    try {
      payload = this.jwtService.verifyToken(refreshToken)
    } catch {
      throw new Error('INVALID_REFRESH_TOKEN')
    }

    const tokenHash = this.hashToken(refreshToken)
    const storedToken = await this.userDao.findRefreshToken(tokenHash)

    if (!storedToken || storedToken.is_revoked) {
      throw new Error('INVALID_REFRESH_TOKEN')
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      throw new Error('REFRESH_TOKEN_EXPIRED')
    }

    // Revoke old refresh token
    await this.userDao.revokeRefreshToken(tokenHash)

    // Generate new pair
    return this.generateAndStoreTokens(payload.userId, payload.email, payload.role)
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken)
    await this.userDao.revokeRefreshToken(tokenHash)
  }

  private async generateAndStoreTokens(userId: number, email: string, role: 'user' | 'admin'): Promise<TokenPair> {
    const payload = { userId, email, role }
    const accessToken = this.jwtService.generateAccessToken(payload)
    const refreshToken = this.jwtService.generateRefreshToken(payload)

    const tokenHash = this.hashToken(refreshToken)
    const expiresAt = this.jwtService.getRefreshExpiryDate()
    await this.userDao.saveRefreshToken(userId, tokenHash, expiresAt)

    return { accessToken, refreshToken }
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }
}
