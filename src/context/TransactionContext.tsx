import {
  expenseCategories,
  incomeCategories,
  type Transaction,
} from "@/types/transaction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const TRANSACTIONS_STORAGE_KEY = "@pocketbudget/transactions";

function isValidTransaction(
  value: unknown
): value is Transaction {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const transaction = value as Record<string, unknown>;

  if (
    typeof transaction.id !== "string" ||
    typeof transaction.type !== "string" ||
    typeof transaction.amount !== "number" ||
    !Number.isFinite(transaction.amount) ||
    typeof transaction.category !== "string" ||
    typeof transaction.description !== "string" ||
    typeof transaction.date !== "string" ||
    typeof transaction.createdAt !== "string"
  ) {
    return false;
  }

  const validCategories =
    transaction.type === "income"
      ? incomeCategories
      : transaction.type === "expense"
        ? expenseCategories
        : [];

  return (
    validCategories.includes(
      transaction.category as Transaction["category"]
    ) &&
    !Number.isNaN(
      new Date(transaction.date).getTime()
    ) &&
    !Number.isNaN(
      new Date(transaction.createdAt).getTime()
    )
  );
}

function assertValidTransaction(
  transaction: Transaction
) {
  if (!isValidTransaction(transaction)) {
    throw new Error(
      "Invalid transaction data."
    );
  }
}

type TransactionContextType = {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
};

export const TransactionContext =
  createContext<TransactionContextType | undefined>(undefined);

type TransactionProviderProps = {
  children: ReactNode;
};

export function TransactionProvider({
  children,
}: TransactionProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const storedTransactions =
          await AsyncStorage.getItem(
            TRANSACTIONS_STORAGE_KEY
          );

        if (!storedTransactions) {
          return;
        }

        const parsedTransactions: unknown =
          JSON.parse(storedTransactions);

        if (!Array.isArray(parsedTransactions)) {
          console.warn(
            "Stored transactions data is not an array."
          );

          return;
        }

        const validTransactions =
          parsedTransactions.filter(
            isValidTransaction
          );

        const invalidCount =
          parsedTransactions.length -
          validTransactions.length;

        if (invalidCount > 0) {
          console.warn(
            `Ignored ${invalidCount} invalid transaction(s) from storage.`
          );
        }

        setTransactions(validTransactions);
      } catch (error) {
        console.error(
          "Failed to load transactions:",
          error
        );

        setTransactions([]);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTransactions();
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const saveTransactions = async () => {
      try {
        await AsyncStorage.setItem(
          TRANSACTIONS_STORAGE_KEY,
          JSON.stringify(transactions)
        );
      } catch (error) {
        console.error("Failed to save transactions:", error);
      }
    };

    saveTransactions();
  }, [transactions, isLoaded]);

  const addTransaction = (transaction: Transaction) => {
    assertValidTransaction(transaction);

    setTransactions((currentTransactions) => [
      ...currentTransactions,
      transaction,
    ]);
  };

  const updateTransaction = (
  updatedTransaction: Transaction
  ) => {
    assertValidTransaction(updatedTransaction);

    setTransactions((currentTransactions) =>
      currentTransactions.map((transaction) =>
        transaction.id === updatedTransaction.id
          ? updatedTransaction
          : transaction
      )
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((currentTransactions) =>
      currentTransactions.filter((transaction) => transaction.id !== id)
    );
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}