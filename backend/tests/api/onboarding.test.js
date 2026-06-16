import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { db } from '../../src/config/db.js';

const PASSWORD = 'Password123';
let seq = 0;

function uniqueEmail() {
  seq += 1;
  return `onboard_${Date.now()}_${seq}@example.test`;
}

async function registerFresh() {
  const res = await request(app).post('/api/auth/register').send({
    email: uniqueEmail(),
    password: PASSWORD,
    first_name: 'Onboard',
    last_name: 'User',
  });
  return { token: res.body.data.accessToken, user: res.body.data.user };
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });

afterAll(async () => {
  // Each registration names its org "Onboard's Organization"; deleting cascades
  // to the seeded NPCs, projects, environments, and builds.
  await db('organizations').where('name', 'like', 'Onboard%').del();
  await db.destroy();
});

describe('POST /api/onboarding', () => {
  it('should provision the workspace and mark the learner onboarded', async () => {
    const { token, user } = await registerFresh();

    const res = await request(app)
      .post('/api/onboarding')
      .set(auth(token))
      .send({ project_type: 'web' });

    expect(res.status).toBe(201);
    expect(res.body.data.team).toHaveLength(5);
    expect(res.body.data.siblingProjects).toHaveLength(2);
    expect(res.body.data.project.name).toMatch(/Web Application/);
    expect(res.body.data.project.project_type).toBe('web');

    const projectId = res.body.data.project.id;

    const npcs = await db('users')
      .where({ organization_id: user.organization_id, is_npc: true })
      .count('* as c')
      .first();
    expect(Number(npcs.c)).toBe(5);

    expect(await db('environments').where({ project_id: projectId })).toHaveLength(3);
    expect((await db('builds').where({ project_id: projectId })).length).toBeGreaterThanOrEqual(3);
    expect((await db('defects').where({ project_id: projectId })).length).toBeGreaterThanOrEqual(6);

    const me = await db('users').where({ id: user.id }).first();
    expect(me.onboarded_at).not.toBeNull();

    const membership = await db('project_members')
      .where({ project_id: projectId, user_id: user.id })
      .first();
    expect(membership.is_active_project).toBe(true);
  });

  it('should return 409 when onboarding a second time', async () => {
    const { token } = await registerFresh();
    await request(app).post('/api/onboarding').set(auth(token)).send({ project_type: 'mobile' });
    const second = await request(app)
      .post('/api/onboarding')
      .set(auth(token))
      .send({ project_type: 'mobile' });
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('CONFLICT');
  });

  it('should return 400 for an invalid project type', async () => {
    const { token } = await registerFresh();
    const res = await request(app)
      .post('/api/onboarding')
      .set(auth(token))
      .send({ project_type: 'spaceship' });
    expect(res.status).toBe(400);
  });

  it('should return 401 without a token', async () => {
    const res = await request(app).post('/api/onboarding').send({ project_type: 'web' });
    expect(res.status).toBe(401);
  });
});
