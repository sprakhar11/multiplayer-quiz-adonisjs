import type { HttpContext } from '@adonisjs/core/http'
import LeaderboardService from '#services/leaderboard/leaderboard_service'

export default class LeaderboardController {
  private leaderboardService: LeaderboardService

  constructor() {
    this.leaderboardService = new LeaderboardService()
  }

  async index({ response }: HttpContext) {
    const leaderboard = await this.leaderboardService.getLeaderboard()
    return response.ok(leaderboard)
  }
}
