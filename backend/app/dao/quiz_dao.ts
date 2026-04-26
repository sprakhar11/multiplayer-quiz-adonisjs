import db from '@adonisjs/lucid/services/db'
// @ts-ignore - join-js has CJS/ESM interop issues
import joinjsModule from 'join-js'
import { allQuizMaps } from '#result_maps/quiz_maps'
import type { Quiz } from '#types/quiz'

const joinjs = (joinjsModule as any).default || joinjsModule

export default class QuizDao {
  async findAll(): Promise<Quiz[]> {
    const result = await db.rawQuery(
      `SELECT
        q.id as q_id,
        q.title as q_title,
        q.description as q_description,
        q.category as q_category,
        q.difficulty as q_difficulty,
        q.time_per_question as q_time_per_question,
        q.created_at as q_created_at,
        qu.id as qu_id,
        qu.text as qu_text,
        qu.order_index as qu_order_index,
        qu.score_value as qu_score_value,
        o.id as o_id,
        o.text as o_text,
        o.order_index as o_order_index
      FROM quizzes q
        INNER JOIN questions qu ON q.id = qu.quiz_id
        INNER JOIN options o ON qu.id = o.question_id
      WHERE q.delete_info IS NULL
        AND qu.delete_info IS NULL
        AND o.delete_info IS NULL
      ORDER BY q.id, qu.order_index, o.order_index`
    )

    return joinjs.map(result.rows, allQuizMaps, 'quizDetailMap', 'q_') as Quiz[]
  }
}
