import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(`
      CREATE TYPE session_mode AS ENUM ('solo', 'multiplayer');
      CREATE TYPE session_status AS ENUM ('waiting', 'in_progress', 'completed', 'abandoned');

      CREATE TABLE quiz_sessions (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER NOT NULL REFERENCES quizzes(id),
        host_id INTEGER NOT NULL REFERENCES users(id),
        mode session_mode NOT NULL,
        status session_status NOT NULL DEFAULT 'waiting',
        invite_code VARCHAR(8) UNIQUE,
        started_at TIMESTAMP,
        ended_at TIMESTAMP,
        delete_info JSONB DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_quiz_sessions_quiz_id ON quiz_sessions(quiz_id);
      CREATE INDEX idx_quiz_sessions_host_id ON quiz_sessions(host_id);
      CREATE INDEX idx_quiz_sessions_invite_code ON quiz_sessions(invite_code);
      CREATE INDEX idx_quiz_sessions_status ON quiz_sessions(status);
    `)
  }

  async down() {}
}
