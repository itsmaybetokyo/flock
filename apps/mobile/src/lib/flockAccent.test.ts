import { describe, expect, it } from "vite-plus/test";

import { withFlockAccent } from "./flockAccent";
import { FLOCK_ACCENT } from "./flockTheme";
import {
  DEFAULT_MOBILE_THEME_ID,
  getMobileThemePreviewColors,
  MOBILE_THEME_IDS,
  themeColorContrastRatio,
  type MobileThemeAppearance,
} from "./mobileTheme";
import { getMobileThemeRuntimeVariables } from "./mobileThemeVariables";

const APPEARANCES = ["light", "dark"] as const;

function flockVariables(appearance: MobileThemeAppearance, platform: string) {
  return getMobileThemeRuntimeVariables(DEFAULT_MOBILE_THEME_ID, appearance, platform);
}

describe("Flock accent", () => {
  it("paints the default palette with the Flock accent on both platforms", () => {
    for (const appearance of APPEARANCES) {
      for (const platform of ["ios", "android"]) {
        const variables = flockVariables(appearance, platform);
        expect(variables["--color-primary"], `${platform} ${appearance}`).toBe(FLOCK_ACCENT);
        expect(variables["--color-switch-active-track"]).toBe(FLOCK_ACCENT);
        expect(variables["--color-update"]).toBe(FLOCK_ACCENT);
      }
    }
  });

  it("keeps the accent readable wherever it carries text", () => {
    for (const appearance of APPEARANCES) {
      const variables = flockVariables(appearance, "android");
      for (const [foreground, surface] of [
        ["--color-primary-foreground", "--color-primary"],
        ["--color-primary-text", "--color-screen"],
        ["--color-primary-text", "--color-card"],
        ["--color-primary-text", "--color-grouped-card"],
        ["--color-md-link", "--color-screen"],
        ["--color-switch-active-thumb", "--color-switch-active-track"],
        ["--color-update-foreground", "--color-update"],
        ["--color-user-bubble-skill-foreground", "--color-user-bubble"],
      ] as const) {
        expect(
          themeColorContrastRatio(variables[foreground], variables[surface]),
          `${appearance}: ${foreground} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("leaves every other palette untouched", () => {
    for (const themeId of MOBILE_THEME_IDS) {
      if (themeId === DEFAULT_MOBILE_THEME_ID) continue;
      for (const appearance of APPEARANCES) {
        const variables = getMobileThemeRuntimeVariables(themeId, appearance, "ios");
        expect(variables["--color-primary"], themeId).not.toBe(FLOCK_ACCENT);
        expect(withFlockAccent(variables, themeId, appearance)).toBe(variables);
      }
    }
  });

  it("previews the default theme with the accent it paints", () => {
    for (const appearance of APPEARANCES) {
      expect(getMobileThemePreviewColors(DEFAULT_MOBILE_THEME_ID, appearance).messageAction).toBe(
        FLOCK_ACCENT,
      );
    }
  });
});
