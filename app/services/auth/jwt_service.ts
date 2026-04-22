import jwt from 'jsonwebtoken'
import env from '#start/env'
import type { JwtPayload } from '#types/auth'

export default class JwtService {
  private secret: string
  private accessExpiry: string
  private refreshExpiry: string

  constructor() {
    this.secret = env.get('JWT_SECRET')
    this.accessExpiry = '15m'
    this.refreshExpiry = '7d'
  }

  generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.accessExpiry })
  }

  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.refreshExpiry })
  }

  verifyToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, this.secret) as JwtPayload & { iat: number; exp: number }
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
  }

  getRefreshExpiryDate(): Date {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
}
