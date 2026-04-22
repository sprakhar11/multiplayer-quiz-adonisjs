/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'

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
