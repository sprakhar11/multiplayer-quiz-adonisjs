import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(`
      CREATE TABLE questions (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0,
        score_value INTEGER NOT NULL DEFAULT 10,
        delete_info JSONB DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
      CREATE INDEX idx_questions_delete_info ON questions(delete_info) WHERE delete_info IS NULL;
    `)
  }

  async down() {
    this.schema.raw('DROP TABLE IF EXISTS questions;')
  }
}
