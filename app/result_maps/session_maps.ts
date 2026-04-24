export const sessionResultMap = {
  mapId: 'sessionResultMap',
  idProperty: 'session_id',
  properties: ['quiz_title', 'mode', 'status', 'started_at', 'ended_at'],
  collections: [
    { name: 'players', mapId: 'sessionResultPlayerMap', columnPrefix: 'p_' },
  ],
}

export const sessionResultPlayerMap = {
  mapId: 'sessionResultPlayerMap',
  idProperty: 'user_id',
  properties: ['full_name', 'score', 'rank', 'finished_at', 'correct_count', 'wrong_count', 'total_questions'],
}

export const allSessionMaps = [sessionResultMap, sessionResultPlayerMap]
