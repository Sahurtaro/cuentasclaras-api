import { Router } from 'express';
import {
  createExpense,
  deleteExpense,
  getExpense,
  listExpenses,
  markSplitPaid,
  updateExpense,
} from '../mocks/controllers/expenseController.js';

export const expenseRouter: Router = Router();

expenseRouter.post('/households/:householdId/expenses', createExpense);
expenseRouter.get('/households/:householdId/expenses', listExpenses);
expenseRouter.get('/expenses/:id', getExpense);
expenseRouter.patch('/expenses/:id', updateExpense);
expenseRouter.delete('/expenses/:id', deleteExpense);
expenseRouter.patch('/expense-splits/:expenseId/:userId', markSplitPaid);