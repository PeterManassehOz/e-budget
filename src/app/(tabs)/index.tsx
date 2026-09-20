import AppearanceSelector from "@/components/ui/AppearanceSelector";
import { useTheme } from "@/context/ThemeContext";
import { TransactionContext } from "@/context/TransactionContext";
import { formatCurrency } from "@/utils/currency";
import {
  calculateTotalExpenses,
  calculateTotalIncome,
  sortTransactionsByDate
} from "@/utils/transactionAnalytics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useContext } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error(
      "HomeScreen must be used inside TransactionProvider"
    );
  }

  const { transactions } = context;

  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);
  const balance = totalIncome - totalExpenses;

  const recentTransactions = sortTransactionsByDate(
    transactions
  ).slice(0, 5);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView
        className="flex-1 bg-gray-50 px-6 dark:bg-gray-950"
        contentContainerClassName="pt-12 pb-28"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-3xl font-bold text-gray-950 dark:text-white">
              PocketBudget
            </Text>

            <Text className="mt-2 text-base leading-6 text-gray-500 dark:text-gray-400">
              Take control of your money.
            </Text>
          </View>

          <View className="ml-2 h-11 w-11 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Text className="text-lg">
              {isDark ? "🌙" : "☀️"}
            </Text>
          </View>
        </View>

        <View className="mt-6">
          <AppearanceSelector />
        </View>

        <View className="mt-8 overflow-hidden rounded-xl">
          <LinearGradient
            colors={
              isDark
                ? ["#0B1220", "#172554", "#312E81"]
                : ["#0F1F4D", "#2563EB", "#4F46E5"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="overflow-hidden rounded-xl"
          >
            {/* Decorative background */}
            <View className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />

            <View className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-indigo-300/10" />

            <View className="absolute right-12 top-20 h-24 w-24 rounded-full bg-blue-300/5" />

            {/* Subtle shine */}
            <View className="absolute left-0 right-0 top-0 h-24 bg-white/5" />

            {/* Content */}
            <View className="relative p-6">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-blue-100/80">
                    Available Balance
                  </Text>

                  <Text className="mt-1 text-sm text-white/60">
                    Current total
                  </Text>
                </View>

                <View className="h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10">
                  <Text className="text-lg text-white">
                    {balance >= 0 ? "↗" : "↘"}
                  </Text>
                </View>
              </View>

              <Text className="mt-6 text-4xl font-bold tracking-tight text-white">
                {formatCurrency(balance)}
              </Text>

              <View className="mt-6 h-px bg-white/10" />

              <View className="mt-5 flex-row items-center">
                <View className="h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                  <Text className="text-sm font-bold text-white">
                    {balance >= 0 ? "↑" : "↓"}
                  </Text>
                </View>

                <Text className="ml-3 flex-1 text-sm leading-5 text-blue-100/90">
                  {balance >= 0
                    ? "You're currently in positive balance"
                    : "Your expenses are currently above your income"}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Income / Expenses */}
        <View className="mt-5 flex-row gap-3">
          <View className="flex-1 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Income
              </Text>

              <View className="h-9 w-9 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950">
                <Text className="text-base font-bold text-green-600 dark:text-green-400">
                  ↑
                </Text>
              </View>
            </View>

            <Text className="mt-5 text-xl font-bold text-gray-950 dark:text-white">
              {formatCurrency(totalIncome)}
            </Text>

            <Text className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Total income
            </Text>
          </View>

          <View className="flex-1 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Expenses
              </Text>

              <View className="h-9 w-9 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950">
                <Text className="text-base font-bold text-red-600 dark:text-red-400">
                  ↓
                </Text>
              </View>
            </View>

            <Text className="mt-5 text-xl font-bold text-gray-950 dark:text-white">
              {formatCurrency(totalExpenses)}
            </Text>

            <Text className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Total expenses
            </Text>
          </View>
        </View>

        <Pressable
          className="mt-6 flex-row items-center justify-center rounded-xl bg-blue-800 py-4 dark:bg-blue-900 px-6 py-4"
          onPress={() => router.push("/add-transaction")}
        >
          <Text className="mr-2 text-lg font-bold text-white">
            +
          </Text>

          <Text className="text-base font-bold text-white">
            Add Transaction
          </Text>
        </Pressable>

        <View className="mt-8 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-950 dark:text-white">
            Recent Transactions
          </Text>

          {transactions.length > 0 && (
            <Pressable
              onPress={() => router.push("/(tabs)/transactions")}
            >
              <Text className="font-semibold text-blue-600 dark:text-blue-400">
                See all
              </Text>
            </Pressable>
          )}
        </View>

        {recentTransactions.length === 0 ? (
          <View className="mt-4 rounded-xl border border-gray-200 p-6 dark:border-gray-800">
            <Text className="text-center text-base text-gray-500 dark:text-gray-400">
              Your recent transactions will appear here.
            </Text>
          </View>
        ) : (
          <View className="mt-4">
            {recentTransactions.map((transaction) => {
              const isIncome = transaction.type === "income";

              const formattedDate = new Date(
                transaction.date
              ).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
              });

              return (
                <Pressable
                  key={transaction.id}
                  className="mb-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                  onPress={() =>
                    router.push({
                      pathname: "/edit-transaction",
                      params: {
                        id: transaction.id,
                      },
                    })
                  }
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-4">
                      <Text className="text-base font-bold text-gray-950 dark:text-white">
                        {transaction.category}
                      </Text>

                      <Text
                        className="mt-1 text-sm text-gray-500 dark:text-gray-400"
                        numberOfLines={1}
                      >
                        {transaction.description ||
                          "No description"}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text
                        className={`text-base font-bold ${
                          isIncome
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </Text>

                      <Text className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        {formattedDate}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}