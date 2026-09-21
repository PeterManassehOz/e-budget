import SelectField from "@/components/ui/SelectField";
import { useTheme } from "@/context/ThemeContext";
import { TransactionContext } from "@/context/TransactionContext";
import type {
  TransactionCategory,
  TransactionType,
} from "@/types/transaction";
import {
  expenseCategories,
  incomeCategories,
} from "@/types/transaction";
import { createTransaction } from "@/utils/transactionFactory";
import {
  validateTransactionForm,
  type TransactionFormErrors,
} from "@/utils/transactionValidation";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const BASE_BOTTOM_PADDING = 24;

export default function EditTransactionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();
  const context = useContext(TransactionContext);

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const keyboardHeightRef = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  if (!context) {
    throw new Error(
      "EditTransactionScreen must be used inside TransactionProvider"
    );
  }

  const { transactions, updateTransaction } = context;

  const transaction = transactions.find((item) => item.id === id);

  const [transactionType, setTransactionType] =
    useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("Food");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<TransactionFormErrors>({});

  const availableCategories =
    transactionType === "income" ? incomeCategories : expenseCategories;

  useEffect(() => {
    if (!transaction) {
      return;
    }

    setTransactionType(transaction.type);
    setAmount(transaction.amount.toString());
    setCategory(transaction.category);
    setDescription(transaction.description);
    setTransactionDate(new Date(transaction.date));
  }, [transaction]);

  useEffect(() => {
    const categories =
      transactionType === "income" ? incomeCategories : expenseCategories;

    const firstCategory = categories[0];

    if (!categories.includes(category) && firstCategory) {
      setCategory(firstCategory);
    }
  }, [transactionType, category]);

  // Moved above the early "not found" return so this hook always runs in
  // the same order, regardless of whether `transaction` exists yet.
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
        scrollViewRef.current?.scrollTo({
          y: scrollOffsetRef.current + height,
          animated: true,
        });
      });
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      const height = keyboardHeightRef.current;

      keyboardHeightRef.current = 0;

      scrollViewRef.current?.scrollTo({
        y: Math.max(0, scrollOffsetRef.current - height),
        animated: true,
      });

      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (!transaction) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6 dark:bg-gray-950">
        <View className="w-full rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <Text className="text-center text-xl font-bold text-gray-950 dark:text-white">
            Transaction not found
          </Text>

          <Text
            className="mt-3 text-center text-base font-semibold text-blue-600 dark:text-blue-400"
            onPress={() => router.back()}
          >
            Go back
          </Text>
        </View>
      </View>
    );
  }

  const handleUpdate = () => {
    const validationErrors = validateTransactionForm({
      amount,
      type: transactionType,
      category,
      date: transactionDate,
    });

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const numericAmount = Number(amount);

    const updatedTransaction = createTransaction({
      type: transactionType,
      amount: numericAmount,
      category,
      description,
      date: transactionDate,
    });

    updateTransaction({
      ...updatedTransaction,
      id: transaction.id,
      createdAt: transaction.createdAt,
    });

    router.back();
  };

  const clearAmountError = () => {
    if (errors.amount) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        amount: undefined,
      }));
    }
  };

  const clearDateError = () => {
    if (errors.date) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        date: undefined,
      }));
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{
          paddingBottom:
            keyboardHeight > 0
              ? keyboardHeight + BASE_BOTTOM_PADDING
              : BASE_BOTTOM_PADDING,
          paddingHorizontal: 24,
          paddingTop: 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        <View>
          <Text className="text-3xl font-bold text-gray-950 dark:text-white">
            Edit Transaction
          </Text>

          <Text className="mt-2 text-base leading-6 text-gray-500 dark:text-gray-400">
            Update your transaction details.
          </Text>
        </View>

        {/* TRANSACTION TYPE */}
        <View className="mt-8">
          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            Transaction Type
          </Text>

          <View className="mt-3 flex-row gap-3">
            <Pressable
              className={`flex-1 rounded-2xl border px-4 py-4 ${
                transactionType === "income"
                  ? "border-green-600 bg-green-600"
                  : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              }`}
              onPress={() => setTransactionType("income")}
            >
              <View className="flex-row items-center justify-center">
                <View
                  className={`mr-2 h-7 w-7 items-center justify-center rounded-xl ${
                    transactionType === "income"
                      ? "bg-white/15"
                      : "bg-green-50 dark:bg-green-950"
                  }`}
                >
                  <Ionicons
                    name="arrow-up"
                    size={14}
                    color={
                      transactionType === "income"
                        ? "#FFFFFF"
                        : isDark
                          ? "#4ADE80"
                          : "#16A34A"
                    }
                  />
                </View>

                <Text
                  className={`font-bold ${
                    transactionType === "income"
                      ? "text-white"
                      : "text-gray-800 dark:text-gray-100"
                  }`}
                >
                  Income
                </Text>
              </View>
            </Pressable>

            <Pressable
              className={`flex-1 rounded-2xl border px-4 py-4 ${
                transactionType === "expense"
                  ? "border-red-600 bg-red-600"
                  : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              }`}
              onPress={() => setTransactionType("expense")}
            >
              <View className="flex-row items-center justify-center">
                <View
                  className={`mr-2 h-7 w-7 items-center justify-center rounded-xl ${
                    transactionType === "expense"
                      ? "bg-white/15"
                      : "bg-red-50 dark:bg-red-950"
                  }`}
                >
                  <Ionicons
                    name="arrow-down"
                    size={14}
                    color={
                      transactionType === "expense"
                        ? "#FFFFFF"
                        : isDark
                          ? "#F87171"
                          : "#DC2626"
                    }
                  />
                </View>

                <Text
                  className={`font-bold ${
                    transactionType === "expense"
                      ? "text-white"
                      : "text-gray-800 dark:text-gray-100"
                  }`}
                >
                  Expense
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* AMOUNT */}
        <View className="mt-8">
          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            Amount
          </Text>

          <TextInput
            className={`mt-3 rounded-2xl border bg-white px-4 py-4 text-lg font-semibold text-gray-950 dark:bg-gray-900 dark:text-white ${
              errors.amount
                ? "border-red-500"
                : "border-gray-200 dark:border-gray-800"
            }`}
            placeholder="0.00"
            placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
            value={amount}
            onChangeText={(value) => {
              setAmount(value);
              clearAmountError();
            }}
            keyboardType="decimal-pad"
          />

          {errors.amount && (
            <Text className="mt-2 text-sm text-red-500">
              {errors.amount}
            </Text>
          )}
        </View>

        {/* DATE */}
        <View className="mt-8">
          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            Date
          </Text>

          <Pressable
            className={`mt-3 flex-row items-center rounded-2xl border bg-white px-4 py-4 dark:bg-gray-900 ${
              errors.date
                ? "border-red-500"
                : "border-gray-200 dark:border-gray-800"
            }`}
            onPress={() => setShowDatePicker(true)}
          >
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
              <Ionicons
                name="calendar-outline"
                size={16}
                color={isDark ? "#60A5FA" : "#2563EB"}
              />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-gray-950 dark:text-white">
                {transactionDate.toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>

              <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Select the transaction date
              </Text>
            </View>
          </Pressable>

          {errors.date && (
            <Text className="mt-2 text-sm text-red-500">{errors.date}</Text>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={transactionDate}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onValueChange={(event, selectedDate) => {
                setShowDatePicker(false);

                if (selectedDate) {
                  setTransactionDate(selectedDate);
                  clearDateError();
                }
              }}
            />
          )}
        </View>

        {/* CATEGORY */}
        <View className="mt-8">
          <SelectField
            label="Category"
            value={category}
            options={availableCategories.map((item) => ({
              label: item,
              value: item,
            }))}
            onChange={(value) => {
              setCategory(value as TransactionCategory);

              if (errors.category) {
                setErrors((currentErrors) => ({
                  ...currentErrors,
                  category: undefined,
                }));
              }
            }}
            error={errors.category}
          />
        </View>

        {/* DESCRIPTION */}
        <View className="mt-8">
          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            Description
          </Text>

          <TextInput
            className="mt-3 min-h-[110px] rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base leading-6 text-gray-950 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            placeholder="What was this transaction for?"
            placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* UPDATE */}
        <Pressable
          className="mt-6 flex-row items-center justify-center rounded-2xl bg-blue-800 py-4 dark:bg-blue-900"
          onPress={handleUpdate}
        >
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />

          <Text className="ml-2 text-center text-base font-bold text-white">
            Update Transaction
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}