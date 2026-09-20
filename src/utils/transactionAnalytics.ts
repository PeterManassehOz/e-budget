import type { Transaction } from "@/types/transaction";

export function calculateTotalIncome(
  transactions: Transaction[]
): number {
  return transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function calculateTotalExpenses(
  transactions: Transaction[]
): number {
  return transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function calculateAverageTransaction(
  transactions: Transaction[],
  type: Transaction["type"]
): number {
  const matchingTransactions = transactions.filter(
    (transaction) => transaction.type === type
  );

  if (matchingTransactions.length === 0) {
    return 0;
  }

  const total = matchingTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  return total / matchingTransactions.length;
}

export function calculateCategoryTotals(
  transactions: Transaction[]
): Record<string, number> {
  return transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce<Record<string, number>>((totals, transaction) => {
      totals[transaction.category] =
        (totals[transaction.category] ?? 0) + transaction.amount;

      return totals;
    }, {});
}

export type DailyTrend = {
  date: string;
  income: number;
  expenses: number;
};

export type MonthlyTrend = {
  date: string;
  income: number;
  expenses: number;
};

export function calculateDailyTrend(
  transactions: Transaction[],
  startDate?: Date | null,
  endDate = new Date()
): DailyTrend[] {
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const start = startDate
    ? new Date(startDate)
    : new Date(
        end.getFullYear(),
        end.getMonth(),
        1
      );

  start.setHours(0, 0, 0, 0);

  const dailyTotals: Record<string, DailyTrend> = {};

  const currentDate = new Date(start);

  while (currentDate <= end) {
    const dateKey = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(
      currentDate.getDate()
    ).padStart(2, "0")}`;

    dailyTotals[dateKey] = {
      date: dateKey,
      income: 0,
      expenses: 0,
    };

    currentDate.setDate(currentDate.getDate() + 1);
  }

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);

    if (
      transactionDate < start ||
      transactionDate > end
    ) {
      return;
    }

    const dateKey = `${transactionDate.getFullYear()}-${String(
      transactionDate.getMonth() + 1
    ).padStart(2, "0")}-${String(
      transactionDate.getDate()
    ).padStart(2, "0")}`;

    if (!dailyTotals[dateKey]) {
      return;
    }

    if (transaction.type === "income") {
      dailyTotals[dateKey].income += transaction.amount;
    } else {
      dailyTotals[dateKey].expenses += transaction.amount;
    }
  });

  return Object.values(dailyTotals);
}


export function calculateMonthlyTrend(
  transactions: Transaction[]
): MonthlyTrend[] {
  if (transactions.length === 0) {
    return [];
  }

  const monthlyTotals: Record<string, MonthlyTrend> = {};

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);

    const dateKey = `${transactionDate.getFullYear()}-${String(
      transactionDate.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!monthlyTotals[dateKey]) {
      monthlyTotals[dateKey] = {
        date: dateKey,
        income: 0,
        expenses: 0,
      };
    }

    if (transaction.type === "income") {
      monthlyTotals[dateKey].income += transaction.amount;
    } else {
      monthlyTotals[dateKey].expenses += transaction.amount;
    }
  });

  return Object.values(monthlyTotals).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}


export function sortTransactionsByDate(
  transactions: Transaction[]
): Transaction[] {
  return [...transactions].sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime()
  );
}