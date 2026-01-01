// src/domain/dates.ts

/**
 * Get the start of the week (Monday at 00:00:00 local time) for a given date
 * Week runs Monday-Sunday according to the specification
 * @param date - Any date within the week
 * @returns Monday at 00:00:00 local time for that week
 */
export function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Calculate days to subtract to get to Monday
  // Sunday (0) needs to go back 6 days to previous Monday
  // Monday (1) needs to go back 0 days
  // Tuesday (2) needs to go back 1 day, etc.
  const daysToSubtract = day === 0 ? 6 : day - 1;
  
  result.setDate(result.getDate() - daysToSubtract);
  result.setHours(0, 0, 0, 0);
  
  return result;
}

/**
 * Get the end of the week (Sunday at 23:59:59.999 local time) for a given date
 * @param date - Any date within the week
 * @returns Sunday at 23:59:59.999 local time for that week
 */
export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Add 6 days to Monday to get Sunday
  weekEnd.setHours(23, 59, 59, 999);
  
  return weekEnd;
}

/**
 * Check if two dates are in the same week (Monday-Sunday)
 * @param a - First date
 * @param b - Second date
 * @returns True if both dates fall within the same Monday-Sunday week
 */
export function isSameWeek(a: Date, b: Date): boolean {
  const weekStartA = getWeekStart(a);
  const weekStartB = getWeekStart(b);
  
  return (
    weekStartA.getFullYear() === weekStartB.getFullYear() &&
    weekStartA.getMonth() === weekStartB.getMonth() &&
    weekStartA.getDate() === weekStartB.getDate()
  );
}

/**
 * Check if two dates are the same day (ignoring time)
 * @param a - First date
 * @param b - Second date
 * @returns True if both dates are the same calendar day
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Determine if the current week should be archived based on the current time
 * Week should be archived when we've crossed into a new week (past Monday 00:00:00)
 * @param now - Current date/time
 * @param currentWeekStart - The start date of the currently tracked week
 * @returns True if we're now in a different week than currentWeekStart
 */
export function shouldArchiveWeek(now: Date, currentWeekStart: Date): boolean {
  return !isSameWeek(now, currentWeekStart);
}

/**
 * Check if we should reset daily tracking (have we crossed into a new day?)
 * @param now - Current date/time
 * @param lastResetDate - The date when daily tracking was last reset
 * @returns True if we're now in a different day than lastResetDate
 */
export function shouldResetDaily(now: Date, lastResetDate: Date): boolean {
  return !isSameDay(now, lastResetDate);
}

/**
 * Get a normalized date at start of day (00:00:00 local time)
 * Useful for comparing dates without time components
 * @param date - Input date
 * @returns New date at 00:00:00 on the same day
 */
export function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get a normalized date at end of day (23:59:59.999 local time)
 * @param date - Input date
 * @returns New date at 23:59:59.999 on the same day
 */
export function getEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}