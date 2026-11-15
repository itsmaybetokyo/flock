import { MOBILE_DEFAULT_THEME_ID } from "@t3tools/shared/themePalettes";

import { FLOCK_ACCENT, FLOCK_ACCENT_INK } from "./flockTheme";
import {
  themeAccentWithContrast,
  type MobileThemeAppearance,
  type MobileThemeId,
  type MobileThemeVariables,
} from "./mobileTheme";

/**
 * Fork: paints the Flock accent over the default palette. The compiled theme variants stay
 * upstream's, so this lands on the runtime variables the app applies, as Material You does.
 */
export function withFlockAccent(
  variables: MobileThemeVariables,
  themeId: MobileThemeId,
  appearance: MobileThemeAppearance,
): MobileThemeVariables {
  if (themeId !== MOBILE_DEFAULT_THEME_ID) return variables;

  const accentText = themeAccentWithContrast(FLOCK_ACCENT, [
    variables["--color-screen"],
    variables["--color-card"],
    variables["--color-card-alt"],
    variables["--color-sheet-solid"],
    variables["--color-grouped-card"],
  ]);

  return {
    ...variables,
    "--color-primary": FLOCK_ACCENT,
    "--color-primary-foreground": FLOCK_ACCENT_INK,
    "--color-primary-text": accentText,
    "--color-focus": accentText,
    "--color-md-link": themeAccentWithContrast(FLOCK_ACCENT, [variables["--color-screen"]]),
    "--color-switch-active-track": FLOCK_ACCENT,
    "--color-switch-active-thumb": FLOCK_ACCENT_INK,
    "--color-user-bubble-skill-foreground": themeAccentWithContrast(FLOCK_ACCENT, [
      variables["--color-user-bubble"],
    ]),
    "--color-update": FLOCK_ACCENT,
    "--color-update-foreground": FLOCK_ACCENT_INK,
  };
}
