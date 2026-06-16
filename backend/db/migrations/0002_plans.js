// Subscription plan reference data. Drives feature gates (PRD §5.7). The three
// canonical tier rows are inserted here as reference data — distinct from the
// Faker-generated seed data of a later increment. NULL limit = unlimited.

export async function up(knex) {
  await knex.schema.createTable('plans', (table) => {
    table.text('tier').primary().checkIn(['free', 'pro', 'enterprise'], 'plans_tier_check');
    table.integer('projects_limit');
    table.integer('members_limit');
    table.integer('test_cases_limit');
    table.integer('test_runs_per_month_limit');
    table.boolean('api_access').notNullable();
    table.boolean('marketplace').notNullable();
    table.boolean('custom_environments').notNullable();
    table.boolean('audit_log').notNullable();
    table.boolean('priority_support').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(
    'CREATE TRIGGER plans_set_updated_at BEFORE UPDATE ON plans ' +
      'FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
  );

  await knex('plans').insert([
    {
      tier: 'free',
      projects_limit: 2,
      members_limit: 3,
      test_cases_limit: 500,
      test_runs_per_month_limit: 10,
      api_access: false,
      marketplace: false,
      custom_environments: false,
      audit_log: false,
      priority_support: false,
    },
    {
      tier: 'pro',
      projects_limit: 20,
      members_limit: 25,
      test_cases_limit: 10000,
      test_runs_per_month_limit: 500,
      api_access: true,
      marketplace: true,
      custom_environments: true,
      audit_log: false,
      priority_support: false,
    },
    {
      tier: 'enterprise',
      projects_limit: null,
      members_limit: null,
      test_cases_limit: null,
      test_runs_per_month_limit: null,
      api_access: true,
      marketplace: true,
      custom_environments: true,
      audit_log: true,
      priority_support: true,
    },
  ]);
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('plans');
}
