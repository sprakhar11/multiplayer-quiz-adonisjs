/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
*/

import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'
import { middleware } from '#start/kernel'
import { createReadStream, existsSync } from 'node:fs'
import { join } from 'node:path'

const AuthController = () => import('#controllers/auth/auth_controller')
const UserController = () => import('#controllers/user/user_controller')
const QuizController = () => import('#controllers/quiz/quiz_controller')
const SessionController = () => import('#controllers/game/session_controller')
const LeaderboardController = () => import('#controllers/leaderboard/leaderboard_controller')

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
    router.post('profile/picture', [UserController, 'uploadPicture'])
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

// Session routes (authenticated)
router
  .group(() => {
    router.post('start', [SessionController, 'start'])
    router.post(':id/join', [SessionController, 'join'])
    router.get(':id/results', [SessionController, 'results'])
  })
  .prefix('/api/sessions')
  .use(middleware.auth())

// leaderboard (authenticated)
router
  .group(() => {
    router.get('/', [LeaderboardController, 'index'])
  })
  .prefix('/api/leaderboard')
  .use(middleware.auth())

// serve uploaded files (public, no auth)
router.get('/uploads/:filename', async ({ params, response }) => {
  const filePath = join(app.makePath('storage', 'uploads'), params.filename)
  if (!existsSync(filePath)) {
    return response.notFound({ message: 'file not found' })
  }
  response.stream(createReadStream(filePath))
})
