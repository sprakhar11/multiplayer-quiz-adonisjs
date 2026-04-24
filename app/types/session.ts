export interface Session {
  id: number
  quiz_id: number
  host_id: number
  mode: 'solo' | 'multiplayer'
  status: 'waiting' | 'in_progress' | 'completed' | 'abandoned'
  invite_code: string | null
  started_at: string | null
  ended_at: string | null
  created_at: string
}

export interface SessionPlayer {
  id: number
  session_id: number
  user_id: number
  full_name: string
  score: number
  rank: number | null
  finished_at: string | null
  joined_at: string
}

export interface SessionResultPlayer {
  user_id: number
  full_name: string
  score: number
  rank: number
  finished_at: string | null
  correct_count: number
  wrong_count: number
  total_questions: number
}

export interface SessionResult {
  session_id: number
  quiz_title: string
  mode: string
  status: string
  started_at: string
  ended_at: string | null
  players: SessionResultPlayer[]
}
