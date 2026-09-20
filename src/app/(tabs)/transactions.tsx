import SelectField from "@/components/ui/SelectField";
import { useTheme } from "@/context/ThemeContext";
import { TransactionContext } from "@/context/TransactionContext";
import { formatCurrency } from "@/utils/currency";
import { sortTransactionsByDate } from "@/utils/transactionAnalytics";
import { useRouter } from "expo-router";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const BASE_BOTTOM_PADDING = 100;

type TransactionFilter = "all" | "income" | "expense";

const transactionFilterOptions = [
  {
    label: "All Transactions",
    value: "all",
  },
  {
    label: "Income",
    value: "income",
  },
  {
    label: "Expenses",
    value: "expense",
  },
];

export default function TransactionsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionFilter, setTransactionFilter] =
    useState<TransactionFilter>("all");
  const context = useContext(TransactionContext);

  const flatListRef = useRef<FlatList>(null);
  const scrollOffsetRef = useRef(0);
  const keyboardHeightRef = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  if (!context) {
    throw new Error(
      "TransactionsScreen must be used inside TransactionProvider"
    );
  }

  const { transactions, deleteTransaction } = context;

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        normalizedQuery === "" ||
        transaction.description
          .toLowerCase()
          .includes(normalizedQuery) ||
        transaction.category
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesType =
        transactionFilter === "all" ||
        transaction.type === transactionFilter;

      return matchesSearch && matchesType;
    });
  }, [transactions, searchQuery, transactionFilter]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const height = e.endCoordinates.height;
      keyboardHeightRef.current = height;

      setKeyboardHeight(height);

      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset({
          offset: scrollOffsetRef.current + height,
          animated: true,
        });
      });
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      const height = keyboardHeightRef.current;
      keyboardHeightRef.current = 0;

      flatListRef.current?.scrollToOffset({
        offset: Math.max(0, scrollOffsetRef.current - height),
        animated: true,
      });

      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete transaction",
      "Are you sure you want to delete this transaction?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTransaction(id),
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50 px-6 pt-12 dark:bg-gray-950">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-3xl font-bold text-gray-950 dark:text-white">
            Your Money
          </Text>

          <Text className="mt-2 text-base leading-6 text-gray-500 dark:text-gray-400">
            Search and manage your transactions.
          </Text>
        </View>

        <View className="ml-2 h-11 w-11 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <Text className="text-lg">
            {isDark ? "💳" : "💰"}
          </Text>
        </View>
      </View>

      <TextInput
        className="mt-6 rounded-xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
        placeholder="Search transactions..."
        placeholderTextColor={isDark ? "#94A3B8" : "#9CA3AF"}
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
      />

      <View className="mt-4">
        <SelectField
          label="Filter"
          value={transactionFilter}
          options={transactionFilterOptions}
          onChange={(value) =>
            setTransactionFilter(value as TransactionFilter)
          }
        />
      </View>

      <FlatList
        ref={flatListRef}
        className="mt-4 flex-1"
        data={sortTransactionsByDate(filteredTransactions)}
        keyExtractor={(transaction) => transaction.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={(e) => {
          scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingBottom:
            keyboardHeight > 0
              ? keyboardHeight + BASE_BOTTOM_PADDING
              : BASE_BOTTOM_PADDING,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <View className="items-center rounded-xl border border-gray-200 bg-white px-6 py-10 dark:border-gray-800 dark:bg-gray-900">
            <View className="h-14 w-14 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
              <Text className="text-2xl">
                {transactions.length === 0 ? "💰" : "🔎"}
              </Text>
            </View>

            <Text className="mt-5 text-xl font-bold text-gray-950 dark:text-white">
              {transactions.length === 0
                ? "No transactions yet"
                : "No matching transactions"}
            </Text>

            <Text className="mt-2 text-center text-base leading-6 text-gray-500 dark:text-gray-400">
              {transactions.length === 0
                ? "Start tracking your money by adding your first transaction."
                : "Try searching for a different description or category."}
            </Text>

            {transactions.length === 0 && (
              <Pressable
                className="mt-6 rounded-xl bg-blue-600 px-5 py-3"
                onPress={() => router.push("/add-transaction")}
              >
                <Text className="font-bold text-white">
                  Add Transaction
                </Text>
              </Pressable>
            )}
          </View>
        }
        renderItem={({ item: transaction }) => {
          const isIncome = transaction.type === "income";

          const formattedDate = new Date(
            transaction.date
          ).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <View className="mb-3 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-4">
                  <View className="flex-row items-center">
                    <View
                      className={`mr-3 h-9 w-9 items-center justify-center rounded-xl ${
                        isIncome
                          ? "bg-green-50 dark:bg-green-950"
                          : "bg-red-50 dark:bg-red-950"
                      }`}
                    >
                      <Text
                        className={`text-base font-bold ${
                          isIncome
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {isIncome ? "↑" : "↓"}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-950 dark:text-white">
                        {transaction.category}
                      </Text>

                      <Text
                        className="mt-1 text-sm text-gray-500 dark:text-gray-400"
                        numberOfLines={1}
                      >
                        {transaction.description || "No description"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="items-end">
                  <Text
                    className={`text-lg font-bold ${
                      isIncome
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </Text>

                  <View
                    className={`mt-2 rounded-xl px-2.5 py-1 ${
                      isIncome
                        ? "bg-green-50 dark:bg-green-950"
                        : "bg-red-50 dark:bg-red-950"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isIncome
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isIncome ? "Income" : "Expense"}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {formattedDate}
                  </Text>

                  <View className="flex-row gap-2">
                    <Pressable
                      className="rounded-xl border border-blue-200 px-4 py-2 dark:border-blue-900"
                      onPress={() =>
                        router.push({
                          pathname: "/edit-transaction",
                          params: { id: transaction.id },
                        })
                      }
                    >
                      <Text className="font-semibold text-blue-600 dark:text-blue-400">
                        Edit
                      </Text>
                    </Pressable>

                    <Pressable
                      className="rounded-xl border border-red-200 px-4 py-2 dark:border-red-900"
                      onPress={() => handleDelete(transaction.id)}
                    >
                      <Text className="font-semibold text-red-600 dark:text-red-400">
                        Delete
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}