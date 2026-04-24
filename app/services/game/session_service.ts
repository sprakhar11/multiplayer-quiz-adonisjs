import SessionDao from '#dao/session_dao'
import QuizDao from '#dao/quiz_dao'
import type { Session, SessionResult } from '#types/session'
import type { Quiz } from '#types/quiz'
import crypto from 'node:crypto'

export default class SessionService {
  private sessionDao: SessionDao
  private quizDao: QuizDao

  constructor() {
    this.sessionDao = new SessionDao()
    this.quizDao = new QuizDao()
  }

  async startSession(userId: number, quizId: number, mode: 'solo' | 'multiplayer') {
    // Validate quiz exists
    const quizzes = await this.quizDao.findAll()
    const quiz = quizzes.find((q: Quiz) => q.id === quizId)
    if (!quiz) {
      throw new Error('QUIZ_NOT_FOUND')
    }

    const inviteCode = mode === 'multiplayer' ? this.generateInviteCode() : null
    const session = await this.sessionDao.createSession(quizId, userId, mode, inviteCode)
    await this.sessionDao.addPlayer(session.id, userId)

    // Calculate end time
    const questionCount = quiz.questions.length
    const timePerQuestion = quiz.time_per_question
    const totalDurationSeconds = timePerQuestion * questionCount
    let endsAt: string | null = null
    if (session.started_at) {
      const startDate = new Date(session.started_at)
      endsAt = new Date(startDate.getTime() + totalDurationSeconds * 1000).toISOString()
    }

    return {
      session_id: session.id,
      invite_code: session.invite_code,
      mode: session.mode,
      status: session.status,
      started_at: session.started_at,
      ends_at: endsAt,
      quiz,
    }
  }

  async joinSession(userId: number, sessionId: number, inviteCode: string) {
    const session = await this.sessionDao.findSessionById(sessionId)
    if (!session || session.invite_code !== inviteCode) {
      throw new Error('SESSION_NOT_FOUND')
    }

    if (session.status !== 'waiting') {
      throw new Error('SESSION_ALREADY_STARTED')
    }

    const alreadyJoined = await this.sessionDao.isPlayerInSession(sessionId, userId)
    if (alreadyJoined) {
      throw new Error('ALREADY_IN_SESSION')
    }

    await this.sessionDao.addPlayer(sessionId, userId)

    const players = await this.sessionDao.getSessionPlayers(sessionId)

    return {
      session_id: session.id,
      mode: session.mode,
      status: session.status,
      quiz_id: session.quiz_id,
      players: players.map((p) => ({
        user_id: p.user_id,
        full_name: p.full_name,
      })),
    }
  }

  async getResults(userId: number, sessionId: number): Promise<SessionResult> {
    const session = await this.sessionDao.findSessionById(sessionId)
    if (!session) {
      throw new Error('SESSION_NOT_FOUND')
    }

    const isParticipant = await this.sessionDao.isPlayerInSession(sessionId, userId)
    if (!isParticipant) {
      throw new Error('NOT_A_PARTICIPANT')
    }

    // Auto-complete if time expired
    if (session.status === 'in_progress') {
      const isExpired = await this.isSessionExpired(session)
      if (isExpired) {
        await this.completeSession(sessionId)
      } else {
        throw new Error('SESSION_IN_PROGRESS')
      }
    }

    const results = await this.sessionDao.getSessionResults(sessionId)
    if (!results) {
      throw new Error('SESSION_NOT_FOUND')
    }

    // Assign ranks based on score desc, finished_at asc
    results.players.forEach((player, index) => {
      player.rank = index + 1
    })

    return results
  }

  private async isSessionExpired(session: Session): Promise<boolean> {
    if (!session.started_at) return false

    const questionCount = await this.sessionDao.getQuizQuestionCount(session.quiz_id)
    const timePerQuestion = await this.sessionDao.getQuizTimePerQuestion(session.quiz_id)
    const totalDurationMs = timePerQuestion * questionCount * 1000

    const startTime = new Date(session.started_at).getTime()
    const now = Date.now()

    return now > startTime + totalDurationMs
  }

  private async completeSession(sessionId: number): Promise<void> {
    await this.sessionDao.updateSessionStatus(sessionId, 'completed', true)
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let code = ''
    const bytes = crypto.randomBytes(8)
    for (let i = 0; i < 8; i++) {
      code += chars[bytes[i] % chars.length]
    }
    return code
  }
}
