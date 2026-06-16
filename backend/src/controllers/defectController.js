// Thin defect controllers.
import * as defectService from '../services/defectService.js';
import { ok } from '../utils/response.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';

export async function list(req, res) {
  const { page, perPage, limit, offset } = parsePagination(req.query);
  const { status, severity, priority, assignee_id, sort } = req.query;
  const { rows, total } = await defectService.listDefects(req.project.id, {
    status,
    severity,
    priority,
    assigneeId: assignee_id,
    sort,
    limit,
    offset,
  });
  res.status(200).json(ok(rows, buildMeta(page, perPage, total)));
}

export async function getOne(req, res) {
  res.status(200).json(ok(await defectService.getDefect(req.defect)));
}

export async function create(req, res) {
  res.status(201).json(ok(await defectService.createDefect(req.project, req.user, req.body)));
}

export async function update(req, res) {
  res.status(200).json(ok(await defectService.updateDefect(req.project, req.defect, req.body)));
}

export async function transition(req, res) {
  res.status(200).json(ok(await defectService.transitionDefect(req.defect, req.body.status)));
}

export async function listComments(req, res) {
  res.status(200).json(ok(await defectService.listComments(req.defect)));
}

export async function addComment(req, res) {
  res.status(201).json(ok(await defectService.addComment(req.defect, req.user, req.body)));
}
