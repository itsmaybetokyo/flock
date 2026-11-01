import type { UsageDay } from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";
import { page } from "vite-plus/test/browser";

import { render } from "../../../test/render";
import { UsageModelDialog } from "./UsageModelDialog";

describe("UsageModelDialog", () => {
  it("exposes each stat as its own label and value to screen readers", async () => {
    await using _screen = await render(
      <UsageModelDialog
        model={{
          model: "claude-sonnet-4-5",
          provider: "claude",
          costUsd: 2,
          totalTokens: 1_000_000,
          tokens: {
            uncachedInputTokens: 100_000,
            cachedInputTokens: 900_000,
            cacheCreationTokens: 0,
            outputTokens: 0,
            reasoningTokens: 0,
          },
          records: 1,
          unpricedRecords: 0,
          unpricedTokens: 0,
          costShare: 1,
          tokenShare: 1,
          byPeriod: new Map(),
        }}
        environments={[]}
        metric="cost"
        window={{
          sinceDay: "2026-01-01" as UsageDay,
          untilDay: "2026-01-01" as UsageDay,
          timeZone: "UTC",
          resolution: "day",
        }}
        hour12={false}
        onSetPrice={() => {}}
        onClose={() => {}}
      />,
    );

    const dialog = page.getByRole("dialog");
    for (const [label, value] of [
      ["Cost", "$2.00"],
      ["Tokens", "1M"],
      ["Per 1M tokens", "$2.00"],
      ["Cache hit", "90.0%"],
    ] as const) {
      await expect
        .element(dialog.getByRole("term").getByText(label, { exact: true }))
        .toBeVisible();
      await expect
        .element(dialog.getByRole("definition").getByText(value, { exact: true }).first())
        .toBeVisible();
    }
  });
});
