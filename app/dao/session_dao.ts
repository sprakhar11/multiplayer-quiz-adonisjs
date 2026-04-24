import db from '@adonisjs/lucid/services/db'
// @ts-ignore - join-js CJS/ESM interop
import joinjsModule from 'join-js'
import { allSessionMaps } from '#result_maps/session_maps'
import type { Session, SessionPlayer, SessionResult } from '#types/session'

const joinjs = (joinjsModule as any).default || joinjsModule

export default class SessionDao {
  async createSession(
    quizId: number,
    hostId: number,
    mode: 'solo' | 'multiplayer',
    inviteCode: string | null
  ): Promise<Session> {
    const startedAt = mode === 'solo' ? 'NOW()' : 'NULL'
    const status = mode === 'solo' ? 'in_progress' : 'waiting'

    const result = await db.rawQuery(
      `INSERT INTO quiz_sessions (quiz_id, host_id, mode, status, invite_code, started_at)
       VALUES (?, ?, ?, ?, ?, ${startedAt})
       RETURNING id, quiz_id, host_id, mode, status, invite_code, started_at, ended_at, created_at`,
      [quizId, hostId, mode, status, inviteCode]
    )
    return result.rows[0] as Session
  }

  async addPlayer(sessionId: number, userId: number): Promise<void> {
    await db.rawQuery(
      `INSERT INTO session_players (session_id, user_id)
       VALUES (?, ?)`,
      [sessionId, userId]
    )
  }

  async findSessionById(sessionId: number): Promise<Session | null> {
    const result = await db.rawQuery(
      `SELECT id, quiz_id, host_id, mode, status, invite_code, started_at, ended_at, created_at
       FROM quiz_sessions
       WHERE id = ?
         AND delete_info IS NULL`,
      [sessionId]
    )
    return result.rows.length > 0 ? (result.rows[0] as Session) : null
  }

  async findSessionByInviteCode(inviteCode: string): Promise<Session | null> {
    const result = await db.rawQuery(
      `SELECT id, quiz_id, host_id, mode, status, invite_code, started_at, ended_at, created_at
       FROM quiz_sessions
       WHERE invite_code = ?
         AND delete_info IS NULL`,
      [inviteCode]
    )
    return result.rows.length > 0 ? (result.rows[0] as Session) : null
  }

  async isPlayerInSession(sessionId: number, userId: number): Promise<boolean> {
    const result = await db.rawQuery(
      `SELECT 1 FROM session_players
       WHERE session_id = ?
         AND user_id = ?`,
      [sessionId, userId]
    )
    return result.rows.length > 0
  }

  async getSessionPlayers(sessionId: number): Promise<SessionPlayer[]> {
    const result = await db.rawQuery(
      `SELECT
        sp.id,
        sp.session_id,
        sp.user_id,
        u.full_name,
        sp.score,
        sp.rank,
        sp.finished_at,
        sp.joined_at
       FROM session_players sp
         INNER JOIN users u ON sp.user_id = u.id
       WHERE sp.session_id = ?
       ORDER BY sp.joined_at`,
      [sessionId]
    )
    return result.rows as SessionPlayer[]
  }

  async getQuizQuestionCount(quizId: number): Promise<number> {
    const result = await db.rawQuery(
      `SELECT COUNT(*) as count
       FROM questions
       WHERE quiz_id = ?
         AND delete_info IS NULL`,
      [quizId]
    )
    return Number.parseInt(result.rows[0].count)
  }

  async getQuizTimePerQuestion(quizId: number): Promise<number> {
    const result = await db.rawQuery(
      `SELECT time_per_question
       FROM quizzes
       WHERE id = ?
         AND delete_info IS NULL`,
      [quizId]
    )
    return result.rows[0]?.time_per_question ?? 30
  }

  async updateSessionStatus(sessionId: number, status: string, endedAt?: boolean): Promise<void> {
    if (endedAt) {
      await db.rawQuery(
        `UPDATE quiz_sessions SET status = ?, ended_at = NOW() WHERE id = ?`,
        [status, sessionId]
      )
    } else {
      await db.rawQuery(
        `UPDATE quiz_sessions SET status = ? WHERE id = ?`,
        [status, sessionId]
      )
    }
  }

  async getSessionResults(sessionId: number): Promise<SessionResult | null> {
    const result = await db.rawQuery(
      `SELECT
        qs.id as session_id,
        q.title as quiz_title,
        qs.mode,
        qs.status,
        qs.started_at,
        qs.ended_at,
        sp.user_id as p_user_id,
        u.full_name as p_full_name,
        sp.score as p_score,
        sp.rank as p_rank,
        sp.finished_at as p_finished_at,
        COALESCE(correct.count, 0) as p_correct_count,
        COALESCE(wrong.count, 0) as p_wrong_count,
        qcount.total as p_total_questions
       FROM quiz_sessions qs
         INNER JOIN quizzes q ON qs.quiz_id = q.id
         INNER JOIN session_players sp ON qs.id = sp.session_id
         INNER JOIN users u ON sp.user_id = u.id
         LEFT JOIN (
           SELECT session_id, user_id, COUNT(*) as count
           FROM session_answers
           WHERE is_correct = TRUE
           GROUP BY session_id, user_id
         ) correct ON correct.session_id = sp.session_id AND correct.user_id = sp.user_id
         LEFT JOIN (
           SELECT session_id, user_id, COUNT(*) as count
           FROM session_answers
           WHERE is_correct = FALSE
           GROUP BY session_id, user_id
         ) wrong ON wrong.session_id = sp.session_id AND wrong.user_id = sp.user_id
         CROSS JOIN (
           SELECT COUNT(*) as total
           FROM questions
           WHERE quiz_id = (SELECT quiz_id FROM quiz_sessions WHERE id = ?)
             AND delete_info IS NULL
         ) qcount
       WHERE qs.id = ?
         AND qs.delete_info IS NULL
       ORDER BY sp.score DESC, sp.finished_at ASC NULLS LAST`,
      [sessionId, sessionId]
    )

    if (result.rows.length === 0) return null

    const mapped = joinjs.map(result.rows, allSessionMaps, 'sessionResultMap', '')
    return mapped[0] as SessionResult
  }
}
