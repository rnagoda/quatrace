-- Runs once on first container start (Postgres entrypoint).
-- The default `quatrace` database is created via POSTGRES_DB; this adds the
-- isolated database used by the backend API test suite.
CREATE DATABASE quatrace_test OWNER quatrace;
