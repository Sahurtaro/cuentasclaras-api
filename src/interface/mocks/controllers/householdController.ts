import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { households, members, membersOfHousehold, MOCK_CURRENT_USER_ID, users, type MockHousehold } from '../db.js';

interface CreateHouseholdBody {
  name: string;
}

interface JoinHouseholdBody {
  inviteCode: string;
}

interface HouseholdSummary {
  id: string;
  name: string;
  role: 'admin' | 'member';
  inviteCode?: string;
}

function buildInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createHousehold(req: Request, res: Response): void {
  const { name } = req.body as CreateHouseholdBody;
  const household: MockHousehold = { id: randomUUID(), name, inviteCode: buildInviteCode() };
  households.push(household);
  members.push({
    householdId: household.id,
    userId: MOCK_CURRENT_USER_ID,
    role: 'admin',
    joinedAt: new Date().toISOString(),
  });
  res.setHeader('Location', `/v1/households/${household.id}`);
  res.status(201).json({ id: household.id, name: household.name, inviteCode: household.inviteCode, role: 'admin' });
}

export function joinHousehold(req: Request, res: Response): void {
  const { inviteCode } = req.body as JoinHouseholdBody;
  const household = households.find((candidate) => candidate.inviteCode === inviteCode);
  if (!household) {
    res.status(404).json({
      error: { code: 'INVALID_INVITE_CODE', message: 'The invite code is invalid or the household no longer exists', details: {} },
    });
    return;
  }
  const already = members.some(
    (member) => member.householdId === household.id && member.userId === MOCK_CURRENT_USER_ID,
  );
  if (already) {
    res.status(409).json({
      error: { code: 'ALREADY_MEMBER', message: 'The user is already a member of this household', details: {} },
    });
    return;
  }
  members.push({
    householdId: household.id,
    userId: MOCK_CURRENT_USER_ID,
    role: 'member',
    joinedAt: new Date().toISOString(),
  });
  res.status(200).json({ id: household.id, name: household.name, role: 'member' });
}

export function listHouseholds(_req: Request, res: Response): void {
  const myMemberships = members.filter((member) => member.userId === MOCK_CURRENT_USER_ID);
  const result: HouseholdSummary[] = [];
  for (const membership of myMemberships) {
    const household = households.find((candidate) => candidate.id === membership.householdId);
    if (!household) continue;
    if (membership.role === 'admin') {
      result.push({ id: household.id, name: household.name, role: membership.role, inviteCode: household.inviteCode });
    } else {
      result.push({ id: household.id, name: household.name, role: membership.role });
    }
  }
  res.status(200).json({ households: result });
}

export function getHousehold(req: Request, res: Response): void {
  const household = households.find((candidate) => candidate.id === req.params.id);
  if (!household) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Household not found', details: {} } });
    return;
  }
  const isAdmin = members.some(
    (member) =>
      member.householdId === household.id &&
      member.userId === MOCK_CURRENT_USER_ID &&
      member.role === 'admin',
  );
  const memberList = membersOfHousehold(household.id)
    .map((member) => {
      const user = users.find((candidate) => candidate.id === member.userId);
      if (!user) return null;
      return { id: user.id, name: user.name, email: user.email, role: member.role, joinedAt: member.joinedAt };
    })
    .filter((member): member is NonNullable<typeof member> => member !== null);
  res.status(200).json({
    id: household.id,
    name: household.name,
    ...(isAdmin ? { inviteCode: household.inviteCode } : {}),
    members: memberList,
  });
}