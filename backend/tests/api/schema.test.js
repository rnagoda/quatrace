import { describe, it, expect, afterAll } from 'vitest';
import { db } from '../../src/config/db.js';

afterAll(async () => {
  await db.destroy();
});

const EXPECTED_TABLES = [
  'plans',
  'organizations',
  'users',
  'refresh_tokens',
  'projects',
  'project_members',
  'environments',
  'builds',
  'defects',
  'defect_comments',
  'defect_attachments',
  'test_suites',
  'test_cases',
  'test_runs',
  'test_run_results',
];

// Build the minimal valid object graph inside a transaction. The caller rolls the
// transaction back, so these helpers never pollute the test database.
async function makeProject(trx) {
  const [org] = await trx('organizations').insert({ name: 'Schema Test Org' }).returning('id');
  const [project] = await trx('projects')
    .insert({ organization_id: org.id, name: 'Schema Test Project' })
    .returning('id');
  return { orgId: org.id, projectId: project.id };
}

describe('core schema', () => {
  it('should have created every expected table when migrated', async () => {
    const rows = await db('information_schema.tables')
      .where({ table_schema: 'public', table_type: 'BASE TABLE' })
      .pluck('table_name');
    const present = new Set(rows);
    for (const table of EXPECTED_TABLES) {
      expect(present.has(table), `missing table: ${table}`).toBe(true);
    }
  });

  it('should seed the three subscription plans as reference data', async () => {
    const tiers = await db('plans').orderBy('tier').pluck('tier');
    expect(tiers).toEqual(['enterprise', 'free', 'pro']);
  });

  it('should reject a defect with an invalid status (CHECK constraint)', async () => {
    const trx = await db.transaction();
    try {
      const { projectId } = await makeProject(trx);
      await expect(
        trx('defects').insert({
          project_id: projectId,
          title: 'bad status',
          status: 'not-a-real-status',
          severity: 'high',
          priority: 'p2',
        }),
      ).rejects.toThrow();
    } finally {
      await trx.rollback();
    }
  });

  it('should cascade-delete comments when their defect is deleted', async () => {
    const trx = await db.transaction();
    try {
      const { projectId } = await makeProject(trx);
      const [defect] = await trx('defects')
        .insert({ project_id: projectId, title: 'd', severity: 'low', priority: 'p3' })
        .returning('id');
      await trx('defect_comments').insert({ defect_id: defect.id, body: 'hi' });

      await trx('defects').where({ id: defect.id }).del();

      const remaining = await trx('defect_comments').where({ defect_id: defect.id });
      expect(remaining).toHaveLength(0);
    } finally {
      await trx.rollback();
    }
  });

  it('should enforce one result per (test_run, test_case) pair (UNIQUE)', async () => {
    const trx = await db.transaction();
    try {
      const { projectId } = await makeProject(trx);
      const [suite] = await trx('test_suites')
        .insert({ project_id: projectId, name: 'S' })
        .returning('id');
      const [testCase] = await trx('test_cases')
        .insert({ project_id: projectId, suite_id: suite.id, title: 'tc' })
        .returning('id');
      const [run] = await trx('test_runs')
        .insert({ project_id: projectId, suite_id: suite.id, name: 'run' })
        .returning('id');

      await trx('test_run_results').insert({ test_run_id: run.id, test_case_id: testCase.id });
      await expect(
        trx('test_run_results').insert({ test_run_id: run.id, test_case_id: testCase.id }),
      ).rejects.toThrow();
    } finally {
      await trx.rollback();
    }
  });
});
