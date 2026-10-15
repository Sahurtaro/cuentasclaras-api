import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import {
  expenses,
  membersOfHousehold,
  MOCK_CURRENT_USER_ID,
  splits,
  type MockExpense,
  type MockSplit,
} from '../db.js';

interface SplitInput {
  userId: string;
  amount?: number;
  percent?: number;
  paid?: boolean;
}

interface CreateExpenseBody {
  description: string;
  amount: number;
  paidBy?: string;
  date?: string;
  strategy?: 'EQUAL' | 'PERCENTAGE' | 'EXACT';
  title?: string;
  splits?: SplitInput[];
}

interface PatchExpenseBody {
  description?: string;
  amount?: number;
  strategy?: 'EQUAL' | 'PERCENTAGE' | 'EXACT';
  title?: string;
  splits?: SplitInput[];
}

export function createExpense(req: Request, res: Response): void {
  const body = req.body as CreateExpenseBody;
  const householdId: string = req.params.householdId;
  const paidBy: string = body.paidBy ?? MOCK_CURRENT_USER_ID;
  const expenseId = randomUUID();
  const expense: MockExpense = {
    id: expenseId,
    householdId,
    description: body.description,
    amount: body.amount,
    paidBy,
    date: body.date ?? new Date().toISOString(),
    strategy: body.strategy ?? 'EQUAL',
    title: body.title ?? null,
  };
  expenses.push(expense);

  let newSplits: MockSplit[];
  if (body.splits && body.splits.length > 0) {
    newSplits = body.splits.map((input) => ({
      id: randomUUID(),
      expenseId,
      userId: input.userId,
      amount: input.amount ?? 0,
      percent: input.percent ?? null,
      paid: input.paid ?? input.userId === paidBy,
    }));
  } else {
    const houseMembers = membersOfHousehold(householdId);
    const base = Math.floor(body.amount / houseMembers.length);
    let remainder = body.amount - base * houseMembers.length;
    newSplits = houseMembers.map((member) => {
      const amount = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder -= 1;
      return {
        id: randomUUID(),
        expenseId,
        userId: member.userId,
        amount,
        percent: null,
        paid: member.userId === paidBy,
      };
    });
  }
  splits.push(...newSplits);

  res.setHeader('Location', `/v1/expenses/${expenseId}`);
  res.status(201).json({ ...expense, splits: newSplits });
}

export function listExpenses(req: Request, res: Response): void {
  const householdId: string = req.params.householdId;
  const list = expenses
    .filter((expense) => expense.householdId === householdId)
    .sort((a, b) => b.date.localeCompare(a.date));
  res.status(200).json({ expenses: list });
}

export function getExpense(req: Request, res: Response): void {
  const expense = expenses.find((candidate) => candidate.id === req.params.id);
  if (!expense) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Expense not found', details: {} } });
    return;
  }
  const expenseSplits = splits.filter((split) => split.expenseId === expense.id);
  res.status(200).json({ ...expense, splits: expenseSplits });
}

export function updateExpense(req: Request, res: Response): void {
  const expense = expenses.find((candidate) => candidate.id === req.params.id);
  if (!expense) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Expense not found', details: {} } });
    return;
  }
  const body = req.body as PatchExpenseBody;
  if (body.description !== undefined) expense.description = body.description;
  if (body.amount !== undefined) expense.amount = body.amount;
  if (body.strategy !== undefined) expense.strategy = body.strategy;
  if (body.title !== undefined) expense.title = body.title;
  if (body.splits) {
    for (let i = splits.length - 1; i >= 0; i -= 1) {
      if (splits[i].expenseId === expense.id) splits.splice(i, 1);
    }
    const replacement = body.splits.map((input) => ({
      id: randomUUID(),
      expenseId: expense.id,
      userId: input.userId,
      amount: input.amount ?? 0,
      percent: input.percent ?? null,
      paid: input.paid ?? false,
    }));
    splits.push(...replacement);
  }
  const expenseSplits = splits.filter((split) => split.expenseId === expense.id);
  res.status(200).json({ ...expense, splits: expenseSplits });
}

export function deleteExpense(req: Request, res: Response): void {
  const expense = expenses.find((candidate) => candidate.id === req.params.id);
  if (!expense) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Expense not found', details: {} } });
    return;
  }
  expenses.splice(expenses.indexOf(expense), 1);
  for (let i = splits.length - 1; i >= 0; i -= 1) {
    if (splits[i].expenseId === expense.id) splits.splice(i, 1);
  }
  res.status(204).send();
}

export function markSplitPaid(req: Request, res: Response): void {
  const split = splits.find(
    (candidate) => candidate.expenseId === req.params.expenseId && candidate.userId === req.params.userId,
  );
  if (!split) {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Expense or split not found', details: {} },
    });
    return;
  }
  split.paid = (req.body as { paid: boolean }).paid;
  res.status(200).json({
    id: split.id,
    expenseId: split.expenseId,
    userId: split.userId,
    amount: split.amount,
    percent: split.percent,
    paid: split.paid,
  });
}