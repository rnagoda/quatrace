// Defect business logic. Org scoping (loadProject), the membership write gate
// (requireProjectMembership), and defect loading (loadDefect) run in middleware;
// this layer owns the data rules and the status state-machine.
import { AppError } from '../utils/AppError.js';
import { canTransition, DEFECT_STATUS_TRANSITIONS } from '../domain/enums.js';
import * as defects from '../models/defectModel.js';
import * as comments from '../models/defectCommentModel.js';
import * as environments from '../models/environmentModel.js';
import * as builds from '../models/buildModel.js';
import * as users from '../models/userModel.js';
import { findMembership } from '../models/projectMemberModel.js';

const UPDATABLE_FIELDS = [
  'title',
  'description',
  'severity',
  'priority',
  'assignee_id',
  'environment_id',
  'build_id',
];

// An assignee must be a non-viewer member of the project (PRD §5.2).
async function assertAssignableMember(projectId, userId) {
  const target = await users.findById(userId);
  if (!target) throw AppError.badRequest('Assignee not found.');
  if (target.role === 'viewer') throw AppError.badRequest('A viewer cannot be assigned defects.');
  if (!(await findMembership(projectId, userId))) {
    throw AppError.badRequest('Assignee must be a member of the project.');
  }
}

async function assertBelongsToProject(kind, id, projectId) {
  const model = kind === 'environment' ? environments : builds;
  const row = await model.findById(id);
  if (!row || row.project_id !== projectId) {
    throw AppError.badRequest(`Invalid ${kind} for this project.`);
  }
}

async function validateReferences(projectId, data) {
  if (data.assignee_id) await assertAssignableMember(projectId, data.assignee_id);
  if (data.environment_id) await assertBelongsToProject('environment', data.environment_id, projectId);
  if (data.build_id) await assertBelongsToProject('build', data.build_id, projectId);
}

export async function listDefects(projectId, filters) {
  const [rows, total] = await Promise.all([
    defects.list({ projectId, ...filters }),
    defects.count({ projectId, ...filters }),
  ]);
  return { rows, total };
}

export async function getDefect(defect) {
  const commentList = await comments.listByDefect(defect.id);
  return {
    ...defect,
    comments: commentList,
    allowed_transitions: DEFECT_STATUS_TRANSITIONS[defect.status] || [],
  };
}

export async function createDefect(project, user, data) {
  await validateReferences(project.id, data);
  return defects.insert({
    project_id: project.id,
    title: data.title,
    description: data.description ?? null,
    severity: data.severity,
    priority: data.priority,
    assignee_id: data.assignee_id ?? null,
    reporter_id: user.id,
    environment_id: data.environment_id ?? null,
    build_id: data.build_id ?? null,
  });
}

export async function updateDefect(project, defect, data) {
  await validateReferences(project.id, data);
  const fields = {};
  for (const key of UPDATABLE_FIELDS) {
    if (key in data) fields[key] = data[key];
  }
  return defects.update(defect.id, fields);
}

export async function transitionDefect(defect, toStatus) {
  if (!canTransition(defect.status, toStatus)) {
    throw AppError.invalidTransition(
      `A defect cannot move from "${defect.status}" to "${toStatus}".`,
    );
  }
  return defects.update(defect.id, { status: toStatus });
}

export function listComments(defect) {
  return comments.listByDefect(defect.id);
}

export async function addComment(defect, user, { body, parent_comment_id }) {
  if (parent_comment_id) {
    const parent = await comments.findById(parent_comment_id);
    if (!parent || parent.defect_id !== defect.id) {
      throw AppError.badRequest('Invalid parent comment.');
    }
  }
  await comments.insert({
    defectId: defect.id,
    authorId: user.id,
    body,
    parentCommentId: parent_comment_id ?? null,
  });
  return comments.listByDefect(defect.id);
}
