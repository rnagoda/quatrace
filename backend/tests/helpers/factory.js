// Test factory: creates organizations and users of a given role directly via the
// database and mints access tokens for them (there is no admin API yet to create
// users with roles). Tracks created orgs so a single cleanup() removes everything
// by cascade.
import { db } from '../../src/config/db.js';
import { signAccessToken } from '../../src/utils/tokens.js';

const createdOrgIds = [];
let seq = 0;

export async function createOrg(overrides = {}) {
  seq += 1;
  const [org] = await db('organizations')
    .insert({
      name: `Factory Org ${Date.now()}_${seq}`,
      subscription_tier: 'pro',
      is_learner_org: true,
      ...overrides,
    })
    .returning('*');
  createdOrgIds.push(org.id);
  return org;
}

export async function createUser({ organizationId, role = 'tester', ...overrides } = {}) {
  let orgId = organizationId;
  if (!orgId) orgId = (await createOrg()).id;
  seq += 1;
  const [user] = await db('users')
    .insert({
      organization_id: orgId,
      email: `factory_${Date.now()}_${seq}@example.test`,
      password_hash: 'unused-in-tests',
      first_name: 'Fac',
      last_name: 'Tory',
      role,
      ...overrides,
    })
    .returning('*');
  const token = signAccessToken({ userId: user.id, role: user.role, organizationId: orgId });
  return { user, token, orgId };
}

export async function cleanup() {
  if (createdOrgIds.length) {
    await db('organizations').whereIn('id', createdOrgIds).del();
    createdOrgIds.length = 0;
  }
}
