/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
*/

import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth/auth_controller')
const UserController = () => import('#controllers/user/user_controller')
const QuizController = () => import('#controllers/quiz/quiz_controller')

// Health check
router.get('/', () => {
  return { app: 'quiz-game', status: 'running' }
})

router.get('/ping', async () => {
  try {
    const result = await db.rawQuery('SELECT NOW() as current_time')
    return {
      status: 'ok',
      database: 'connected',
      time: result.rows[0].current_time,
    }
  } catch (error) {
    return {
      status: 'error',
      database: 'disconnected',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})

// Auth routes (public)
router
  .group(() => {
    router.post('register', [AuthController, 'register'])
    router.post('login', [AuthController, 'login'])
    router.post('refresh', [AuthController, 'refresh'])
    router.post('logout', [AuthController, 'logout'])
    router.post('guest', [AuthController, 'guest'])
  })
  .prefix('/api/auth')

// User routes (authenticated)
router
  .group(() => {
    router.get('profile', [UserController, 'show'])
    router.put('profile', [UserController, 'update'])
  })
  .prefix('/api/users')
  .use(middleware.auth())

// Quiz routes (authenticated)
router
  .group(() => {
    router.get('/', [QuizController, 'index'])
  })
  .prefix('/api/quizzes')
  .use(middleware.auth())
