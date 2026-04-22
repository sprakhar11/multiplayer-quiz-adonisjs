export interface User {
  id: number
  full_name: string
  email: string
  password: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface UserPublic {
  id: number
  full_name: string
  email: string
  role: 'user' | 'admin'
  created_at: string
}
