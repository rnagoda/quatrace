// Thin project controllers: parse pagination, call the service, return the envelope.
import * as projectService from '../services/projectService.js';
import { ok } from '../utils/response.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';

export async function list(req, res) {
  const { page, perPage, limit, offset } = parsePagination(req.query);
  const { status, sort } = req.query;
  const { rows, total } = await projectService.listProjects(req.user.organizationId, {
    status,
    sort,
    limit,
    offset,
  });
  res.status(200).json(ok(rows, buildMeta(page, perPage, total)));
}

export async function getOne(req, res) {
  const project = await projectService.getProject(req.project, req.user.id);
  res.status(200).json(ok(project));
}

export async function create(req, res) {
  const project = await projectService.createProject(req.user, req.body);
  res.status(201).json(ok(project));
}

export async function update(req, res) {
  const project = await projectService.updateProject(req.project, req.body);
  res.status(200).json(ok(project));
}

export async function listMembers(req, res) {
  const memberList = await projectService.listMembers(req.project);
  res.status(200).json(ok(memberList));
}

export async function addMember(req, res) {
  const memberList = await projectService.addMember(req.project, req.body.user_id);
  res.status(201).json(ok(memberList));
}

export async function removeMember(req, res) {
  await projectService.removeMember(req.project, req.params.userId);
  res.status(200).json(ok({ removed: true }));
}
