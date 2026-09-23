import { readFileSync } from 'node:fs';
import type { User } from '../../domain/entities/user.js';

export interface MockHousehold {
  id: string;
  name: string;
  inviteCode: string;
}

export interface MockMember {
  householdId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface MockExpense {
  id: string;
  householdId: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  strategy: 'EQUAL' | 'PERCENTAGE' | 'EXACT';
  title: string | null;
}

export interface MockSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: number;
  percent: number | null;
  paid: boolean;
}

export interface MockSettlement {
  id: string;
  householdId: string;
  from: string;
  to: string;
  amount: number;
  createdAt: string;
}

function load<T>(fileName: string): T[] {
  const url = new URL(`./data/${fileName}.json`, import.meta.url);
  const raw = readFileSync(url, 'utf-8');
  return JSON.parse(raw) as T[];
}

export const users: User[] = load<User>('users');
export const households: MockHousehold[] = load<MockHousehold>('households');
export const members: MockMember[] = load<MockMember>('members');
export const expenses: MockExpense[] = load<MockExpense>('expenses');
export const splits: MockSplit[] = load<MockSplit>('splits');
export const settlements: MockSettlement[] = load<MockSettlement>('settlements');

export const MOCK_CURRENT_USER_ID: string = '11111111-1111-1111-1111-111111111111';

export function membersOfHousehold(householdId: string): MockMember[] {
  return members.filter((member) => member.householdId === householdId);
}