export function formatCurrencyCLP(value: number, locale: string = "es-CL") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(value);
}

export function normalizeDate(value: string | Date) {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, (month ?? 1) - 1, day ?? 1);
  }

  const parsed = new Date(value);
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

export function formatDateShort(
  value: string | Date,
  locale: string = "es-CL",
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short"
  }
) {
  const date = normalizeDate(value);
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatDateForInput(value: string | Date) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const date = normalizeDate(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

