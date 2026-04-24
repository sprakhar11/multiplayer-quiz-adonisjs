import type { HttpContext } from '@adonisjs/core/http'
import SessionService from '#services/game/session_service'
import { startSessionValidator, joinSessionValidator } from '#validators/session_validator'

export default class SessionController {
  private sessionService: SessionService

  constructor() {
    this.sessionService = new SessionService()
  }

  async start({ request, response, user }: HttpContext) {
    const data = await request.validateUsing(startSessionValidator)

    try {
      const result = await this.sessionService.startSession(user!.userId, data.quiz_id, data.mode)
      return response.created(result)
    } catch (error) {
      if (error instanceof Error && error.message === 'QUIZ_NOT_FOUND') {
        return response.notFound({
          message: 'Quiz not found',
          code: 'QUIZ_NOT_FOUND',
        })
      }
      throw error
    }
  }

  async join({ request, response, user, params }: HttpContext) {
    const data = await request.validateUsing(joinSessionValidator)
    const sessionId = Number.parseInt(params.id)

    try {
      const result = await this.sessionService.joinSession(user!.userId, sessionId, data.invite_code)
      return response.ok(result)
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'SESSION_NOT_FOUND':
            return response.notFound({
              message: 'Session not found or invalid invite code',
              code: 'SESSION_NOT_FOUND',
            })
          case 'SESSION_ALREADY_STARTED':
            return response.badRequest({
              message: 'Session has already started',
              code: 'SESSION_ALREADY_STARTED',
            })
          case 'ALREADY_IN_SESSION':
            return response.conflict({
              message: 'You are already in this session',
              code: 'ALREADY_IN_SESSION',
            })
        }
      }
      throw error
    }
  }

  async results({ response, user, params }: HttpContext) {
    const sessionId = Number.parseInt(params.id)

    try {
      const result = await this.sessionService.getResults(user!.userId, sessionId)
      return response.ok(result)
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'SESSION_NOT_FOUND':
            return response.notFound({
              message: 'Session not found',
              code: 'SESSION_NOT_FOUND',
            })
          case 'NOT_A_PARTICIPANT':
            return response.forbidden({
              message: 'You are not a participant of this session',
              code: 'NOT_A_PARTICIPANT',
            })
          case 'SESSION_IN_PROGRESS':
            return response.badRequest({
              message: 'Session is still in progress',
              code: 'SESSION_IN_PROGRESS',
            })
        }
      }
      throw error
    }
  }
}
