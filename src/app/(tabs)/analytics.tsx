import SelectField from "@/components/ui/SelectField";
import { getCategoryColor, getCategoryIcon } from "@/constants/categoryVisuals";
import { useTheme } from "@/context/ThemeContext";
import { TransactionContext } from "@/context/TransactionContext";
import { formatCurrency } from "@/utils/currency";
import {
  filterTransactionsByDateRange,
  getDateRangeStart,
  type AnalyticsDateRange,
} from "@/utils/dateRange";
import {
  calculateAverageTransaction,
  calculateCategoryTotals,
  calculateDailyTrend,
  calculateMonthlyTrend,
  calculateTotalExpenses,
  calculateTotalIncome,
} from "@/utils/transactionAnalytics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useContext, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { PieChart as DonutChart } from "react-native-gifted-charts";

function cardShadow(isDark: boolean, borderColor: string) {
  return {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0 : 0.06,
    shadowRadius: 10,
    elevation: isDark ? 0 : 2,
    borderWidth: isDark ? 1 : 0,
    borderColor,
  };
}

export default function AnalyticsScreen() {
  const { isDark, colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 48;

  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error("AnalyticsScreen must be used inside TransactionProvider");
  }

  const { transactions } = context;

  const [dateRange, setDateRange] = useState<AnalyticsDateRange>("thisMonth");
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);

    // No backend to re-sync — transactions come from local AsyncStorage
    // via TransactionContext — so this is a deliberate brief pause rather
    // than a real fetch, matching the pattern used on the Home screen.
    setTimeout(() => setIsRefreshing(false), 600);
  }, []);

  const dateRangeOptions: { label: string; value: AnalyticsDateRange }[] = [
    { label: "7 Days", value: "7days" },
    { label: "30 Days", value: "30days" },
    { label: "This Month", value: "thisMonth" },
    { label: "All Time", value: "allTime" },
  ];

  const filteredTransactions = filterTransactionsByDateRange(
    transactions,
    dateRange
  );

  const trendStartDate = getDateRangeStart(dateRange);
  const dailyTrend = calculateDailyTrend(filteredTransactions, trendStartDate);
  const monthlyTrend = calculateMonthlyTrend(filteredTransactions);
  const trendData = dateRange === "allTime" ? monthlyTrend : dailyTrend;

  const trendChartData = {
    labels: trendData.map((item, index) => {
      if (dateRange === "allTime") {
        const [year, month] = item.date.split("-");
        return index % 2 === 0 || index === trendData.length - 1
          ? `${month}/${year.slice(2)}`
          : "";
      }

      const date = new Date(`${item.date}T00:00:00`);

      if (dateRange === "7days") {
        return index % 2 === 0 || index === trendData.length - 1
          ? date.getDate().toString()
          : "";
      }

      return index % 7 === 0 || index === trendData.length - 2
        ? date.toLocaleDateString("en-NG", { month: "short", day: "numeric" })
        : "";
    }),
    datasets: [
      { data: trendData.map((item) => item.income), color: () => "#16A34A" },
      { data: trendData.map((item) => item.expenses), color: () => "#DC2626" },
    ],
  };

  const totalIncome = calculateTotalIncome(filteredTransactions);
  const totalExpenses = calculateTotalExpenses(filteredTransactions);
  const balance = totalIncome - totalExpenses;
  const totalTransactions = filteredTransactions.length;

  const expenseTransactionCount = filteredTransactions.filter(
    (transaction) => transaction.type === "expense"
  ).length;

  const averageIncome = calculateAverageTransaction(
    filteredTransactions,
    "income"
  );
  const averageExpense = calculateAverageTransaction(
    filteredTransactions,
    "expense"
  );

  const expensePercentage =
    totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  const categoryTotals = calculateCategoryTotals(filteredTransactions);

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // `focused` on the selected index makes that slice pop out slightly,
  // matching how the reference highlights one category at a time.
  const donutData = categoryBreakdown.map((item, index) => ({
    value: item.amount,
    color: getCategoryColor(item.category),
    focused: index === selectedCategoryIndex,
  }));

  const chartBackground = isDark ? "#111827" : "#FFFFFF";
  const chartLabelColor = isDark ? "#CBD5E1" : "#374151";

  return (
    <ScrollView
      className="flex-1 bg-gray-50 px-6 dark:bg-gray-950"
      contentContainerClassName="pt-12 pb-[110px]"
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
            Your Insights
          </Text>

          <Text className="mt-2 text-base leading-6 text-gray-500 dark:text-gray-400">
            Understand your spending and income.
          </Text>
        </View>

        <View className="ml-2 h-11 w-11 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <Text className="text-lg">{isDark ? "📊" : "📈"}</Text>
        </View>
      </View>

      <View className="mt-6">
        <SelectField
          label="Date Range"
          value={dateRange}
          options={dateRangeOptions}
          onChange={(value) => setDateRange(value as AnalyticsDateRange)}
        />
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
                  Balance
                </Text>

                <Text className="mt-1 text-sm text-white/60">
                  Selected period
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
                  ? "Income is currently above expenses"
                  : "Expenses are currently above income"}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View className="mt-5 flex-row gap-3">
        <View
          className="flex-1 rounded-2xl bg-white p-5 dark:bg-gray-900"
          style={cardShadow(isDark, colors.border)}
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
          style={cardShadow(isDark, colors.border)}
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

      <View
        className="mt-6 rounded-2xl bg-white p-5 dark:bg-gray-900"
        style={cardShadow(isDark, colors.border)}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold text-gray-950 dark:text-white">
              Spending Overview
            </Text>

            <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Expenses compared with income
            </Text>
          </View>

          <View className="rounded-xl bg-red-50 px-3 py-2 dark:bg-red-950">
            <Text className="text-sm font-bold text-red-600 dark:text-red-400">
              {expensePercentage.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View className="mt-5 h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <View
            className="h-full rounded-full bg-red-500"
            style={{ width: `${Math.min(expensePercentage, 100)}%` }}
          />
        </View>
      </View>

      <View className="mt-8">
        <Text className="text-xl font-bold text-gray-950 dark:text-white">
          Income vs Expenses
        </Text>

        <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {dateRange === "allTime"
            ? "Monthly activity for all recorded transactions."
            : "Daily activity for the selected period."}
        </Text>

        {filteredTransactions.length === 0 ? (
          <View
            className="mt-4 items-center rounded-2xl bg-white px-6 py-10 dark:bg-gray-900"
            style={cardShadow(isDark, colors.border)}
          >
            <View className="h-14 w-14 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
              <Ionicons
                name="trending-up-outline"
                size={24}
                color={isDark ? "#60A5FA" : "#2563EB"}
              />
            </View>

            <Text className="mt-5 text-lg font-bold text-gray-950 dark:text-white">
              No activity yet
            </Text>

            <Text className="mt-2 text-center text-base leading-6 text-gray-500 dark:text-gray-400">
              Add transactions to see your income and expense trend.
            </Text>
          </View>
        ) : (
          <View
            className="mt-4 overflow-hidden rounded-2xl bg-white dark:bg-gray-900"
            style={cardShadow(isDark, colors.border)}
          >
            <View className="flex-row items-center justify-between px-5 pt-5">
              <View className="flex-row items-center">
                <View className="h-2.5 w-2.5 rounded-full bg-green-600" />
                <Text className="ml-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Income
                </Text>
              </View>

              <View className="flex-row items-center">
                <View className="h-2.5 w-2.5 rounded-full bg-red-600" />
                <Text className="ml-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Expenses
                </Text>
              </View>
            </View>

            <View className="mt-4">
              <LineChart
                data={trendChartData}
                width={chartWidth}
                height={240}
                chartConfig={{
                  backgroundColor: chartBackground,
                  backgroundGradientFrom: chartBackground,
                  backgroundGradientTo: chartBackground,
                  decimalPlaces: 0,
                  color: () => (isDark ? "#60A5FA" : "#2563EB"),
                  labelColor: () => chartLabelColor,
                  propsForDots: { r: "3" },
                  propsForBackgroundLines: {
                    stroke: isDark ? "#273449" : "#E5E7EB",
                  },
                }}
                bezier
                fromZero
                yAxisLabel="₦"
                yAxisSuffix=""
                formatYLabel={(value) =>
                  Number(value).toLocaleString("en-NG")
                }
                withInnerLines
                withOuterLines={false}
                withDots
                withShadow
              />
            </View>
          </View>
        )}
      </View>

      {/* Expenses by Category — donut + legend, matching the reference */}
      <View className="mt-8">
        <Text className="text-xl font-bold text-gray-950 dark:text-white">
          Expenses by Category
        </Text>

        <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          See where your money is going.
        </Text>

        {categoryBreakdown.length === 0 ? (
          <View
            className="mt-4 items-center rounded-2xl bg-white px-6 py-10 dark:bg-gray-900"
            style={cardShadow(isDark, colors.border)}
          >
            <View className="h-14 w-14 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
              <Ionicons
                name="pie-chart-outline"
                size={24}
                color={isDark ? "#60A5FA" : "#2563EB"}
              />
            </View>

            <Text className="mt-5 text-lg font-bold text-gray-950 dark:text-white">
              No categories yet
            </Text>

            <Text className="mt-2 text-center text-base leading-6 text-gray-500 dark:text-gray-400">
              Your expense categories will appear here.
            </Text>
          </View>
        ) : (
          <View
            className="mt-4 overflow-hidden rounded-2xl bg-white dark:bg-gray-900"
            style={cardShadow(isDark, colors.border)}
          >
            <View className="items-center px-5 pt-6">
              <DonutChart
                data={donutData}
                donut
                radius={90}
                innerRadius={50}
                innerCircleColor={chartBackground}
                strokeWidth={2}
                strokeColor={chartBackground}
                sectionAutoFocus
                extraRadius={6}
                onPress={(_item: unknown, index: number) =>
                  setSelectedCategoryIndex(index)
                }
                centerLabelComponent={() => (
                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 30,
                        fontWeight: "700",
                        color: isDark ? "#FFFFFF" : "#0F172A",
                      }}
                    >
                      {expenseTransactionCount}
                    </Text>

                    <Text
                      style={{
                        marginTop: 2,
                        fontSize: 13,
                        color: chartLabelColor,
                      }}
                    >
                      Expenses
                    </Text>
                  </View>
                )}
              />
            </View>

            {/* Legend — tapping a row also selects/focuses its slice */}
            <View className="mt-6 px-5 pb-5">
              {categoryBreakdown.map((item, index) => {
                const categoryColor = getCategoryColor(item.category);
                const isSelected = index === selectedCategoryIndex;

                return (
                  <Pressable
                    key={item.category}
                    className="mb-2 flex-row items-center rounded-xl px-3 py-3 last:mb-0"
                    style={{
                      backgroundColor: isSelected
                        ? categoryColor
                        : "transparent",
                    }}
                    onPress={() => setSelectedCategoryIndex(index)}
                  >
                    <View
                      className="mr-3 h-3 w-3 rounded-sm"
                      style={{
                        backgroundColor: isSelected
                          ? "#FFFFFF"
                          : categoryColor,
                      }}
                    />

                    <Text
                      className="flex-1 text-base font-semibold"
                      style={{
                        color: isSelected
                          ? "#FFFFFF"
                          : isDark
                            ? "#F8FAFC"
                            : "#0F172A",
                      }}
                    >
                      {item.category}
                    </Text>

                    <Text
                      className="text-sm font-semibold"
                      style={{
                        color: isSelected
                          ? "#FFFFFF"
                          : isDark
                            ? "#94A3B8"
                            : "#64748B",
                      }}
                    >
                      {formatCurrency(item.amount)} · {item.percentage.toFixed(0)}%
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Detailed breakdown with icons + progress bars — kept as a deeper
          view beneath the at-a-glance donut+legend above */}
      {categoryBreakdown.length > 0 && (
        <View className="mt-4">
          <View
            className="rounded-2xl bg-white p-5 dark:bg-gray-900"
            style={cardShadow(isDark, colors.border)}
          >
            {categoryBreakdown.map((item) => {
              const categoryColor = getCategoryColor(item.category);

              return (
                <View key={item.category} className="mb-5 last:mb-0">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center">
                      <View
                        className="mr-3 h-9 w-9 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: isDark
                            ? `${categoryColor}26`
                            : `${categoryColor}14`,
                        }}
                      >
                        <Ionicons
                          name={getCategoryIcon(item.category)}
                          size={16}
                          color={categoryColor}
                        />
                      </View>

                      <Text className="flex-1 text-base font-semibold text-gray-950 dark:text-white">
                        {item.category}
                      </Text>
                    </View>

                    <Text className="ml-3 text-base font-bold text-gray-950 dark:text-white">
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>

                  <View className="mt-2 flex-row items-center justify-between">
                    <View className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: categoryColor,
                        }}
                      />
                    </View>

                    <Text className="ml-3 w-14 text-right text-sm text-gray-500 dark:text-gray-400">
                      {item.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View className="mt-8">
        <Text className="text-xl font-bold text-gray-950 dark:text-white">
          Transaction Statistics
        </Text>

        <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          A quick summary of your activity.
        </Text>

        <View
          className="mt-4 rounded-2xl bg-white p-5 dark:bg-gray-900"
          style={cardShadow(isDark, colors.border)}
        >
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
              <Ionicons
                name="albums-outline"
                size={18}
                color={isDark ? "#60A5FA" : "#2563EB"}
              />
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Total transactions
              </Text>

              <Text className="mt-1 text-xl font-bold text-gray-950 dark:text-white">
                {totalTransactions}
              </Text>
            </View>
          </View>

          <View className="my-5 h-px bg-gray-100 dark:bg-gray-800" />

          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950">
              <Ionicons
                name="arrow-up"
                size={18}
                color={isDark ? "#4ADE80" : "#16A34A"}
              />
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Average income
              </Text>

              <Text className="mt-1 text-xl font-bold text-gray-950 dark:text-white">
                {formatCurrency(averageIncome)}
              </Text>
            </View>
          </View>

          <View className="my-5 h-px bg-gray-100 dark:bg-gray-800" />

          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950">
              <Ionicons
                name="arrow-down"
                size={18}
                color={isDark ? "#F87171" : "#DC2626"}
              />
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Average expense
              </Text>

              <Text className="mt-1 text-xl font-bold text-gray-950 dark:text-white">
                {formatCurrency(averageExpense)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {filteredTransactions.length === 0 && (
        <View className="mt-6 overflow-hidden rounded-2xl">
          <LinearGradient
            colors={
              isDark ? ["#111827", "#172554"] : ["#EFF6FF", "#EEF2FF"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="overflow-hidden rounded-2xl"
          >
            <View className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/10" />

            <View className="relative items-center p-6">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Ionicons
                  name="add"
                  size={22}
                  color={isDark ? "#93C5FD" : "#2563EB"}
                />
              </View>

              <Text className="mt-4 text-lg font-bold text-gray-950 dark:text-white">
                Start tracking your money
              </Text>

              <Text className="mt-2 text-center text-sm leading-5 text-gray-500 dark:text-gray-400">
                Add your first transaction to unlock your financial insights
                and spending trends.
              </Text>
            </View>
          </LinearGradient>
        </View>
      )}
    </ScrollView>
  );
}