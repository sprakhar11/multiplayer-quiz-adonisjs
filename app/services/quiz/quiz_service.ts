import QuizDao from '#dao/quiz_dao'
import type { Quiz } from '#types/quiz'

export default class QuizService {
  private quizDao: QuizDao

  constructor() {
    this.quizDao = new QuizDao()
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    return this.quizDao.findAll()
  }
}
