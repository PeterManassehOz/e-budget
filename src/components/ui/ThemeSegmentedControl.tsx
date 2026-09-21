// components/ui/ThemeSegmentedControl.tsx
import { useTheme, type ThemePreference } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

const OPTIONS: {
  value: ThemePreference;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "system", icon: "phone-portrait-outline" },
  { value: "light", icon: "sunny-outline" },
  { value: "dark", icon: "moon-outline" },
];

export default function ThemeSegmentedControl() {
  const { themePreference, setThemePreference, isDark, colors } = useTheme();

  return (
    <View
      className="flex-row self-start rounded-2xl p-1"
      style={{ backgroundColor: colors.surfaceSecondary }}
    >
      {OPTIONS.map((option) => {
        const isSelected = themePreference === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => setThemePreference(option.value)}
            className="h-9 w-9 items-center justify-center rounded-xl"
            style={{
              backgroundColor: isSelected ? colors.primary : "transparent",
            }}
          >
            <Ionicons
              name={option.icon}
              size={17}
              color={
                isSelected
                  ? "#FFFFFF"
                  : isDark
                    ? colors.textMuted
                    : colors.textSecondary
              }
            />
          </Pressable>
        );
      })}
    </View>
  );
}