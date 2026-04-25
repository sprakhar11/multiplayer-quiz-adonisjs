import LeaderboardDao from '#dao/leaderboard_dao'
import type { LeaderboardEntry } from '#types/leaderboard'

// simple in-memory cache to avoid hitting db on every request
let cache: LeaderboardEntry[] | null = null
let cacheExpiry: number = 0
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export default class LeaderboardService {
  private leaderboardDao: LeaderboardDao

  constructor() {
    this.leaderboardDao = new LeaderboardDao()
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    // return cached data if still fresh
    if (cache && Date.now() < cacheExpiry) {
      return cache
    }

    const rows = await this.leaderboardDao.getTopPlayers(50)

    const leaderboard: LeaderboardEntry[] = rows.map((row: any, index: number) => {
      const gamesPlayed = Number.parseInt(row.games_played)
      const gamesWon = Number.parseInt(row.games_won)
      return {
        rank: index + 1,
        user_id: row.user_id,
        full_name: row.full_name,
        total_score: Number.parseInt(row.total_score),
        games_played: gamesPlayed,
        games_won: gamesWon,
        win_rate: gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0,
      }
    })

    // update cache
    cache = leaderboard
    cacheExpiry = Date.now() + CACHE_TTL_MS

    return leaderboard
  }
}
