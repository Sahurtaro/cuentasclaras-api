export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  date: Date;
  householdId: string;
}
