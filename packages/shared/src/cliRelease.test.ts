import { describe, expect, it } from "vite-plus/test";

import {
  CLI_RELEASES_PAGE_URL,
  cliArchiveTarCommand,
  cliReleaseIndexPageUrl,
  type FetchReleaseText,
  findLatestCliRelease,
  newestCliReleaseVersion,
  parseChecksums,
} from "./cliRelease.ts";

// Fork builds update from their own repository, so the URLs come from the constant rather than a
// literal owner/repo.
const RELEASE_FEED_URL = `${CLI_RELEASES_PAGE_URL}.atom`;

describe("cliRelease", () => {
  it("parses sha256sum output including binary-mode markers", () => {
    const checksums = parseChecksums(
      [
        `${"a".repeat(64)}  t3-1.2.3-linux-x64.tar.gz`,
        `${"B".repeat(64)} *t3-1.2.3-win32-x64.zip`,
        "not a checksum line",
        "",
      ].join("\n"),
    );
    expect(checksums.get("t3-1.2.3-linux-x64.tar.gz")).toBe("a".repeat(64));
    expect(checksums.get("t3-1.2.3-win32-x64.zip")).toBe("b".repeat(64));
    expect(checksums.size).toBe(2);
  });

  it("extracts with the System32 bsdtar on Windows and plain tar elsewhere", () => {
    expect(cliArchiveTarCommand("linux", {})).toBe("tar");
    expect(cliArchiveTarCommand("win32", { SystemRoot: "D:\\Win" })).toBe(
      "D:\\Win\\System32\\tar.exe",
    );
    expect(cliArchiveTarCommand("win32", {})).toBe("C:\\Windows\\System32\\tar.exe");
  });

  it("picks the newest non-draft release on the requested channel", () => {
    const releases = [
      { tag_name: "v1.2.4-preview.20260912.9", draft: true },
      { tag_name: "v1.2.4-preview.20260912.8" },
      { tag_name: "v1.2.4-nightly.20260912.7" },
      { tag_name: "desktop-preview" },
      { tag_name: "v1.2.3" },
      { tag_name: "v1.2.3-nightly.20260911.2" },
    ];
    expect(newestCliReleaseVersion(releases, "preview")).toBe("1.2.4-preview.20260912.8");
    expect(newestCliReleaseVersion(releases, "nightly")).toBe("1.2.4-nightly.20260912.7");
    expect(newestCliReleaseVersion(releases, "stable")).toBe("1.2.3");
    expect(newestCliReleaseVersion([{ tag_name: "v1.2.3" }], "preview")).toBeUndefined();
  });
});

describe("findLatestCliRelease", () => {
  const signal = new AbortController().signal;
  const serve =
    (respond: (url: string) => Response): FetchReleaseText =>
    async (url) =>
      respond(url);
  const feed = (...tags: Array<string>) =>
    new Response(
      `<feed><id>tag:github.com,2008:${CLI_RELEASES_PAGE_URL}</id>${tags
        .map((tag) => `<entry><id>tag:github.com,2008:Repository/1/${tag}</id></entry>`)
        .join("")}</feed>`,
    );

  it("reads nightly and preview releases from the feed without the anonymous API quota", async () => {
    const fetchText = serve((url) =>
      url === RELEASE_FEED_URL
        ? feed(
            "desktop-preview",
            "v1.0.0-preview.20260924.3",
            "v1.0.0-nightly.20260924.2",
            "v1.0.0",
            "v1.0.0-nightly.20260923.1",
          )
        : new Response(null, { status: 403 }),
    );
    expect(await findLatestCliRelease("nightly", signal, fetchText)).toBe(
      "1.0.0-nightly.20260924.2",
    );
    expect(await findLatestCliRelease("preview", signal, fetchText)).toBe(
      "1.0.0-preview.20260924.3",
    );
  });

  it("finds a published preview beyond the ten-entry feed and first API page", async () => {
    const nightlies = Array.from({ length: 10 }, (_, i) => `v1.0.0-nightly.20260930.${i}`);
    const fetchText = serve((url) => {
      if (url === RELEASE_FEED_URL) return feed(...nightlies);
      if (url === cliReleaseIndexPageUrl(1)) {
        return Response.json(Array.from({ length: 100 }, () => ({ tag_name: "v2.0.0" })));
      }
      if (url === cliReleaseIndexPageUrl(2)) {
        return Response.json([
          { tag_name: "v1.0.0-preview.20260925.1", draft: true },
          { tag_name: "v1.0.0-preview.20260924.3" },
        ]);
      }
      throw new Error(`Unexpected release request: ${url}`);
    });
    expect(await findLatestCliRelease("preview", signal, fetchText)).toBe(
      "1.0.0-preview.20260924.3",
    );
  });

  it("reports no release when the channel has none, even when /latest answers with HTML", async () => {
    const nightlyOnly = serve((url) =>
      url.endsWith("/releases/latest")
        ? new Response("<!DOCTYPE html><html></html>", { headers: { "Content-Type": "text/html" } })
        : Response.json([{ tag_name: "v1.0.0-nightly.20260923.1" }]),
    );
    expect(await findLatestCliRelease("stable", signal, nightlyOnly)).toBeNull();
    const stableOnly = serve((url) =>
      url.endsWith(".atom") ? feed("v1.0.0") : Response.json([{ tag_name: "v1.0.0" }]),
    );
    expect(await findLatestCliRelease("nightly", signal, stableOnly)).toBeNull();
  });

  it("reports failed checks instead of claiming there is no release", async () => {
    for (const status of [403, 429]) {
      const refused = serve(() => new Response(null, { status }));
      await expect(findLatestCliRelease("stable", signal, refused)).rejects.toThrow(String(status));
    }
    const invalid = serve(() => Response.json({ error: "invalid" }));
    await expect(findLatestCliRelease("stable", signal, invalid)).rejects.toThrow();
  });
});
