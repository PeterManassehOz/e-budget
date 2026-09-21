import ThemeSegmentedControl from "@/components/ui/ThemeSegmentedControl";
import { getCategoryColor, getCategoryIcon } from "@/constants/categoryVisuals";
import { useTheme } from "@/context/ThemeContext";
import { TransactionContext } from "@/context/TransactionContext";
import { formatCurrency } from "@/utils/currency";
import {
  calculateTotalExpenses,
  calculateTotalIncome,
  sortTransactionsByDate,
} from "@/utils/transactionAnalytics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useContext, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";


function cardShadow(isDark: boolean, colors: { border: string }) {
  return {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0 : 0.06,
    shadowRadius: 10,
    elevation: isDark ? 0 : 2,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const context = useContext(TransactionContext);
  
    const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);

    // There's no real network call here — transactions live in local
    // AsyncStorage via TransactionContext, so there's nothing to re-fetch.
    // This just gives a brief, honest spinner instead of an instant snap
    // back, which is what people expect from pull-to-refresh; if you add
    // a backend sync later, replace this timeout with the actual sync call.
    setTimeout(() => setIsRefreshing(false), 600);
  }, []);


  if (!context) {
    throw new Error("HomeScreen must be used inside TransactionProvider");
  }

  const { transactions } = context;

  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);
  const balance = totalIncome - totalExpenses;

  const recentTransactions = sortTransactionsByDate(transactions).slice(0, 5);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView
        className="flex-1 bg-gray-50 px-6 dark:bg-gray-950"
        contentContainerClassName="pt-12 pb-28"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? "#60A5FA" : "#2563EB"}
            colors={[isDark ? "#60A5FA" : "#2563EB"]}
          />
        }
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
        </View>

        <View className="mt-6">
          <ThemeSegmentedControl />
        </View>

        <View className="mt-8 overflow-hidden rounded-2xl">
          <LinearGradient
            colors={
              isDark
                ? ["#0B1220", "#172554", "#312E81"]
                : ["#0F1F4D", "#2563EB", "#4F46E5"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="overflow-hidden rounded-2xl"
          >
            <View className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
            <View className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-indigo-300/10" />
            <View className="absolute right-12 top-20 h-24 w-24 rounded-full bg-blue-300/5" />
            <View className="absolute left-0 right-0 top-0 h-24 bg-white/5" />

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
                  <Ionicons
                    name={balance >= 0 ? "trending-up" : "trending-down"}
                    size={18}
                    color="#FFFFFF"
                  />
                </View>
              </View>

              <Text className="mt-6 text-4xl font-bold tracking-tight text-white">
                {formatCurrency(balance)}
              </Text>

              <View className="mt-6 h-px bg-white/10" />

              <View className="mt-5 flex-row items-center">
                <View className="h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                  <Ionicons
                    name={balance >= 0 ? "arrow-up" : "arrow-down"}
                    size={16}
                    color="#FFFFFF"
                  />
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

        <View className="mt-5 flex-row gap-3">
          <View
            className="flex-1 rounded-2xl bg-white p-5 dark:bg-gray-900"
            style={cardShadow(isDark, colors)}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Income
              </Text>

              <View className="h-9 w-9 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950">
                <Ionicons
                  name="arrow-up"
                  size={16}
                  color={isDark ? "#4ADE80" : "#16A34A"}
                />
              </View>
            </View>

            <Text className="mt-5 text-xl font-bold text-gray-950 dark:text-white">
              {formatCurrency(totalIncome)}
            </Text>

            <Text className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Total income
            </Text>
          </View>

          <View
            className="flex-1 rounded-2xl bg-white p-5 dark:bg-gray-900"
            style={cardShadow(isDark, colors)}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Expenses
              </Text>

              <View className="h-9 w-9 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950">
                <Ionicons
                  name="arrow-down"
                  size={16}
                  color={isDark ? "#F87171" : "#DC2626"}
                />
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
          className="mt-6 flex-row items-center justify-center rounded-2xl bg-blue-800 py-4 dark:bg-blue-900"
          onPress={() => router.push("/add-transaction")}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />

          <Text className="ml-2 text-base font-bold text-white">
            Add Transaction
          </Text>
        </Pressable>

        <View className="mt-8 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-950 dark:text-white">
            Recent Transactions
          </Text>

          {transactions.length > 0 && (
            <Pressable onPress={() => router.push("/(tabs)/transactions")}>
              <Text className="font-semibold text-blue-600 dark:text-blue-400">
                See all
              </Text>
            </Pressable>
          )}
        </View>

        {recentTransactions.length === 0 ? (
          <View
            className="mt-4 items-center rounded-2xl bg-white px-6 py-10 dark:bg-gray-900"
            style={cardShadow(isDark, colors)}
          >
            <View className="h-14 w-14 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
              <Ionicons
                name="receipt-outline"
                size={24}
                color={isDark ? "#60A5FA" : "#2563EB"}
              />
            </View>

            <Text className="mt-5 text-lg font-bold text-gray-950 dark:text-white">
              No transactions yet
            </Text>

            <Text className="mt-2 text-center text-base leading-6 text-gray-500 dark:text-gray-400">
              Your recent transactions will appear here once you add one.
            </Text>
          </View>
        ) : (
          <View className="mt-4">
            {recentTransactions.map((transaction) => {
              const isIncome = transaction.type === "income";
              const categoryColor = getCategoryColor(transaction.category);

              const formattedDate = new Date(
                transaction.date
              ).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
              });

              return (
                <Pressable
                  key={transaction.id}
                  className="mb-3 rounded-2xl bg-white p-4 dark:bg-gray-900"
                  style={cardShadow(isDark, colors)}
                  onPress={() =>
                    router.push({
                      pathname: "/edit-transaction",
                      params: { id: transaction.id },
                    })
                  }
                >
                  <View className="flex-row items-center">
                    <View
                      className="mr-3 h-11 w-11 items-center justify-center rounded-2xl"
                      style={{
                        backgroundColor: isDark
                          ? `${categoryColor}26`
                          : `${categoryColor}14`,
                      }}
                    >
                      <Ionicons
                        name={getCategoryIcon(transaction.category)}
                        size={20}
                        color={categoryColor}
                      />
                    </View>

                    <View className="flex-1 pr-4">
                      <Text className="text-base font-bold text-gray-950 dark:text-white">
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