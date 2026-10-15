import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { expenses, settlements, splits } from '../db.js';

interface CreateSettlementBody {
  from: string;
  to: string;
  amount: number;
}

export function createSettlement(req: Request, res: Response): void {
  const body = req.body as CreateSettlementBody;
  const settlement = {
    id: randomUUID(),
    householdId: req.params.householdId,
    from: body.from,
    to: body.to,
    amount: body.amount,
    createdAt: new Date().toISOString(),
  };
  settlements.push(settlement);

  const toExpenseIds = expenses.filter((expense) => expense.paidBy === body.to).map((expense) => expense.id);
  for (const split of splits) {
    if (split.userId === body.from && toExpenseIds.includes(split.expenseId)) {
      split.paid = true;
    }
  }

  res.status(201).json({
    id: settlement.id,
    from: settlement.from,
    to: settlement.to,
    amount: settlement.amount,
    createdAt: settlement.createdAt,
  });
}

export function listSettlements(req: Request, res: Response): void {
  const list = settlements
    .filter((settlement) => settlement.householdId === req.params.householdId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((settlement) => ({
      id: settlement.id,
      from: settlement.from,
      to: settlement.to,
      amount: settlement.amount,
      createdAt: settlement.createdAt,
    }));
  res.status(200).json({ settlements: list });
}