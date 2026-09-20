import type {
  Transaction,
  TransactionCategory,
  TransactionType,
} from "@/types/transaction";

type CreateTransactionInput = {
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description: string;
  date: Date;
};

export function createTransaction({
  type,
  amount,
  category,
  description,
  date,
}: CreateTransactionInput): Transaction {
  const now = new Date().toISOString();

  return {
    id: `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`,
    type,
    amount,
    category,
    description: description.trim(),
    date: date.toISOString(),
    createdAt: now,
  };
}