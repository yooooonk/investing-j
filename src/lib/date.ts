export function getTodayYYYYMMDD(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

export function formatDateWithDay(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const day = days[date.getDay()];
  return `${yyyy}년 ${mm}월 ${dd}일 (${day})`;
}
