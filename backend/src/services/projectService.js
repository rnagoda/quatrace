// Project business logic. Org scoping and RBAC are enforced by middleware
// (loadProject, authorize) before these run; this layer owns the data rules.
import { db } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import * as projects from '../models/projectModel.js';
import * as members from '../models/projectMemberModel.js';
import * as users from '../models/userModel.js';

export async function listProjects(orgId, { status, sort, limit, offset }) {
  const [rows, total] = await Promise.all([
    projects.list({ orgId, status, sort, limit, offset }),
    projects.count({ orgId, status }),
  ]);
  return { rows, total };
}

export async function getProject(project, userId) {
  const memberList = await members.listByProject(project.id);
  return {
    ...project,
    members: memberList,
    is_member: memberList.some((m) => m.user_id === userId),
  };
}

export async function createProject(user, { name, description, project_type }) {
  return db.transaction(async (trx) => {
    const project = await projects.insert(
      {
        organization_id: user.organizationId,
        name,
        description: description ?? null,
        project_type: project_type ?? null,
      },
      trx,
    );
    // The creator is automatically a member of the project they create.
    await members.insert({ projectId: project.id, userId: user.id }, trx);
    return project;
  });
}

export function updateProject(project, fields) {
  return projects.update(project.id, fields);
}

export function listMembers(project) {
  return members.listByProject(project.id);
}

export async function addMember(project, userId) {
  const target = await users.findById(userId);
  if (!target || target.organization_id !== project.organization_id) {
    throw AppError.notFound('User not found in this organization.');
  }
  if (await members.findMembership(project.id, userId)) {
    throw AppError.conflict('User is already a member of this project.');
  }
  await members.insert({ projectId: project.id, userId });
  return members.listByProject(project.id);
}

export async function removeMember(project, userId) {
  await members.remove(project.id, userId);
}
