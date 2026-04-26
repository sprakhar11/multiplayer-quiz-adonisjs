import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(`
      CREATE TABLE session_players (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        score INTEGER NOT NULL DEFAULT 0,
        rank INTEGER,
        finished_at TIMESTAMP,
        joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(session_id, user_id)
      );

      CREATE INDEX idx_session_players_session_id ON session_players(session_id);
      CREATE INDEX idx_session_players_user_id ON session_players(user_id);
    `)
  }

  async down() {}
}
