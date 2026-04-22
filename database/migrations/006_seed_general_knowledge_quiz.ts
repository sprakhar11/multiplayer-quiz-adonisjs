import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(`
      -- Insert quiz
      INSERT INTO quizzes (id, title, description, category, difficulty, time_per_question)
      VALUES (1, 'General Knowledge', 'Test your general knowledge with these fun questions!', 'General Knowledge', 'medium', 30);

      -- Question 1
      INSERT INTO questions (id, quiz_id, text, order_index, score_value)
      VALUES (1, 1, 'Which planet is known as the Red Planet?', 1, 10);

      INSERT INTO options (question_id, text, is_correct, order_index) VALUES
      (1, 'Venus', FALSE, 1),
      (1, 'Mars', TRUE, 2),
      (1, 'Jupiter', FALSE, 3),
      (1, 'Saturn', FALSE, 4);

      -- Question 2
      INSERT INTO questions (id, quiz_id, text, order_index, score_value)
      VALUES (2, 1, 'What is the largest ocean on Earth?', 2, 10);

      INSERT INTO options (question_id, text, is_correct, order_index) VALUES
      (2, 'Atlantic Ocean', FALSE, 1),
      (2, 'Indian Ocean', FALSE, 2),
      (2, 'Pacific Ocean', TRUE, 3),
      (2, 'Arctic Ocean', FALSE, 4);

      -- Question 3
      INSERT INTO questions (id, quiz_id, text, order_index, score_value)
      VALUES (3, 1, 'Who painted the Mona Lisa?', 3, 10);

      INSERT INTO options (question_id, text, is_correct, order_index) VALUES
      (3, 'Vincent van Gogh', FALSE, 1),
      (3, 'Pablo Picasso', FALSE, 2),
      (3, 'Leonardo da Vinci', TRUE, 3),
      (3, 'Michelangelo', FALSE, 4);

      -- Question 4
      INSERT INTO questions (id, quiz_id, text, order_index, score_value)
      VALUES (4, 1, 'What is the chemical symbol for Gold?', 4, 10);

      INSERT INTO options (question_id, text, is_correct, order_index) VALUES
      (4, 'Go', FALSE, 1),
      (4, 'Gd', FALSE, 2),
      (4, 'Au', TRUE, 3),
      (4, 'Ag', FALSE, 4);

      -- Question 5
      INSERT INTO questions (id, quiz_id, text, order_index, score_value)
      VALUES (5, 1, 'Which country has the largest population in the world?', 5, 10);

      INSERT INTO options (question_id, text, is_correct, order_index) VALUES
      (5, 'United States', FALSE, 1),
      (5, 'Indonesia', FALSE, 2),
      (5, 'India', TRUE, 3),
      (5, 'China', FALSE, 4);

      -- Reset sequences to avoid conflicts with future inserts
      SELECT setval('quizzes_id_seq', (SELECT MAX(id) FROM quizzes));
      SELECT setval('questions_id_seq', (SELECT MAX(id) FROM questions));
      SELECT setval('options_id_seq', (SELECT MAX(id) FROM options));
    `)
  }

  async down() {}
}
