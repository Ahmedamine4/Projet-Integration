export function formatLocalDate(dateValue) {
  if (!dateValue) return '';

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function addYears(dateValue, years) {
  if (!dateValue || years == null) return '';

  const date = new Date(dateValue);
  date.setFullYear(date.getFullYear() + Number(years));

  return formatLocalDate(date);
}

export function addDays(dateValue, days) {
  if (!dateValue || days == null) return '';

  const date = new Date(dateValue);
  date.setDate(date.getDate() + Number(days));

  return formatLocalDate(date);
}
