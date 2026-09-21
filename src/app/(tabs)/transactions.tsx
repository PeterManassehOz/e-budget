import SelectField from "@/components/ui/SelectField";
import { useTheme } from "@/context/ThemeContext";
import { TransactionContext } from "@/context/TransactionContext";
import { formatCurrency } from "@/utils/currency";
import { sortTransactionsByDate } from "@/utils/transactionAnalytics";
import {
  buildGroupedTransactionRows,
  type TransactionListRow,
} from "@/utils/transactionGrouping";
import { Ionicons } from "@expo/vector-icons";
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
  { label: "All Transactions", value: "all" },
  { label: "Income", value: "income" },
  { label: "Expenses", value: "expense" },
];

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Food: "fast-food-outline",
  Transport: "car-outline",
  Bills: "receipt-outline",
  Shopping: "bag-handle-outline",
  Entertainment: "film-outline",
  Health: "medkit-outline",
  Other: "ellipsis-horizontal-circle-outline",
  Salary: "cash-outline",
  Freelance: "briefcase-outline",
};

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#2563EB",
  Transport: "#16A34A",
  Bills: "#DC2626",
  Shopping: "#CA8A04",
  Entertainment: "#9333EA",
  Health: "#0891B2",
  Other: "#EA580C",
  Salary: "#16A34A",
  Freelance: "#7C3AED",
};

export default function TransactionsScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionFilter, setTransactionFilter] =
    useState<TransactionFilter>("all");
  const context = useContext(TransactionContext);

  const flatListRef = useRef<FlatList<TransactionListRow>>(null);
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
        transaction.description.toLowerCase().includes(normalizedQuery) ||
        transaction.category.toLowerCase().includes(normalizedQuery);

      const matchesType =
        transactionFilter === "all" ||
        transaction.type === transactionFilter;

      return matchesSearch && matchesType;
    });
  }, [transactions, searchQuery, transactionFilter]);

  const rows = useMemo(
    () =>
      buildGroupedTransactionRows(
        sortTransactionsByDate(filteredTransactions)
      ),
    [filteredTransactions]
  );

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
        { text: "Cancel", style: "cancel" },
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
          <Text className="text-lg">{isDark ? "💳" : "💰"}</Text>
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
        data={rows}
        keyExtractor={(row) => row.id}
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
          <View className="items-center rounded-2xl border border-gray-200 bg-white px-6 py-10 dark:border-gray-800 dark:bg-gray-900">
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
                <Text className="font-bold text-white">Add Transaction</Text>
              </Pressable>
            )}
          </View>
        }
        renderItem={({ item, index }) => {
          if (item.type === "header") {
            return (
              <Text
                className={`mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 ${
                  index === 0 ? "mt-0" : "mt-6"
                }`}
              >
                {item.label}
              </Text>
            );
          }

          const { transaction } = item;
          const isIncome = transaction.type === "income";
          const categoryColor =
            CATEGORY_COLORS[transaction.category] ?? colors.primary;

          const iconName =
            CATEGORY_ICONS[transaction.category] ?? "ellipse-outline";

          const shortDate = new Date(
            transaction.date
          ).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
          });

          return (
            <View
              className="mb-3 rounded-2xl bg-white p-4 dark:bg-gray-900"
              style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0 : 0.06,
                shadowRadius: 10,
                elevation: isDark ? 0 : 2,
                borderWidth: isDark ? 1 : 0,
                borderColor: colors.border,
              }}
            >
              <View className="flex-row items-center">
                <View
                  className="mr-3 h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: isDark
                      ? `${categoryColor}26`
                      : `${categoryColor}14`,
                  }}
                >
                  <Ionicons
                    name={iconName}
                    size={22}
                    color={categoryColor}
                  />
                </View>

                <View className="flex-1 pr-2">
                  <Text
                    className="text-base font-bold text-gray-950 dark:text-white"
                    numberOfLines={1}
                  >
                    {transaction.category}
                  </Text>

                  <Text
                    className="mt-0.5 text-sm text-gray-500 dark:text-gray-400"
                    numberOfLines={1}
                  >
                    {transaction.description || "No description"}
                  </Text>
                </View>

                <View className="items-end">
                  <Text
                    className={`text-base font-bold ${
                      isIncome
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </Text>

                  <Text className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {shortDate}
                  </Text>
                </View>
              </View>

              <View className="mt-3 flex-row justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                <Pressable
                  className="h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950"
                  onPress={() =>
                    router.push({
                      pathname: "/edit-transaction",
                      params: { id: transaction.id },
                    })
                  }
                >
                  <Ionicons
                    name="pencil-outline"
                    size={16}
                    color={isDark ? "#60A5FA" : "#2563EB"}
                  />
                </Pressable>

                <Pressable
                  className="h-9 w-9 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950"
                  onPress={() => handleDelete(transaction.id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={isDark ? "#F87171" : "#DC2626"}
                  />
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}