import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(`
      CREATE TABLE options (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        text VARCHAR(500) NOT NULL,
        is_correct BOOLEAN NOT NULL DEFAULT FALSE,
        order_index INTEGER NOT NULL DEFAULT 0,
        delete_info JSONB DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_options_question_id ON options(question_id);
      CREATE INDEX idx_options_delete_info ON options(delete_info) WHERE delete_info IS NULL;
    `)
  }

  async down() {
    this.schema.raw('DROP TABLE IF EXISTS options;')
  }
}
