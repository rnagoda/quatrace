import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { db } from '../../src/config/db.js';
import { createUser, cleanup } from '../helpers/factory.js';

const auth = (token) => ({ Authorization: `Bearer ${token}` });
const validDefect = { title: 'Bug', severity: 'high', priority: 'p2' };

let mgr; // manager + project creator (member)
let tester; // member
let viewer; // member but read-only role
let nonMember; // org member, not a project member
let mgrB; // different org
let projectId;

async function createProject(token, name = 'Defect Project') {
  const res = await request(app).post('/api/projects').set(auth(token)).send({ name });
  return res.body.data.id;
}

async function addMember(token, userId) {
  return request(app)
    .post(`/api/projects/${projectId}/members`)
    .set(auth(token))
    .send({ user_id: userId });
}

function createDefect(token, body = validDefect) {
  return request(app).post(`/api/projects/${projectId}/defects`).set(auth(token)).send(body);
}

beforeAll(async () => {
  mgr = await createUser({ role: 'manager' });
  const orgId = mgr.orgId;
  tester = await createUser({ organizationId: orgId, role: 'tester' });
  viewer = await createUser({ organizationId: orgId, role: 'viewer' });
  nonMember = await createUser({ organizationId: orgId, role: 'tester' });
  mgrB = await createUser({ role: 'manager' });

  projectId = await createProject(mgr.token);
  await addMember(mgr.token, tester.user.id);
  await addMember(mgr.token, viewer.user.id);
});

afterAll(async () => {
  await cleanup();
  await db.destroy();
});

describe('POST /projects/:id/defects', () => {
  it('should let a member create a defect with the caller as reporter', async () => {
    const res = await createDefect(tester.token);
    expect(res.status).toBe(201);
    expect(res.body.data.reporter_id).toBe(tester.user.id);
    expect(res.body.data.status).toBe('new');
  });

  it('should return 403 for a non-member', async () => {
    expect((await createDefect(nonMember.token)).status).toBe(403);
  });

  it('should return 403 for a viewer (read-only role)', async () => {
    expect((await createDefect(viewer.token)).status).toBe(403);
  });

  it('should return 400 when severity is missing', async () => {
    const res = await createDefect(tester.token, { title: 'x', priority: 'p2' });
    expect(res.status).toBe(400);
  });

  it('should return 400 when assigning to a non-member', async () => {
    const res = await createDefect(tester.token, {
      ...validDefect,
      assignee_id: nonMember.user.id,
    });
    expect(res.status).toBe(400);
  });

  it('should return 400 when assigning to a viewer', async () => {
    const res = await createDefect(tester.token, { ...validDefect, assignee_id: viewer.user.id });
    expect(res.status).toBe(400);
  });

  it('should allow assigning to a non-viewer member', async () => {
    const res = await createDefect(tester.token, { ...validDefect, assignee_id: mgr.user.id });
    expect(res.status).toBe(201);
    expect(res.body.data.assignee_id).toBe(mgr.user.id);
  });

  it('should return 401 without a token', async () => {
    expect(
      (await request(app).post(`/api/projects/${projectId}/defects`).send(validDefect)).status,
    ).toBe(401);
  });
});

