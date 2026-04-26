import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(`
      CREATE TABLE session_answers (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        question_id INTEGER NOT NULL REFERENCES questions(id),
        selected_option_id INTEGER NOT NULL REFERENCES options(id),
        is_correct BOOLEAN NOT NULL,
        score_awarded INTEGER NOT NULL DEFAULT 0,
        answered_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(session_id, user_id, question_id)
      );

      CREATE INDEX idx_session_answers_session_id ON session_answers(session_id);
      CREATE INDEX idx_session_answers_user_id ON session_answers(user_id);
    `)
  }

  async down() {}
}
