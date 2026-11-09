import type { ScheduledTaskSchedule } from "@t3tools/contracts";
import * as DateTime from "effect/DateTime";
import { mFallback, msg } from "gt-i18n";
import type { MFunctionType } from "gt-i18n/types";

import { scheduleTimeZoneLabel } from "./scheduledTaskTimeZone.ts";

/** Abbreviated weekday name, 0 = Sunday. */
export function weekdayShortLabel(day: number, locale?: string): string {
  // 2024-01-07 was a Sunday.
  return new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(
    Date.UTC(2024, 0, 7 + day),
  );
}

const ONCE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function scheduleLabel(
  schedule: ScheduledTaskSchedule,
  timeZone?: string,
  runAt?: string | null,
  resolve: MFunctionType = mFallback,
  locale?: string,
): string {
  if (schedule.type === "webhook") return resolve(msg("On webhook"));
  if (schedule.type === "once") {
    const time = ONCE_FORMATTER.format(DateTime.toEpochMillis(DateTime.makeUnsafe(schedule.runAt)));
    return resolve(msg("Once, {time}", { time }));
  }
  if (schedule.type === "interval") {
    const minutes = schedule.everyMs / 60_000;
    if (!Number.isInteger(minutes)) {
      return resolve(msg("Every {seconds} sec", { seconds: Math.round(schedule.everyMs / 1000) }));
    }
    if (minutes % 60 !== 0) return resolve(msg("Every {minutes} min", { minutes }));
    return minutes === 60
      ? resolve(msg("Every hour"))
      : resolve(msg("Every {hours} hours", { hours: minutes / 60 }));
  }
  const weekdays = schedule.weekdays ?? [];
  const time = schedule.timeOfDay;
  const zone = scheduleTimeZoneLabel(timeZone, runAt);
  if (weekdays.length === 0) {
    return zone === undefined
      ? resolve(msg("Daily at {time}", { time }))
      : resolve(msg("Daily at {time} {zone}", { time, zone }));
  }
  if (weekdays.length === 5 && weekdays.every((day) => day >= 1 && day <= 5)) {
    return zone === undefined
      ? resolve(msg("Weekdays at {time}", { time }))
      : resolve(msg("Weekdays at {time} {zone}", { time, zone }));
  }
  const days = weekdays
    .map((day) => (day >= 0 && day <= 6 ? weekdayShortLabel(day, locale) : ""))
    .join(", ");
  return zone === undefined
    ? resolve(msg("{days} at {time}", { days, time }))
    : resolve(msg("{days} at {time} {zone}", { days, time, zone }));
}
