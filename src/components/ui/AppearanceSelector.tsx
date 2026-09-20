import SelectField from "@/components/ui/SelectField";
import {
  useTheme,
  type ThemePreference,
} from "@/context/ThemeContext";

const appearanceOptions = [
  {
    label: "System",
    value: "system",
  },
  {
    label: "Light",
    value: "light",
  },
  {
    label: "Dark",
    value: "dark",
  },
];

export default function AppearanceSelector() {
  const {
    themePreference,
    setThemePreference,
  } = useTheme();

  return (
    <SelectField
      label="Appearance"
      value={themePreference}
      options={appearanceOptions}
      onChange={(value) =>
        setThemePreference(
          value as ThemePreference
        )
      }
    />
  );
}