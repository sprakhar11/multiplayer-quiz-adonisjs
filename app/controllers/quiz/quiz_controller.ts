import type { HttpContext } from '@adonisjs/core/http'
import QuizService from '#services/quiz/quiz_service'

export default class QuizController {
  private quizService: QuizService

  constructor() {
    this.quizService = new QuizService()
  }

  async index({ response }: HttpContext) {
    const quizzes = await this.quizService.getAllQuizzes()
    return response.ok(quizzes)
  }
}
