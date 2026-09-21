// utils/transactionGrouping.ts
import type { Transaction } from "@/types/transaction";

export type TransactionListRow =
  | { type: "header"; id: string; label: string }
  | { type: "item"; id: string; transaction: Transaction };

export function buildGroupedTransactionRows(
  transactions: Transaction[]
): TransactionListRow[] {
  const rows: TransactionListRow[] = [];
  let currentLabel: string | null = null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const transaction of transactions) {
    const date = new Date(transaction.date);
    date.setHours(0, 0, 0, 0);

    let label: string;

    if (date.getTime() === today.getTime()) {
      label = "Today";
    } else if (date.getTime() === yesterday.getTime()) {
      label = "Yesterday";
    } else {
      const diffDays = Math.round(
        (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays > 0 && diffDays < 7) {
        label = date.toLocaleDateString("en-NG", { weekday: "long" });
      } else if (date.getFullYear() === today.getFullYear()) {
        label = date.toLocaleDateString("en-NG", { month: "long" });
      } else {
        label = date.toLocaleDateString("en-NG", {
          month: "long",
          year: "numeric",
        });
      }
    }

    if (label !== currentLabel) {
      rows.push({
        type: "header",
        id: `header-${label}-${transaction.id}`,
        label,
      });
      currentLabel = label;
    }

    rows.push({ type: "item", id: transaction.id, transaction });
  }

  return rows;
}