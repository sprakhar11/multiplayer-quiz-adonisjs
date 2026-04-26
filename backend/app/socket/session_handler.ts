import type { Server as SocketServer, Socket } from 'socket.io'
import SessionDao from '#dao/session_dao'
import QuizDao from '#dao/quiz_dao'
import type { JwtPayload } from '#types/auth'
import type { Quiz } from '#types/quiz'
import db from '@adonisjs/lucid/services/db'

// keep track of active session timers so we can clear them if needed
const sessionTimers: Map<number, NodeJS.Timeout> = new Map()

export function registerSessionHandlers(io: SocketServer, socket: Socket) {
  const user = socket.data.user as JwtPayload
  const sessionDao = new SessionDao()
  const quizDao = new QuizDao()

  // player joins a session room after starting or joining via REST
  socket.on('session:join', async (data: { session_id: number }) => {
    try {
      const session = await sessionDao.findSessionById(data.session_id)
      if (!session) {
        return socket.emit('error', { message: 'session not found', code: 'SESSION_NOT_FOUND' })
      }

      const isPlayer = await sessionDao.isPlayerInSession(data.session_id, user.userId)
      if (!isPlayer) {
        return socket.emit('error', { message: 'you are not part of this session', code: 'NOT_A_PARTICIPANT' })
      }

      const roomName = `session_${data.session_id}`
      socket.join(roomName)

      // if session is already in progress (solo mode), schedule the auto-end timer
      if (session.status === 'in_progress' && session.started_at) {
        const questionCount = await sessionDao.getQuizQuestionCount(session.quiz_id)
        const timePerQuestion = await sessionDao.getQuizTimePerQuestion(session.quiz_id)
        const totalDurationMs = timePerQuestion * questionCount * 1000
        const startTime = new Date(session.started_at).getTime()
        const remainingMs = (startTime + totalDurationMs) - Date.now()

        if (remainingMs > 0) {
          scheduleQuizEnd(io, data.session_id, remainingMs, sessionDao)
        }
      }

      // send full player list to everyone in the room
      const players = await sessionDao.getSessionPlayers(data.session_id)
      const playerList = players.map((p) => ({ user_id: p.user_id, full_name: p.full_name }))

      io.to(roomName).emit('player:joined', {
        user_id: user.userId,
        full_name: players.find((p) => p.user_id === user.userId)?.full_name,
        player_count: players.length,
        players: playerList,
      })
    } catch (err) {
      console.error('session:join error', err)
      socket.emit('error', { message: 'something went wrong', code: 'INTERNAL_ERROR' })
    }
  })

  // host begins the quiz (multiplayer only, solo starts immediately via REST)
  socket.on('session:begin', async (data: { session_id: number }) => {
    try {
      const session = await sessionDao.findSessionById(data.session_id)
      if (!session) {
        return socket.emit('error', { message: 'session not found', code: 'SESSION_NOT_FOUND' })
      }

      // only the host can begin
      if (session.host_id !== user.userId) {
        return socket.emit('error', { message: 'only the host can start the quiz', code: 'NOT_HOST' })
      }

      if (session.status !== 'waiting') {
        return socket.emit('error', { message: 'session already started', code: 'SESSION_ALREADY_STARTED' })
      }

      // need at least 2 players for multiplayer
      const players = await sessionDao.getSessionPlayers(data.session_id)
      if (players.length < 2) {
        return socket.emit('error', { message: 'need at least 2 players to start', code: 'NOT_ENOUGH_PLAYERS' })
      }

      // update session to in_progress
      await db.rawQuery(
        'UPDATE quiz_sessions SET status = ?, started_at = NOW() WHERE id = ?',
        ['in_progress', data.session_id]
      )

      // get quiz data to send to all players
      const quizzes = await quizDao.findAll()
      const quiz = quizzes.find((q: Quiz) => q.id === session.quiz_id)

      const questionCount = quiz?.questions.length ?? 0
      const timePerQuestion = quiz?.time_per_question ?? 30
      const totalDurationMs = timePerQuestion * questionCount * 1000

      const startedAt = new Date()
      const endsAt = new Date(startedAt.getTime() + totalDurationMs)

      const roomName = `session_${data.session_id}`
      io.to(roomName).emit('quiz:started', {
        started_at: startedAt.toISOString(),
        ends_at: endsAt.toISOString(),
        questions: quiz?.questions,
      })

      // set a timer to auto-end the quiz when time runs out
      scheduleQuizEnd(io, data.session_id, totalDurationMs, sessionDao)
    } catch (err) {
      console.error('session:begin error', err)
      socket.emit('error', { message: 'something went wrong', code: 'INTERNAL_ERROR' })
    }
  })

  // player submits an answer
  socket.on('answer:submit', async (data: { session_id: number; question_id: number; selected_option_id: number }) => {
    try {
      const session = await sessionDao.findSessionById(data.session_id)
      if (!session) {
        return socket.emit('error', { message: 'session not found', code: 'SESSION_NOT_FOUND' })
      }

      if (session.status !== 'in_progress') {
        return socket.emit('error', { message: 'session is not active', code: 'SESSION_NOT_ACTIVE' })
      }

      // check time hasn't expired
      if (session.started_at) {
        const questionCount = await sessionDao.getQuizQuestionCount(session.quiz_id)
        const timePerQuestion = await sessionDao.getQuizTimePerQuestion(session.quiz_id)
        const totalDurationMs = timePerQuestion * questionCount * 1000
        const startTime = new Date(session.started_at).getTime()
        if (Date.now() > startTime + totalDurationMs) {
          return socket.emit('error', { message: 'time is up', code: 'TIME_EXPIRED' })
        }
      }

      const isPlayer = await sessionDao.isPlayerInSession(data.session_id, user.userId)
      if (!isPlayer) {
        return socket.emit('error', { message: 'you are not part of this session', code: 'NOT_A_PARTICIPANT' })
      }

      // check question belongs to this quiz
      const questionCheck = await db.rawQuery(
        `SELECT q.id
         FROM questions q
         WHERE q.id = ?
           AND q.quiz_id = ?
           AND q.delete_info IS NULL`,
        [data.question_id, session.quiz_id]
      )
      if (questionCheck.rows.length === 0) {
        return socket.emit('error', { message: 'question does not belong to this quiz', code: 'INVALID_QUESTION' })
      }

      // check not already answered
      const alreadyAnswered = await db.rawQuery(
        `SELECT 1 FROM session_answers
         WHERE session_id = ? AND user_id = ? AND question_id = ?`,
        [data.session_id, user.userId, data.question_id]
      )
      if (alreadyAnswered.rows.length > 0) {
        return socket.emit('error', { message: 'already answered this question', code: 'ALREADY_ANSWERED' })
      }

      // check option belongs to this question
      const optionCheck = await db.rawQuery(
        `SELECT is_correct FROM options
         WHERE id = ? AND question_id = ? AND delete_info IS NULL`,
        [data.selected_option_id, data.question_id]
      )
      if (optionCheck.rows.length === 0) {
        return socket.emit('error', { message: 'invalid option for this question', code: 'INVALID_OPTION' })
      }

      const isCorrect = optionCheck.rows[0].is_correct
      const scoreValue = isCorrect ? 10 : 0

      // get the actual score_value from the question
      let scoreAwarded = 0
      if (isCorrect) {
        const qScore = await db.rawQuery(
          'SELECT score_value FROM questions WHERE id = ?',
          [data.question_id]
        )
        scoreAwarded = qScore.rows[0]?.score_value ?? 10
      }

      // record the answer
      await db.rawQuery(
        `INSERT INTO session_answers (session_id, user_id, question_id, selected_option_id, is_correct, score_awarded)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [data.session_id, user.userId, data.question_id, data.selected_option_id, isCorrect, scoreAwarded]
      )

      // update player score
      await db.rawQuery(
        'UPDATE session_players SET score = score + ? WHERE session_id = ? AND user_id = ?',
        [scoreAwarded, data.session_id, user.userId]
      )

      // check if this player answered all questions
      const totalQuestions = await sessionDao.getQuizQuestionCount(session.quiz_id)
      const answeredCount = await db.rawQuery(
        'SELECT COUNT(*) as count FROM session_answers WHERE session_id = ? AND user_id = ?',
        [data.session_id, user.userId]
      )
      const answered = Number.parseInt(answeredCount.rows[0].count)

      if (answered >= totalQuestions) {
        await db.rawQuery(
          'UPDATE session_players SET finished_at = NOW() WHERE session_id = ? AND user_id = ?',
          [data.session_id, user.userId]
        )
      }

      // get updated player info for this player
      const playerInfo = await db.rawQuery(
        'SELECT score FROM session_players WHERE session_id = ? AND user_id = ?',
        [data.session_id, user.userId]
      )

      // send result back to the answering player only
      socket.emit('answer:result', {
        question_id: data.question_id,
        is_correct: isCorrect,
        score_awarded: scoreAwarded,
        total_score: playerInfo.rows[0].score,
        questions_answered: answered,
        questions_remaining: totalQuestions - answered,
      })

      // broadcast score update to everyone in the room
      const roomName = `session_${data.session_id}`
      const players = await sessionDao.getSessionPlayers(data.session_id)
      const currentPlayer = players.find((p) => p.user_id === user.userId)

      io.to(roomName).emit('score:update', {
        user_id: user.userId,
        full_name: currentPlayer?.full_name,
        score: playerInfo.rows[0].score,
        questions_answered: answered,
      })

      // broadcast updated rankings to everyone
      const rankings = players
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score
          // tiebreaker: whoever finished first ranks higher
          if (a.finished_at && b.finished_at) {
            return new Date(a.finished_at).getTime() - new Date(b.finished_at).getTime()
          }
          if (a.finished_at) return -1
          if (b.finished_at) return 1
          return 0
        })
        .map((p, index) => ({
          user_id: p.user_id,
          full_name: p.full_name,
          score: p.score,
          rank: index + 1,
        }))

      io.to(roomName).emit('rank:update', rankings)

      // check if all players are done
      const allFinished = players.every((p) => p.finished_at !== null)
      if (allFinished) {
        await endQuiz(io, data.session_id, sessionDao, 'all players finished')
      }
    } catch (err) {
      console.error('answer:submit error', err)
      socket.emit('error', { message: 'something went wrong', code: 'INTERNAL_ERROR' })
    }
  })

  // when player disconnects, notify the room
  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      if (room.startsWith('session_')) {
        socket.to(room).emit('player:left', {
          user_id: user.userId,
          full_name: user.email, // we only have email from jwt, good enough for now
        })
      }
    }
  })
}

// schedule auto-end when time runs out
function scheduleQuizEnd(io: SocketServer, sessionId: number, durationMs: number, sessionDao: SessionDao) {
  // clear any existing timer for this session
  const existing = sessionTimers.get(sessionId)
  if (existing) clearTimeout(existing)

  const timer = setTimeout(async () => {
    await endQuiz(io, sessionId, sessionDao, 'time expired')
    sessionTimers.delete(sessionId)
  }, durationMs)

  sessionTimers.set(sessionId, timer)
}

// end the quiz, calculate final rankings, broadcast results
async function endQuiz(io: SocketServer, sessionId: number, sessionDao: SessionDao, reason: string) {
  // clear timer if it exists
  const timer = sessionTimers.get(sessionId)
  if (timer) {
    clearTimeout(timer)
    sessionTimers.delete(sessionId)
  }

  // mark session as completed
  await sessionDao.updateSessionStatus(sessionId, 'completed', true)

  // get final player standings
  const players = await sessionDao.getSessionPlayers(sessionId)
  const finalRankings = players
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (a.finished_at && b.finished_at) {
        return new Date(a.finished_at).getTime() - new Date(b.finished_at).getTime()
      }
      if (a.finished_at) return -1
      if (b.finished_at) return 1
      return 0
    })
    .map((p, index) => ({
      user_id: p.user_id,
      full_name: p.full_name,
      score: p.score,
      rank: index + 1,
      finished_at: p.finished_at,
    }))

  // save final ranks to db
  for (const player of finalRankings) {
    await db.rawQuery(
      'UPDATE session_players SET rank = ? WHERE session_id = ? AND user_id = ?',
      [player.rank, sessionId, player.user_id]
    )
  }

  const winner = finalRankings.length > 0 ? finalRankings[0] : null

  const roomName = `session_${sessionId}`
  io.to(roomName).emit('quiz:ended', {
    reason,
    winner: winner ? { user_id: winner.user_id, full_name: winner.full_name, score: winner.score } : null,
    final_rankings: finalRankings,
  })

  console.log(`quiz ended for session ${sessionId}: ${reason}`)
}
