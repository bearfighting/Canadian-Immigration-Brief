export function formatDateOnly(date: Date | undefined): string {
  if (!date) return "未提供";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
