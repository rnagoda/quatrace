// Users (real learners + seeded NPCs) and their refresh tokens. Email is unique
// case-insensitively. NPCs carry a persona; real users leave it null.

export async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('organization_id')
      .notNullable()
      .references('id')
      .inTable('organizations')
      .onDelete('CASCADE');
    table.text('email').notNullable();
    table.text('password_hash').notNullable();
    table.text('first_name').notNullable();
    table.text('last_name').notNullable();
    table
      .text('role')
      .notNullable()
      .checkIn(['admin', 'manager', 'developer', 'tester', 'viewer'], 'users_role_check');
    table.boolean('is_npc').notNullable().defaultTo(false);
    table
      .text('npc_persona')
      .checkIn(
        ['product_owner', 'developer', 'qa_lead', 'scrum_master', 'qa_engineer'],
        'users_npc_persona_check',
      );
    table.text('avatar_url');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('organization_id');
  });

  // Case-insensitive uniqueness on email (functional index — raw, not schema-builder).
  await knex.raw('CREATE UNIQUE INDEX users_email_lower_unique ON users (lower(email));');

  await knex.raw(
    'CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users ' +
      'FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
  );

  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.text('token_hash').notNullable().unique();
    table.timestamp('expires_at', { useTz: true }).notNullable();
    table.timestamp('revoked_at', { useTz: true });
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('user_id');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('users');
}
