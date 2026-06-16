// Defects and their owned children: threaded comments and simulated attachments.

export async function up(knex) {
  await knex.schema.createTable('defects', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.text('title').notNullable();
    table.text('description');
    table
      .text('status')
      .notNullable()
      .defaultTo('new')
      .checkIn(
        ['new', 'open', 'in_progress', 'in_testing', 'resolved', 'closed', 'wont_fix'],
        'defects_status_check',
      );
    table
      .text('severity')
      .notNullable()
      .checkIn(['critical', 'high', 'medium', 'low'], 'defects_severity_check');
    table
      .text('priority')
      .notNullable()
      .checkIn(['p1', 'p2', 'p3', 'p4'], 'defects_priority_check');
    table.uuid('assignee_id').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('reporter_id').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('environment_id').references('id').inTable('environments').onDelete('SET NULL');
    table.uuid('build_id').references('id').inTable('builds').onDelete('SET NULL');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('project_id');
    table.index('status');
    table.index('assignee_id');
  });
  await knex.raw(
    'CREATE TRIGGER defects_set_updated_at BEFORE UPDATE ON defects ' +
      'FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
  );

  await knex.schema.createTable('defect_comments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('defect_id').notNullable().references('id').inTable('defects').onDelete('CASCADE');
    table.uuid('author_id').references('id').inTable('users').onDelete('SET NULL');
    table
      .uuid('parent_comment_id')
      .references('id')
      .inTable('defect_comments')
      .onDelete('CASCADE');
    table.text('body').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('defect_id');
  });
  await knex.raw(
    'CREATE TRIGGER defect_comments_set_updated_at BEFORE UPDATE ON defect_comments ' +
      'FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
  );

  await knex.schema.createTable('defect_attachments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('defect_id').notNullable().references('id').inTable('defects').onDelete('CASCADE');
    table.text('filename').notNullable();
    table.text('content_type');
    table.integer('size_bytes');
    table.uuid('uploaded_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('defect_id');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('defect_attachments');
  await knex.schema.dropTableIfExists('defect_comments');
  await knex.schema.dropTableIfExists('defects');
}
