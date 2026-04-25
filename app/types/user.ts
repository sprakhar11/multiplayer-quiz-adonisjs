export interface User {
  id: number
  full_name: string
  email: string
  password: string
  role: 'user' | 'admin'
  profile_picture: string | null
  created_at: string
  updated_at: string
}

export interface UserPublic {
  id: number
  full_name: string
  email: string
  role: 'user' | 'admin'
  profile_picture: string | null
  profile_picture_url?: string | null
  created_at: string
}
