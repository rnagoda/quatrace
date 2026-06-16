// Projects and their direct containers: members, environments, builds.

export async function up(knex) {
  await knex.schema.createTable('projects', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('organization_id')
      .notNullable()
      .references('id')
      .inTable('organizations')
      .onDelete('CASCADE');
    table.text('name').notNullable();
    table.text('description');
    table
      .text('status')
      .notNullable()
      .defaultTo('active')
      .checkIn(['active', 'archived'], 'projects_status_check');
    table
      .text('project_type')
      .checkIn(['mobile', 'web', 'api', 'ecommerce', 'internal'], 'projects_project_type_check');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('organization_id');
    table.index('status');
  });
  await knex.raw(
    'CREATE TRIGGER projects_set_updated_at BEFORE UPDATE ON projects ' +
      'FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
  );

  await knex.schema.createTable('project_members', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.boolean('is_active_project').notNullable().defaultTo(false);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.unique(['project_id', 'user_id']);
    table.index('user_id');
  });

  await knex.schema.createTable('environments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.text('name').notNullable();
    table.boolean('is_default').notNullable().defaultTo(false);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.unique(['project_id', 'name']);
  });
  await knex.raw(
    'CREATE TRIGGER environments_set_updated_at BEFORE UPDATE ON environments ' +
      'FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
  );

  await knex.schema.createTable('builds', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.text('name').notNullable();
    table.text('release_notes');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('project_id');
  });
  await knex.raw(
    'CREATE TRIGGER builds_set_updated_at BEFORE UPDATE ON builds ' +
      'FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
  );
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('builds');
  await knex.schema.dropTableIfExists('environments');
  await knex.schema.dropTableIfExists('project_members');
  await knex.schema.dropTableIfExists('projects');
}
