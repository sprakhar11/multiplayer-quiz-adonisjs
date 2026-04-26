import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(`
      CREATE TABLE quizzes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
        time_per_question INTEGER NOT NULL DEFAULT 30,
        delete_info JSONB DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX idx_quizzes_category ON quizzes(category);
      CREATE INDEX idx_quizzes_difficulty ON quizzes(difficulty);
      CREATE INDEX idx_quizzes_delete_info ON quizzes(delete_info) WHERE delete_info IS NULL;
    `)
  }

  async down() {
    this.schema.raw('DROP TABLE IF EXISTS quizzes;')
  }
}
