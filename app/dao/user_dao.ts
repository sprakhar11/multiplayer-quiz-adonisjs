import db from '@adonisjs/lucid/services/db'
import joinjsModule from 'join-js'
import { allUserMaps } from '#result_maps/user_maps'
import type { User, UserPublic } from '#types/user'

const joinjs = joinjsModule.default || joinjsModule

export default class UserDao {
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.rawQuery(
      'SELECT id, full_name, email, password, role, created_at, updated_at FROM users WHERE email = ?',
      [email]
    )
    const mapped = joinjs.map(result.rows, allUserMaps, 'userMap', '')
    return mapped.length > 0 ? (mapped[0] as User) : null
  }

  async findById(id: number): Promise<User | null> {
    const result = await db.rawQuery(
      'SELECT id, full_name, email, password, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    )
    const mapped = joinjs.map(result.rows, allUserMaps, 'userMap', '')
    return mapped.length > 0 ? (mapped[0] as User) : null
  }

  async findPublicById(id: number): Promise<UserPublic | null> {
    const result = await db.rawQuery(
      'SELECT id, full_name, email, role, created_at FROM users WHERE id = ?',
      [id]
    )
    const mapped = joinjs.map(result.rows, allUserMaps, 'userPublicMap', '')
    return mapped.length > 0 ? (mapped[0] as UserPublic) : null
  }

  async create(fullName: string, email: string, hashedPassword: string): Promise<User> {
    const result = await db.rawQuery(
      `INSERT INTO users (full_name, email, password)
       VALUES (?, ?, ?)
       RETURNING id, full_name, email, password, role, created_at, updated_at`,
      [fullName, email, hashedPassword]
    )
    const mapped = joinjs.map(result.rows, allUserMaps, 'userMap', '')
    return mapped[0] as User
  }

  async saveRefreshToken(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
    await db.rawQuery(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES (?, ?, ?)`,
      [userId, tokenHash, expiresAt]
    )
  }

  async findRefreshToken(tokenHash: string): Promise<{ id: number; user_id: number; is_revoked: boolean; expires_at: string } | null> {
    const result = await db.rawQuery(
      'SELECT id, user_id, is_revoked, expires_at FROM refresh_tokens WHERE token_hash = ?',
      [tokenHash]
    )
    return result.rows.length > 0 ? result.rows[0] : null
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await db.rawQuery(
      'UPDATE refresh_tokens SET is_revoked = TRUE WHERE token_hash = ?',
      [tokenHash]
    )
  }

  async revokeAllUserRefreshTokens(userId: number): Promise<void> {
    await db.rawQuery(
      'UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = ? AND is_revoked = FALSE',
      [userId]
    )
  }

  async updateName(id: number, fullName: string): Promise<UserPublic | null> {
    const result = await db.rawQuery(
      `UPDATE users SET full_name = ?, updated_at = NOW()
       WHERE id = ?
       RETURNING id, full_name, email, role, created_at`,
      [fullName, id]
    )
    const mapped = joinjs.map(result.rows, allUserMaps, 'userPublicMap', '')
    return mapped.length > 0 ? (mapped[0] as UserPublic) : null
  }
}
