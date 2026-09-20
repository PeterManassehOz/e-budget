export type TransactionType = "income" | "expense";

export type TransactionCategory =
  | "Food"
  | "Transport"
  | "Bills"
  | "Shopping"
  | "Entertainment"
  | "Health"
  | "Salary"
  | "Freelance"
  | "Other";

export const expenseCategories: TransactionCategory[] = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Entertainment",
  "Health",
  "Other",
];

export const incomeCategories: TransactionCategory[] = [
  "Salary",
  "Freelance",
  "Other",
];

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description: string;
  date: string;
  createdAt: string;
}