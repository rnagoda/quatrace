// Test management: suites, cases, runs, and per-case results. Steps are an ordered
// JSONB array; tags are a text[]. Run history is preserved (suite delete is
// restricted while runs exist); pass rate is computed, not stored.

export async function up(knex) {
  await knex.schema.createTable('test_suites', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.text('name').notNullable();
    table.text('description');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('project_id');
  });
  await knex.raw(
    'CREATE TRIGGER test_suites_set_updated_at BEFORE UPDATE ON test_suites ' +
      'FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
  );

  await knex.schema.createTable('test_cases', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    // project_id is denormalized (derivable via suite) to simplify project-scoped
    // queries and the per-plan test-case limit count.
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.uuid('suite_id').notNullable().references('id').inTable('test_suites').onDelete('CASCADE');
    table.text('title').notNullable();
    table.text('description');
    table.text('preconditions');
    table.jsonb('steps').notNullable().defaultTo(knex.raw("'[]'::jsonb"));
    table.text('expected_result');
    table
      .text('priority')
      .notNullable()
      .defaultTo('medium')
      .checkIn(['high', 'medium', 'low'], 'test_cases_priority_check');
    table
      .text('status')
      .notNullable()
      .defaultTo('active')
      .checkIn(['active', 'draft', 'deprecated'], 'test_cases_status_check');
    table.specificType('tags', 'text[]').notNullable().defaultTo(knex.raw("'{}'::text[]"));
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('suite_id');
    table.index('project_id');
    table.index('status');
  });
  await knex.raw(
    'CREATE TRIGGER test_cases_set_updated_at BEFORE UPDATE ON test_cases ' +
      'FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
  );

  await knex.schema.createTable('test_runs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.uuid('suite_id').notNullable().references('id').inTable('test_suites').onDelete('RESTRICT');
    table.uuid('environment_id').references('id').inTable('environments').onDelete('SET NULL');
    table.uuid('build_id').references('id').inTable('builds').onDelete('SET NULL');
    table.text('name').notNullable();
    table
      .text('status')
      .notNullable()
      .defaultTo('planned')
      .checkIn(['planned', 'in_progress', 'completed', 'aborted'], 'test_runs_status_check');
    table.timestamp('started_at', { useTz: true });
    table.timestamp('completed_at', { useTz: true });
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('project_id');
    table.index('suite_id');
    table.index('status');
  });
  await knex.raw(
    'CREATE TRIGGER test_runs_set_updated_at BEFORE UPDATE ON test_runs ' +
      'FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
  );

  await knex.schema.createTable('test_run_results', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('test_run_id')
      .notNullable()
      .references('id')
      .inTable('test_runs')
      .onDelete('CASCADE');
    table
      .uuid('test_case_id')
      .notNullable()
      .references('id')
      .inTable('test_cases')
      .onDelete('CASCADE');
    table
      .text('result')
      .notNullable()
      .defaultTo('not_run')
      .checkIn(['pass', 'fail', 'blocked', 'skipped', 'not_run'], 'test_run_results_result_check');
    table.text('notes');
    table.uuid('recorded_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('recorded_at', { useTz: true });
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.unique(['test_run_id', 'test_case_id']);
    table.index('test_run_id');
    table.index('test_case_id');
  });
  await knex.raw(
    'CREATE TRIGGER test_run_results_set_updated_at BEFORE UPDATE ON test_run_results ' +
      'FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
  );
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('test_run_results');
  await knex.schema.dropTableIfExists('test_runs');
  await knex.schema.dropTableIfExists('test_cases');
  await knex.schema.dropTableIfExists('test_suites');
}
