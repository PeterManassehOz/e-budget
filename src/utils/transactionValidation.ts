import type {
  TransactionCategory,
  TransactionType,
} from "@/types/transaction";
import {
  expenseCategories,
  incomeCategories,
} from "@/types/transaction";

export type TransactionFormErrors = {
  amount?: string;
  category?: string;
  date?: string;
};

type ValidateTransactionInput = {
  amount: string;
  type: TransactionType;
  category: TransactionCategory;
  date: Date;
};

export function validateTransactionForm({
  amount,
  type,
  category,
  date,
}: ValidateTransactionInput): TransactionFormErrors {
  const errors: TransactionFormErrors = {};

  const trimmedAmount = amount.trim();
  const numericAmount = Number(trimmedAmount);

  if (!trimmedAmount) {
    errors.amount = "Please enter an amount.";
  } else if (!Number.isFinite(numericAmount)) {
    errors.amount = "Please enter a valid amount.";
  } else if (numericAmount <= 0) {
    errors.amount = "Amount must be greater than 0.";
  }

  const validCategories =
    type === "income"
      ? incomeCategories
      : expenseCategories;

  if (!validCategories.includes(category)) {
    errors.category =
      "Please select a category that matches the transaction type.";
  }

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    errors.date = "Please select a valid date.";
  } else if (date > new Date()) {
    errors.date = "Transaction date cannot be in the future.";
  }

  return errors;
}