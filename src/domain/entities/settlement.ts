export interface Settlement {
  id: string;
  amount: number;
  from: string;
  to: string;
  settled: boolean;
}
