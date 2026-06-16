import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { db } from '../../src/config/db.js';
import { createOrg, createUser, cleanup } from '../helpers/factory.js';

const auth = (token) => ({ Authorization: `Bearer ${token}` });

function createProject(token, body = {}) {
  return request(app)
    .post('/api/projects')
    .set(auth(token))
    .send({ name: 'Project', ...body });
}

// Org A has a manager, tester, and viewer; org B has its own manager (isolation).
let orgA;
let mgrA;
let testerA;
let viewerA;
let mgrB;

beforeAll(async () => {
  orgA = await createOrg();
  mgrA = await createUser({ organizationId: orgA.id, role: 'manager' });
  testerA = await createUser({ organizationId: orgA.id, role: 'tester' });
  viewerA = await createUser({ organizationId: orgA.id, role: 'viewer' });
  mgrB = await createUser({ role: 'manager' }); // its own fresh org
});

afterAll(async () => {
  await cleanup();
  await db.destroy();
});

describe('POST /api/projects', () => {
  it('should create a project as a manager and add the creator as a member', async () => {
    const res = await createProject(mgrA.token, { name: 'Checkout', project_type: 'ecommerce' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Checkout');
    expect(res.body.data.organization_id).toBe(orgA.id);

    const members = await request(app)
      .get(`/api/projects/${res.body.data.id}/members`)
      .set(auth(mgrA.token));
    expect(members.body.data.some((m) => m.user_id === mgrA.user.id)).toBe(true);
  });

  it('should return 403 when a tester tries to create a project', async () => {
    const res = await createProject(testerA.token);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should return 403 when a viewer tries to create a project', async () => {
    expect((await createProject(viewerA.token)).status).toBe(403);
  });

  it('should return 400 when the name is missing', async () => {
    const res = await request(app).post('/api/projects').set(auth(mgrA.token)).send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 401 without a token', async () => {
    expect((await request(app).post('/api/projects').send({ name: 'X' })).status).toBe(401);
  });
});

describe('GET /api/projects', () => {
  it('should list only the caller’s organization projects with pagination meta', async () => {
    const org = await createUser({ role: 'manager' }); // fresh org with a manager
    await createProject(org.token, { name: 'A' });
    await createProject(org.token, { name: 'B' });
    await createProject(org.token, { name: 'C' });

    const page1 = await request(app).get('/api/projects?perPage=2').set(auth(org.token));
    expect(page1.status).toBe(200);
    expect(page1.body.data).toHaveLength(2);
    expect(page1.body.meta).toEqual({ page: 1, perPage: 2, total: 3 });

    const page2 = await request(app).get('/api/projects?perPage=2&page=2').set(auth(org.token));
    expect(page2.body.data).toHaveLength(1);
  });

  it('should not expose another organization’s projects', async () => {
    const a = await createProject(mgrA.token, { name: 'Secret A' });
    const listB = await request(app).get('/api/projects?perPage=100').set(auth(mgrB.token));
    expect(listB.body.data.map((p) => p.id)).not.toContain(a.body.data.id);
  });

  it('should filter by status', async () => {
    const org = await createUser({ role: 'manager' });
    const active = await createProject(org.token, { name: 'Active' });
    const toArchive = await createProject(org.token, { name: 'Old' });
    await request(app)
      .patch(`/api/projects/${toArchive.body.data.id}`)
      .set(auth(org.token))
      .send({ status: 'archived' });

    const res = await request(app).get('/api/projects?status=archived').set(auth(org.token));
    const ids = res.body.data.map((p) => p.id);
    expect(ids).toContain(toArchive.body.data.id);
    expect(ids).not.toContain(active.body.data.id);
  });

  it('should return 401 without a token', async () => {
    expect((await request(app).get('/api/projects')).status).toBe(401);
  });
});

describe('GET /api/projects/:id', () => {
  it('should return a project to an org member (including read-only roles)', async () => {
    const created = await createProject(mgrA.token, { name: 'Readable' });
    const res = await request(app)
      .get(`/api/projects/${created.body.data.id}`)
      .set(auth(viewerA.token));
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(created.body.data.id);
    expect(Array.isArray(res.body.data.members)).toBe(true);
  });

  it('should return 404 for a project in another organization', async () => {
    const created = await createProject(mgrA.token, { name: 'Hidden' });
    const res = await request(app)
      .get(`/api/projects/${created.body.data.id}`)
      .set(auth(mgrB.token));
    expect(res.status).toBe(404);
  });

  it('should return 404 for a nonexistent project', async () => {
    const res = await request(app)
      .get('/api/projects/00000000-0000-0000-0000-000000000000')
      .set(auth(mgrA.token));
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/projects/:id', () => {
  it('should update and archive a project as a manager', async () => {
    const created = await createProject(mgrA.token, { name: 'Renameable' });
    const res = await request(app)
      .patch(`/api/projects/${created.body.data.id}`)
      .set(auth(mgrA.token))
      .send({ name: 'Renamed', status: 'archived' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Renamed');
    expect(res.body.data.status).toBe('archived');
  });

  it('should return 403 when a tester tries to update a project', async () => {
    const created = await createProject(mgrA.token, { name: 'Locked' });
    const res = await request(app)
      .patch(`/api/projects/${created.body.data.id}`)
      .set(auth(testerA.token))
      .send({ name: 'Nope' });
    expect(res.status).toBe(403);
  });

  it('should return 404 when updating a project in another org', async () => {
    const created = await createProject(mgrA.token, { name: 'CrossOrg' });
    const res = await request(app)
      .patch(`/api/projects/${created.body.data.id}`)
      .set(auth(mgrB.token))
      .send({ name: 'Hijack' });
    expect(res.status).toBe(404);
  });
});

describe('project members', () => {
  it('should add and remove a member as a manager', async () => {
    const created = await createProject(mgrA.token, { name: 'Team' });
    const projectId = created.body.data.id;

    const add = await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set(auth(mgrA.token))
      .send({ user_id: testerA.user.id });
    expect(add.status).toBe(201);
    expect(add.body.data.some((m) => m.user_id === testerA.user.id)).toBe(true);

    const remove = await request(app)
      .delete(`/api/projects/${projectId}/members/${testerA.user.id}`)
      .set(auth(mgrA.token));
    expect(remove.status).toBe(200);

    const members = await request(app)
      .get(`/api/projects/${projectId}/members`)
      .set(auth(mgrA.token));
    expect(members.body.data.some((m) => m.user_id === testerA.user.id)).toBe(false);
  });

  it('should return 409 when adding a member twice', async () => {
    const created = await createProject(mgrA.token, { name: 'Dup' });
    const projectId = created.body.data.id;
    await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set(auth(mgrA.token))
      .send({ user_id: viewerA.user.id });
    const dup = await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set(auth(mgrA.token))
      .send({ user_id: viewerA.user.id });
    expect(dup.status).toBe(409);
  });

  it('should return 404 when adding a user from another organization', async () => {
    const created = await createProject(mgrA.token, { name: 'Foreign' });
    const res = await request(app)
      .post(`/api/projects/${created.body.data.id}/members`)
      .set(auth(mgrA.token))
      .send({ user_id: mgrB.user.id });
    expect(res.status).toBe(404);
  });

  it('should return 403 when a tester tries to add a member', async () => {
    const created = await createProject(mgrA.token, { name: 'Guarded' });
    const res = await request(app)
      .post(`/api/projects/${created.body.data.id}/members`)
      .set(auth(testerA.token))
      .send({ user_id: viewerA.user.id });
    expect(res.status).toBe(403);
  });
});
