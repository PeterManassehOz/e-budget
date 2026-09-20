import { ThemeProvider as AppThemeProvider, useTheme } from "@/context/ThemeContext";
import { TransactionProvider } from "@/context/TransactionContext";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import "../global.css";

function AppNavigator() {
  const { isDark, colors } = useTheme();


  
  return (
    <ThemeProvider
      value={isDark ? DarkTheme : DefaultTheme}
    >
      <TransactionProvider>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="add-transaction"
            options={{
              title: "Add Transaction",
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.textPrimary,
              headerShadowVisible: false,
            }}
          />

          <Stack.Screen
            name="edit-transaction"
            options={{
              title: "Edit Transaction",
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.textPrimary,
              headerShadowVisible: false,
            }}
          />
        </Stack>
      </TransactionProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AppNavigator />
    </AppThemeProvider>
  );
}