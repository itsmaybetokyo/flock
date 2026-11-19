// GT validates every locale with Intl.Locale and English Intl.DisplayNames, and selects every plural
// branch with Intl.PluralRules; Hermes has none of them, so plural messages would render as raw ICU.
// gt-react-native's Babel plugin would inject these; plain imports keep the Metro and Babel config unchanged.
import "@formatjs/intl-getcanonicallocales/polyfill";
import "@formatjs/intl-locale/polyfill";
import "@formatjs/intl-displaynames/polyfill";
import "@formatjs/intl-displaynames/locale-data/en";
import "@formatjs/intl-pluralrules/polyfill";
import "@formatjs/intl-pluralrules/locale-data/en";
import "@formatjs/intl-pluralrules/locale-data/de";
import "@formatjs/intl-pluralrules/locale-data/es";
import "@formatjs/intl-pluralrules/locale-data/fr";
import "@formatjs/intl-pluralrules/locale-data/ja";
import "@formatjs/intl-pluralrules/locale-data/ko";
import "@formatjs/intl-pluralrules/locale-data/pt";
import "@formatjs/intl-pluralrules/locale-data/ru";
import "@formatjs/intl-pluralrules/locale-data/sv";
import "@formatjs/intl-pluralrules/locale-data/zh";

// Temporary: tells the next release build's logcat whether these polyfills actually applied, and
// whether GT's locale check agrees, since a DisplayNames without English data also rejects "en".
const intl = Intl as unknown as {
  Locale?: new (tag: string) => { maximize(): { toString(): string } };
  DisplayNames?: new (
    locales: string[],
    options: { type: "language" },
  ) => { of(code: string): string };
  PluralRules?: new (locales: string[]) => { select(count: number): string };
};
const intlTypes = `Locale=${typeof intl.Locale} DisplayNames=${typeof intl.DisplayNames} PluralRules=${typeof intl.PluralRules}`;
try {
  const displayNames = new intl.DisplayNames!(["en"], { type: "language" });
  const pluralRules = new intl.PluralRules!(["en"]);
  console.log(
    `[flock] intl ${intlTypes} maximize=${new intl.Locale!("en").maximize().toString()} en=${displayNames.of("en")} one=${pluralRules.select(1)}`,
  );
} catch (error) {
  console.log(`[flock] intl ${intlTypes} failed=${String(error)}`);
}
