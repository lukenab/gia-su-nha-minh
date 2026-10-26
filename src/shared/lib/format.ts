const TIME_ZONE = "Asia/Ho_Chi_Minh";

/** Fixed time zone so server (UTC) and browser render the same text. */
export function formatDateTime(
  value: Date | string | number | null | undefined,
) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("vi-VN", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value: Date | string | number | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("vi-VN", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatVnd(value: number | null | undefined) {
  return value == null ? null : `${Number(value).toLocaleString("vi-VN")} VND`;
}

/** Today's date (yyyy-mm-dd) in Vietnam, for date inputs. */
export function todayInVietnam(now: Date = new Date()) {
  return now.toLocaleDateString("sv-SE", { timeZone: TIME_ZONE });
}
