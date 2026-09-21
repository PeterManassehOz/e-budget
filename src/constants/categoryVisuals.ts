// constants/categoryVisuals.ts
import { Ionicons } from "@expo/vector-icons";

export const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
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

export const CATEGORY_COLORS: Record<string, string> = {
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

export function getCategoryIcon(
  category: string
): keyof typeof Ionicons.glyphMap {
  return CATEGORY_ICONS[category] ?? "ellipse-outline";
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "#4B5563";
}