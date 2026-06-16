// Organizations — the top-level billing and access boundary. Each learner gets a
// private org (is_learner_org = true); the global seed populates shared demo orgs.

export async function up(knex) {
  await knex.schema.createTable('organizations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('name').notNullable();
    table
      .text('subscription_tier')
      .notNullable()
      .defaultTo('pro')
      .checkIn(['free', 'pro', 'enterprise'], 'organizations_subscription_tier_check');
    table.boolean('is_learner_org').notNullable().defaultTo(false);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.foreign('subscription_tier').references('tier').inTable('plans').onDelete('RESTRICT');
  });

  await knex.raw(
    'CREATE TRIGGER organizations_set_updated_at BEFORE UPDATE ON organizations ' +
      'FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
  );
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('organizations');
}
