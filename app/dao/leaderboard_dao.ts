import db from '@adonisjs/lucid/services/db'

export default class LeaderboardDao {
  // get top players aggregated from completed sessions
  async getTopPlayers(limit: number = 50) {
    const result = await db.rawQuery(
      `SELECT
        u.id as user_id,
        u.full_name,
        COALESCE(SUM(sp.score), 0) as total_score,
        COUNT(DISTINCT sp.session_id) as games_played,
        COUNT(DISTINCT CASE WHEN sp.rank = 1 THEN sp.session_id END) as games_won
      FROM users u
        INNER JOIN session_players sp ON u.id = sp.user_id
        INNER JOIN quiz_sessions qs ON sp.session_id = qs.id
      WHERE qs.status = 'completed'
        AND qs.delete_info IS NULL
      GROUP BY u.id, u.full_name
      ORDER BY total_score DESC, games_won DESC
      LIMIT ?`,
      [limit]
    )
    return result.rows
  }
}
