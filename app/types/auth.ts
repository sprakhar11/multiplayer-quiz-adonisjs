export interface JwtPayload {
  userId: number
  email: string
  role: 'user' | 'admin' | 'guest'
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenRow {
  id: number
  user_id: number
  token_hash: string
  expires_at: string
  is_revoked: boolean
  created_at: string
}
