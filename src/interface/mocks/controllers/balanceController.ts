import type { Request, Response } from 'express';
import { expenses, membersOfHousehold, splits, users } from '../db.js';

interface Debt {
  from: string;
  to: string;
  amount: number;
}

export function getBalance(req: Request, res: Response): void {
  const householdId: string = req.params.householdId;
  const houseMembers = membersOfHousehold(householdId);
  const householdExpenses = expenses.filter((expense) => expense.householdId === householdId);
  const householdSplits = splits.filter((split) =>
    householdExpenses.some((expense) => expense.id === split.expenseId),
  );

  const balance = houseMembers.map((member) => {
    const memberId = member.userId;
    const mySplits = householdSplits.filter((split) => split.userId === memberId);
    const alreadyPaid = mySplits
      .filter((split) => split.paid)
      .reduce((sum, split) => sum + split.amount, 0);
    const pending = mySplits
      .filter((split) => !split.paid)
      .reduce((sum, split) => sum + split.amount, 0);

    let othersOweMe = 0;
    for (const expense of householdExpenses) {
      if (expense.paidBy !== memberId) continue;
      for (const split of householdSplits) {
        if (split.expenseId === expense.id && split.userId !== memberId && !split.paid) {
          othersOweMe += split.amount;
        }
      }
    }

    const debts: Debt[] = [];
    for (const other of houseMembers) {
      if (other.userId === memberId) continue;
      let amount = 0;
      for (const expense of householdExpenses) {
        if (expense.paidBy !== other.userId) continue;
        for (const split of householdSplits) {
          if (split.expenseId === expense.id && split.userId === memberId && !split.paid) {
            amount += split.amount;
          }
        }
      }
      if (amount > 0) debts.push({ from: memberId, to: other.userId, amount });
    }

    const user = users.find((candidate) => candidate.id === memberId);
    return {
      memberId,
      name: user?.name ?? '',
      alreadyPaid,
      pending,
      net: othersOweMe - pending,
      debts,
    };
  });

  res.status(200).json({ balance });
}