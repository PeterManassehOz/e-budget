import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: "",
        headerStyle: {
          backgroundColor: colors.background,
          height: 35,
        },
        headerShadowVisible: false,
        headerTintColor: colors.textPrimary,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,

        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          position: "absolute",
          marginHorizontal: 20,
          bottom: 12,
          height: 68,

          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 20,

          paddingHorizontal: 6,
          paddingTop: 7,
          paddingBottom: 7,

          elevation: 8,

          shadowColor: "#000000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        },

        tabBarItemStyle: {
          borderRadius: 14,
          marginHorizontal: 4,
          marginVertical: 2,
        },

        tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: "600",
        marginTop: 2,
      },

      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={focused ? 24 : 22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "swap-horizontal"
                  : "swap-horizontal-outline"
              }
              size={focused ? 24 : 22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "stats-chart"
                  : "stats-chart-outline"
              }
              size={focused ? 24 : 22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}