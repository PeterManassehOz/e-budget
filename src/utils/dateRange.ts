import type { Transaction } from "@/types/transaction";


export type AnalyticsDateRange =
  | "7days"
  | "30days"
  | "thisMonth"
  | "allTime";

export function getDateRangeStart(
  range: AnalyticsDateRange,
  now = new Date()
): Date | null {
  const start = new Date(now);

  switch (range) {
    case "7days":
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return start;

    case "30days":
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return start;

    case "thisMonth":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return start;

    case "allTime":
      return null;
  }
}


export function filterTransactionsByDateRange(
  transactions: Transaction[],
  range: AnalyticsDateRange,
  now = new Date()
): Transaction[] {
  const start = getDateRangeStart(range, now);

  if (!start) {
    return transactions;
  }

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);

    return (
      transactionDate >= start &&
      transactionDate <= end
    );
  });
}