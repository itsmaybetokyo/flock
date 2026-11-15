import type { ThemeAppearance } from "@t3tools/shared/themePalettes";
import type { ThemePreviewColors } from "@t3tools/shared/themePreview";

// Fork: the Flock icon is orange, so mobile's default palette carries that accent. Web and
// desktop keep upstream's default plus their own custom themes.
export const FLOCK_ACCENT = "#da7c5d";

/** White on the accent reaches only 3:1, so filled actions take a dark ink instead. */
export const FLOCK_ACCENT_INK = "#2b1610";

/** The settings orb draws these directly, so it matches what the runtime paints. */
export const FLOCK_PREVIEW_COLORS: Readonly<Record<ThemeAppearance, ThemePreviewColors>> = {
  light: { canvas: "#fcfcfc", accent: "#f6e0d6", messageAction: FLOCK_ACCENT },
  dark: { canvas: "#0a0a0a", accent: "#3a231b", messageAction: FLOCK_ACCENT },
};
