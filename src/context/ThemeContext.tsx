import {
  darkColors,
  lightColors,
} from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";





export type ThemePreference = "system" | "light" | "dark";

type ThemeContextType = {
  themePreference: ThemePreference;
  isDark: boolean;
  colors: typeof lightColors;
  setThemePreference: (preference: ThemePreference) => void;
};

const THEME_STORAGE_KEY = "@pocketbudget/theme";

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const {
    colorScheme: systemColorScheme,
    setColorScheme,
  } = useColorScheme();

  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("system");

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedPreference =
          await AsyncStorage.getItem(THEME_STORAGE_KEY);

       if (
          storedPreference === "system" ||
          storedPreference === "light" ||
          storedPreference === "dark"
        ) {
          setThemePreferenceState(storedPreference);

          setColorScheme(
            storedPreference === "system"
              ? "system"
              : storedPreference
          );
        }
      } catch (error) {
        console.error(
          "Failed to load theme preference:",
          error
        );
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemePreference();
  }, []);

  const setThemePreference = (
    preference: ThemePreference
  ) => {
    setThemePreferenceState(preference);

    setColorScheme(
      preference === "system"
        ? "system"
        : preference
    );
  };

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem(
          THEME_STORAGE_KEY,
          themePreference
        );
      } catch (error) {
        console.error(
          "Failed to save theme preference:",
          error
        );
      }
    };

    saveThemePreference();
  }, [themePreference, isLoaded]);

  const isDark =
    themePreference === "dark" ||
    (themePreference === "system" &&
      systemColorScheme === "dark");

  const colors = isDark
  ? darkColors
  : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        isDark,
        colors,
        setThemePreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}