describe('GET /projects/:id/defects', () => {
  it('should list defects with pagination meta and support a status filter', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/defects?status=new`)
      .set(auth(tester.token));
    expect(res.status).toBe(200);
    expect(res.body.meta).toMatchObject({ page: 1 });
    expect(res.body.data.every((d) => d.status === 'new')).toBe(true);
  });

  it('should be readable by a non-member of the project (org member)', async () => {
    expect(
      (await request(app).get(`/api/projects/${projectId}/defects`).set(auth(nonMember.token)))
        .status,
    ).toBe(200);
  });

  it('should return 404 for a project in another organization', async () => {
    expect(
      (await request(app).get(`/api/projects/${projectId}/defects`).set(auth(mgrB.token))).status,
    ).toBe(404);
  });
});

describe('GET /projects/:id/defects/:defectId', () => {
  it('should return the defect with allowed_transitions and comments', async () => {
    const created = await createDefect(tester.token);
    const res = await request(app)
      .get(`/api/projects/${projectId}/defects/${created.body.data.id}`)
      .set(auth(tester.token));
    expect(res.status).toBe(200);
    expect(res.body.data.allowed_transitions).toEqual(['open']);
    expect(Array.isArray(res.body.data.comments)).toBe(true);
  });

  it('should return 404 for a defect that belongs to another project', async () => {
    const created = await createDefect(tester.token);
    const otherProject = await createProject(mgr.token, 'Other');
    const res = await request(app)
      .get(`/api/projects/${otherProject}/defects/${created.body.data.id}`)
      .set(auth(mgr.token));
    expect(res.status).toBe(404);
  });
});

describe('POST /projects/:id/defects/:defectId/transition', () => {
  async function freshDefectId() {
    return (await createDefect(tester.token)).body.data.id;
  }

  it('should perform a valid transition (new → open)', async () => {
    const id = await freshDefectId();
    const res = await request(app)
      .post(`/api/projects/${projectId}/defects/${id}/transition`)
      .set(auth(tester.token))
      .send({ status: 'open' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('open');
  });

  it('should reject an invalid transition with 422', async () => {
    const id = await freshDefectId();
    const res = await request(app)
      .post(`/api/projects/${projectId}/defects/${id}/transition`)
      .set(auth(tester.token))
      .send({ status: 'resolved' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('INVALID_TRANSITION');
  });

  it('should return 403 for a non-member', async () => {
    const id = await freshDefectId();
    const res = await request(app)
      .post(`/api/projects/${projectId}/defects/${id}/transition`)
      .set(auth(nonMember.token))
      .send({ status: 'open' });
    expect(res.status).toBe(403);
  });
});

describe('PATCH /projects/:id/defects/:defectId', () => {
  it('should let a member update a non-status field', async () => {
    const id = (await createDefect(tester.token)).body.data.id;
    const res = await request(app)
      .patch(`/api/projects/${projectId}/defects/${id}`)
      .set(auth(tester.token))
      .send({ severity: 'low' });
    expect(res.status).toBe(200);
    expect(res.body.data.severity).toBe('low');
  });

  it('should return 403 for a non-member', async () => {
    const id = (await createDefect(tester.token)).body.data.id;
    const res = await request(app)
      .patch(`/api/projects/${projectId}/defects/${id}`)
      .set(auth(nonMember.token))
      .send({ severity: 'low' });
    expect(res.status).toBe(403);
  });
});

describe('defect comments', () => {
  it('should add and list comments as a member', async () => {
    const id = (await createDefect(tester.token)).body.data.id;
    const add = await request(app)
      .post(`/api/projects/${projectId}/defects/${id}/comments`)
      .set(auth(tester.token))
      .send({ body: 'Reproduced on QA.' });
    expect(add.status).toBe(201);
    expect(add.body.data.some((c) => c.body === 'Reproduced on QA.')).toBe(true);

    const list = await request(app)
      .get(`/api/projects/${projectId}/defects/${id}/comments`)
      .set(auth(tester.token));
    expect(list.body.data).toHaveLength(1);
  });

  it('should return 403 when a non-member comments', async () => {
    const id = (await createDefect(tester.token)).body.data.id;
    const res = await request(app)
      .post(`/api/projects/${projectId}/defects/${id}/comments`)
      .set(auth(nonMember.token))
      .send({ body: 'Nope' });
    expect(res.status).toBe(403);
  });

  it('should return 400 for an empty comment body', async () => {
    const id = (await createDefect(tester.token)).body.data.id;
    const res = await request(app)
      .post(`/api/projects/${projectId}/defects/${id}/comments`)
      .set(auth(tester.token))
      .send({ body: '' });
    expect(res.status).toBe(400);
  });
});
