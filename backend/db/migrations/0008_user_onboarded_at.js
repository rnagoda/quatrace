// Track onboarding completion. A user with onboarded_at set has provisioned their
// workspace (personal project, NPC team, etc.) and skips the onboarding wizard.

export async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.timestamp('onboarded_at', { useTz: true });
  });
}

export async function down(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('onboarded_at');
  });
}
