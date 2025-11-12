export function formatCurrencyCLP(value: number, locale: string = "es-CL") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDateShort(
  value: string | Date,
  locale: string = "es-CL",
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short"
  }
) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatDateForInput(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().split("T")[0];
}

