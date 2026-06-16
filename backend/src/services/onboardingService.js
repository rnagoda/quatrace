// Onboarding business logic: provisions a learner's workspace in a single
// transaction — virtual team, personal project, read-only sibling projects,
// environments, and builds. Runs once per learner (guarded by onboarded_at).
import { db } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import * as users from '../models/userModel.js';
import * as projects from '../models/projectModel.js';
import * as members from '../models/projectMemberModel.js';
import * as environments from '../models/environmentModel.js';
import * as builds from '../models/buildModel.js';
import * as defects from '../models/defectModel.js';
import {
  NPC_TEAM,
  SIBLING_PROJECTS,
  DEFAULT_ENVIRONMENTS,
  DEFAULT_BUILDS,
  DEFAULT_DEFECTS,
  PROJECT_TYPE_LABELS,
} from '../domain/onboarding.js';

export async function completeOnboarding(authUser, { project_type }) {
  return db.transaction(async (trx) => {
    const me = await users.findById(authUser.id, trx);
    if (!me) throw AppError.unauthorized();
    if (me.onboarded_at) throw AppError.conflict('Onboarding has already been completed.');

    const orgId = me.organization_id;

    // 1. Seed the virtual NPC team into the learner's org.
    const npcs = [];
    for (const member of NPC_TEAM) {
      const npc = await users.insertUser(
        {
          organization_id: orgId,
          email: `${member.persona}.${orgId}@npc.quatrace.test`,
          password_hash: 'npc-no-login',
          first_name: member.first_name,
          last_name: member.last_name,
          role: member.role,
          is_npc: true,
          npc_persona: member.persona,
        },
        trx,
      );
      npcs.push(npc);
    }

    // 2. The learner's personal project.
    const label = PROJECT_TYPE_LABELS[project_type] ?? 'Project';
    const project = await projects.insert(
      {
        organization_id: orgId,
        name: `My ${label}`,
        description: `Your ${label} project.`,
        project_type,
      },
      trx,
    );

    // 3. Memberships: the learner (their one active project) plus the whole team.
    await members.insert({ projectId: project.id, userId: me.id, isActiveProject: true }, trx);
    for (const npc of npcs) {
      await members.insert({ projectId: project.id, userId: npc.id }, trx);
    }

    // 4. Read-only sibling projects the learner is not a member of.
    const siblingProjects = [];
    for (const sibling of SIBLING_PROJECTS) {
      siblingProjects.push(
        await projects.insert(
          { organization_id: orgId, name: sibling.name, project_type: sibling.project_type },
          trx,
        ),
      );
    }

    // 5. Default environments and builds on the personal project.
    const environmentRows = await environments.insertMany(
      DEFAULT_ENVIRONMENTS.map((name) => ({ project_id: project.id, name, is_default: true })),
      trx,
    );
    await builds.insertMany(
      DEFAULT_BUILDS.map((b) => ({
        project_id: project.id,
        name: b.name,
        release_notes: b.release_notes,
      })),
      trx,
    );

    // 6. Starter defects so the project is populated on first login.
    const envByName = Object.fromEntries(environmentRows.map((e) => [e.name, e.id]));
    const npcByPersona = Object.fromEntries(npcs.map((n) => [n.npc_persona, n.id]));
    await defects.insertMany(
      DEFAULT_DEFECTS.map((d) => ({
        project_id: project.id,
        title: d.title,
        description: d.description ?? null,
        status: d.status,
        severity: d.severity,
        priority: d.priority,
        reporter_id: me.id,
        assignee_id: d.assignee_persona ? (npcByPersona[d.assignee_persona] ?? null) : null,
        environment_id: d.environment ? (envByName[d.environment] ?? null) : null,
      })),
      trx,
    );

    // 7. Mark the learner onboarded.
    await users.markOnboarded(me.id, trx);

    const team = npcs.map(({ id, first_name, last_name, role, npc_persona }) => ({
      id,
      first_name,
      last_name,
      role,
      npc_persona,
    }));
    return { project, team, siblingProjects };
  });
}
