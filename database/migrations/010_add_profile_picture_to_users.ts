import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(`
      ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) DEFAULT NULL;
    `)
  }

  async down() {}
}
