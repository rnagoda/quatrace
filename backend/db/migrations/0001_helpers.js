// Shared schema helpers. The set_updated_at() trigger function keeps updated_at
// current on every UPDATE; later migrations attach it per table.

export async function up(knex) {
  await knex.raw(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
}

export async function down(knex) {
  await knex.raw('DROP FUNCTION IF EXISTS set_updated_at();');
}
