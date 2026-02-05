/**
 * Utility to ensure all incoming dates are treated as UTC and normalized to JS Date objects.
 */
export const toUTCDate = (dateString: string | Date | undefined): Date | undefined => {
  if (!dateString) return undefined;
  
  const date = new Date(dateString);
  
  // If we receive a "datetime-local" string from the client like "2023-10-27T10:00"
  // and it doesn't have an offset, JavaScript might treat it as local.
  // However, our implementation plan aims to send ISO strings ending with 'Z'.
  // This helper ensures we have a valid Date object.
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  
  return date;
};

/**
 * Ensures a date is at the very beginning of the UTC day.
 */
export const startOfUTCDate = (date: Date): Date => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Ensures a date is at the very end of the UTC day.
 */
export const endOfUTCDate = (date: Date): Date => {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
};
