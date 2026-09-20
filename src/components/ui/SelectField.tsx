import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
};

export default function SelectField({
  label,
  value,
  options,
  onChange,
  error,
}: SelectFieldProps) {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <View>
      <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300">
        {label}
      </Text>

      <Pressable
        className={`mt-2 flex-row items-center rounded-xl border px-4 py-4 ${
          error
            ? "border-red-500 bg-white dark:bg-gray-900"
            : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
        }`}
        onPress={() => setIsOpen(true)}
      >
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">
            {selectedOption?.label ?? "Select an option"}
          </Text>
        </View>

        <View className="ml-3 h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <Ionicons
            name="chevron-down"
            size={18}
            color={isDark ? "#CBD5E1" : "#4B5563"}
          />
        </View>
      </Pressable>

      {error && (
        <Text className="mt-2 text-sm text-red-500">
          {error}
        </Text>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Pressable
            className="flex-1"
            onPress={() => setIsOpen(false)}
          />

          <View className="rounded-t-[32px] bg-white px-6 pb-8 pt-3 dark:bg-gray-900">
            <View className="mb-5 items-center">
              <View className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
            </View>

            <View className="mb-5 flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  {label}
                </Text>

                <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Select an option
                </Text>
              </View>

              <Pressable
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
                onPress={() => setIsOpen(false)}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={isDark ? "#E2E8F0" : "#374151"}
                />
              </Pressable>
            </View>

            <ScrollView
              className="max-h-[420px]"
              showsVerticalScrollIndicator={false}
            >
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <Pressable
                    key={option.value}
                    className={`mb-2 flex-row items-center rounded-xl border px-4 py-4 ${
                      isSelected
                        ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950"
                        : "border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800"
                    }`}
                    onPress={() =>
                      handleSelect(option.value)
                    }
                  >
                    <View
                      className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${
                        isSelected
                          ? "bg-blue-600"
                          : "bg-white dark:bg-gray-700"
                      }`}
                    >
                      <Ionicons
                        name={
                          isSelected
                            ? "checkmark"
                            : "ellipse-outline"
                        }
                        size={20}
                        color={
                          isSelected
                            ? "#FFFFFF"
                            : isDark
                              ? "#94A3B8"
                              : "#9CA3AF"
                        }
                      />
                    </View>

                    <Text
                      className={`flex-1 text-base ${
                        isSelected
                          ? "font-bold text-blue-700 dark:text-blue-300"
                          : "font-medium text-gray-800 dark:text-gray-100"
                      }`}
                    >
                      {option.label}
                    </Text>

                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#2563EB"
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}