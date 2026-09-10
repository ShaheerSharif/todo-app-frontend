/**
 * Converts a `datetime-local` input value (e.g. "2026-09-15T14:30"),
 * which JS/browsers always treat as LOCAL time with no timezone info,
 * into an explicit UTC ISO string to send to the backend.
 *
 * `new Date(localString)` already interprets a timezone-less string as
 * local time, so `.toISOString()` naturally gives us the correct UTC
 * conversion — no extra library needed for this direction.
 */
export function toUTCISOString(localDateTimeValue: string): string | null {
  if (!localDateTimeValue) return null;
  const date = new Date(localDateTimeValue);
  if (isNaN(date.getTime())) return null;
  return date.toISOString(); // e.g. "2026-09-10T05:40:03.000Z"
}

/**
 * Converts a UTC ISO string from the backend (e.g. "2026-09-10T05:40:03.000000Z")
 * into the "YYYY-MM-DDTHH:mm" shape a `datetime-local` input expects,
 * expressed in the browser's LOCAL timezone — for pre-filling the edit form.
 */
export function utcToLocalInputValue(utcValue: string | null): string {
  if (!utcValue) return '';
  const date = new Date(utcValue);
  if (isNaN(date.getTime())) return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Formats a UTC ISO string for DISPLAY, converted to the viewer's local
 * timezone, in d/m/Y H:i:s AM/PM shape. Uses toLocaleString with explicit
 * options (not locale-dependent defaults) so the format is exact and
 * consistent regardless of the user's OS/browser locale settings.
 */
export function formatDateTime(utcValue: string | null): string {
  if (!utcValue) return '';
  const date = new Date(utcValue);
  if (isNaN(date.getTime())) return utcValue;

  const parts = date
    .toLocaleString('en-GB', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    .replace(',', ''); // en-GB inserts a comma between date and time by default

  // en-GB gives lowercase "am/pm" in some engines — normalize to uppercase
  return parts.replace(/am|pm/i, (m) => m.toUpperCase());
}
