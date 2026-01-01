// src/domain/dates.test.ts
import { test } from 'node:test';
import assert from 'node:assert';
import {
  getWeekStart,
  getWeekEnd,
  isSameWeek,
  isSameDay,
  shouldArchiveWeek,
  shouldResetDaily,
  getStartOfDay,
  getEndOfDay,
} from './dates.js';

// ============================================================================
// getWeekStart Tests - Basic Functionality
// ============================================================================

test('getWeekStart - Monday returns same day at 00:00', () => {
  const monday = new Date(2025, 0, 6, 14, 30, 0); // Jan 6, 2025 is a Monday at 2:30pm
  const weekStart = getWeekStart(monday);
  
  assert.strictEqual(weekStart.getFullYear(), 2025);
  assert.strictEqual(weekStart.getMonth(), 0); // January
  assert.strictEqual(weekStart.getDate(), 6);
  assert.strictEqual(weekStart.getHours(), 0);
  assert.strictEqual(weekStart.getMinutes(), 0);
  assert.strictEqual(weekStart.getSeconds(), 0);
  assert.strictEqual(weekStart.getMilliseconds(), 0);
});

test('getWeekStart - Tuesday returns previous Monday', () => {
  const tuesday = new Date(2025, 0, 7, 10, 0, 0); // Jan 7, 2025 (Tuesday)
  const weekStart = getWeekStart(tuesday);
  
  assert.strictEqual(weekStart.getFullYear(), 2025);
  assert.strictEqual(weekStart.getMonth(), 0);
  assert.strictEqual(weekStart.getDate(), 6); // Previous Monday
  assert.strictEqual(weekStart.getHours(), 0);
  assert.strictEqual(weekStart.getMinutes(), 0);
});

test('getWeekStart - Wednesday returns previous Monday', () => {
  const wednesday = new Date(2025, 0, 8, 10, 0, 0); // Jan 8, 2025 (Wednesday)
  const weekStart = getWeekStart(wednesday);
  
  assert.strictEqual(weekStart.getDate(), 6); // Monday Jan 6
});

test('getWeekStart - Thursday returns previous Monday', () => {
  const thursday = new Date(2025, 0, 9, 10, 0, 0); // Jan 9, 2025 (Thursday)
  const weekStart = getWeekStart(thursday);
  
  assert.strictEqual(weekStart.getDate(), 6); // Monday Jan 6
});

test('getWeekStart - Friday returns previous Monday', () => {
  const friday = new Date(2025, 0, 10, 10, 0, 0); // Jan 10, 2025 (Friday)
  const weekStart = getWeekStart(friday);
  
  assert.strictEqual(weekStart.getDate(), 6); // Monday Jan 6
});

test('getWeekStart - Saturday returns previous Monday', () => {
  const saturday = new Date(2025, 0, 11, 10, 0, 0); // Jan 11, 2025 (Saturday)
  const weekStart = getWeekStart(saturday);
  
  assert.strictEqual(weekStart.getDate(), 6); // Monday Jan 6
});

// ============================================================================
// getWeekStart Tests - Sunday to Monday Rollover
// ============================================================================

test('getWeekStart - Sunday returns previous Monday (6 days back)', () => {
  const sunday = new Date(2025, 0, 12, 10, 0, 0); // Jan 12, 2025 (Sunday)
  const weekStart = getWeekStart(sunday);
  
  assert.strictEqual(weekStart.getFullYear(), 2025);
  assert.strictEqual(weekStart.getMonth(), 0);
  assert.strictEqual(weekStart.getDate(), 6); // Previous Monday
  assert.strictEqual(weekStart.getHours(), 0);
  assert.strictEqual(weekStart.getMinutes(), 0);
});

test('getWeekStart - Sunday at 23:59 still returns previous Monday', () => {
  const sundayNight = new Date(2025, 0, 12, 23, 59, 59); // Jan 12, 2025 (Sunday) 11:59pm
  const weekStart = getWeekStart(sundayNight);
  
  assert.strictEqual(weekStart.getDate(), 6); // Monday Jan 6
  assert.strictEqual(weekStart.getHours(), 0);
});

test('getWeekStart - Monday after Sunday rollover is new week', () => {
  const sunday = new Date(2025, 0, 12, 23, 59, 0); // Jan 12 (Sunday) 11:59pm
  const mondayMorning = new Date(2025, 0, 13, 0, 1, 0); // Jan 13 (Monday) 12:01am
  
  const sundayWeekStart = getWeekStart(sunday);
  const mondayWeekStart = getWeekStart(mondayMorning);
  
  // Sunday belongs to previous week (starts Jan 6)
  assert.strictEqual(sundayWeekStart.getDate(), 6);
  
  // Monday starts new week (starts Jan 13)
  assert.strictEqual(mondayWeekStart.getDate(), 13);
});

// ============================================================================
// getWeekStart Tests - Month Boundaries
// ============================================================================

test('getWeekStart - handles month boundary correctly', () => {
  const feb3 = new Date(2025, 1, 3, 10, 0, 0); // Feb 3, 2025 (Monday)
  const weekStart = getWeekStart(feb3);
  
  assert.strictEqual(weekStart.getMonth(), 1); // February
  assert.strictEqual(weekStart.getDate(), 3);
});

test('getWeekStart - Sunday at end of month goes to previous month Monday', () => {
  const jan5 = new Date(2025, 0, 5, 10, 0, 0); // Jan 5, 2025 (Sunday)
  const weekStart = getWeekStart(jan5);
  
  // Should go back to December 30, 2024 (Monday)
  assert.strictEqual(weekStart.getFullYear(), 2024);
  assert.strictEqual(weekStart.getMonth(), 11); // December
  assert.strictEqual(weekStart.getDate(), 30);
});

// ============================================================================
// getWeekEnd Tests
// ============================================================================

test('getWeekEnd - returns Sunday at 23:59:59.999', () => {
  const monday = new Date(2025, 0, 6, 10, 0, 0); // Jan 6 (Monday)
  const weekEnd = getWeekEnd(monday);
  
  assert.strictEqual(weekEnd.getFullYear(), 2025);
  assert.strictEqual(weekEnd.getMonth(), 0);
  assert.strictEqual(weekEnd.getDate(), 12); // Sunday Jan 12
  assert.strictEqual(weekEnd.getHours(), 23);
  assert.strictEqual(weekEnd.getMinutes(), 59);
  assert.strictEqual(weekEnd.getSeconds(), 59);
  assert.strictEqual(weekEnd.getMilliseconds(), 999);
});

test('getWeekEnd - Sunday returns same Sunday at 23:59:59.999', () => {
  const sunday = new Date(2025, 0, 12, 10, 0, 0); // Jan 12 (Sunday)
  const weekEnd = getWeekEnd(sunday);
  
  assert.strictEqual(weekEnd.getDate(), 12); // Same Sunday
  assert.strictEqual(weekEnd.getHours(), 23);
  assert.strictEqual(weekEnd.getMinutes(), 59);
});

// ============================================================================
// isSameWeek Tests
// ============================================================================

test('isSameWeek - Monday and Tuesday in same week returns true', () => {
  const monday = new Date(2025, 0, 6, 10, 0, 0);
  const tuesday = new Date(2025, 0, 7, 14, 0, 0);
  
  assert.strictEqual(isSameWeek(monday, tuesday), true);
});

test('isSameWeek - Monday and Sunday in same week returns true', () => {
  const monday = new Date(2025, 0, 6, 10, 0, 0);
  const sunday = new Date(2025, 0, 12, 14, 0, 0);
  
  assert.strictEqual(isSameWeek(monday, sunday), true);
});

test('isSameWeek - Sunday and next Monday in different weeks returns false', () => {
  const sunday = new Date(2025, 0, 12, 23, 59, 0); // Jan 12 (Sunday)
  const nextMonday = new Date(2025, 0, 13, 0, 1, 0); // Jan 13 (Monday)
  
  assert.strictEqual(isSameWeek(sunday, nextMonday), false);
});

test('isSameWeek - two Mondays one week apart returns false', () => {
  const monday1 = new Date(2025, 0, 6, 10, 0, 0);
  const monday2 = new Date(2025, 0, 13, 10, 0, 0);
  
  assert.strictEqual(isSameWeek(monday1, monday2), false);
});

test('isSameWeek - same exact time returns true', () => {
  const date1 = new Date(2025, 0, 8, 14, 30, 45);
  const date2 = new Date(2025, 0, 8, 14, 30, 45);
  
  assert.strictEqual(isSameWeek(date1, date2), true);
});

test('isSameWeek - Friday and next Monday returns false', () => {
  const friday = new Date(2025, 0, 10, 10, 0, 0); // Jan 10 (Friday)
  const nextMonday = new Date(2025, 0, 13, 10, 0, 0); // Jan 13 (Monday)
  
  assert.strictEqual(isSameWeek(friday, nextMonday), false);
});

// ============================================================================
// isSameDay Tests - Same Day
// ============================================================================

test('isSameDay - same date and time returns true', () => {
  const date1 = new Date(2025, 0, 6, 10, 0, 0);
  const date2 = new Date(2025, 0, 6, 10, 0, 0);
  
  assert.strictEqual(isSameDay(date1, date2), true);
});

test('isSameDay - same date different times returns true', () => {
  const morning = new Date(2025, 0, 6, 8, 0, 0);
  const evening = new Date(2025, 0, 6, 20, 0, 0);
  
  assert.strictEqual(isSameDay(morning, evening), true);
});

test('isSameDay - start and end of day returns true', () => {
  const startOfDay = new Date(2025, 0, 6, 0, 0, 0);
  const endOfDay = new Date(2025, 0, 6, 23, 59, 59);
  
  assert.strictEqual(isSameDay(startOfDay, endOfDay), true);
});

// ============================================================================
// isSameDay Tests - Different Day
// ============================================================================

test('isSameDay - consecutive days returns false', () => {
  const today = new Date(2025, 0, 6, 23, 59, 0);
  const tomorrow = new Date(2025, 0, 7, 0, 1, 0);
  
  assert.strictEqual(isSameDay(today, tomorrow), false);
});

test('isSameDay - different dates returns false', () => {
  const date1 = new Date(2025, 0, 6, 10, 0, 0);
  const date2 = new Date(2025, 0, 7, 10, 0, 0);
  
  assert.strictEqual(isSameDay(date1, date2), false);
});

test('isSameDay - same day different months returns false', () => {
  const jan15 = new Date(2025, 0, 15, 10, 0, 0);
  const feb15 = new Date(2025, 1, 15, 10, 0, 0);
  
  assert.strictEqual(isSameDay(jan15, feb15), false);
});

test('isSameDay - same day different years returns false', () => {
  const jan1_2025 = new Date(2025, 0, 1, 10, 0, 0);
  const jan1_2026 = new Date(2026, 0, 1, 10, 0, 0);
  
  assert.strictEqual(isSameDay(jan1_2025, jan1_2026), false);
});

// ============================================================================
// shouldArchiveWeek Tests
// ============================================================================

test('shouldArchiveWeek - same week returns false', () => {
  const weekStart = new Date(2025, 0, 6, 0, 0, 0); // Monday Jan 6
  const sameWeek = new Date(2025, 0, 10, 14, 0, 0); // Friday Jan 10
  
  assert.strictEqual(shouldArchiveWeek(sameWeek, weekStart), false);
});

test('shouldArchiveWeek - next week returns true', () => {
  const weekStart = new Date(2025, 0, 6, 0, 0, 0); // Monday Jan 6
  const nextWeek = new Date(2025, 0, 13, 0, 1, 0); // Monday Jan 13, 12:01am
  
  assert.strictEqual(shouldArchiveWeek(nextWeek, weekStart), true);
});

test('shouldArchiveWeek - Sunday night to Monday morning triggers archive', () => {
  const weekStart = new Date(2025, 0, 6, 0, 0, 0); // Monday Jan 6
  const sundayNight = new Date(2025, 0, 12, 23, 59, 0); // Sunday Jan 12, 11:59pm
  const mondayMorning = new Date(2025, 0, 13, 0, 1, 0); // Monday Jan 13, 12:01am
  
  // Sunday is still in the same week
  assert.strictEqual(shouldArchiveWeek(sundayNight, weekStart), false);
  
  // Monday crosses into new week
  assert.strictEqual(shouldArchiveWeek(mondayMorning, weekStart), true);
});

test('shouldArchiveWeek - two weeks later returns true', () => {
  const weekStart = new Date(2025, 0, 6, 0, 0, 0); // Monday Jan 6
  const twoWeeksLater = new Date(2025, 0, 20, 10, 0, 0); // Monday Jan 20
  
  assert.strictEqual(shouldArchiveWeek(twoWeeksLater, weekStart), true);
});

// ============================================================================
// shouldResetDaily Tests
// ============================================================================

test('shouldResetDaily - same day returns false', () => {
  const morning = new Date(2025, 0, 6, 8, 0, 0);
  const evening = new Date(2025, 0, 6, 20, 0, 0);
  
  assert.strictEqual(shouldResetDaily(evening, morning), false);
});

test('shouldResetDaily - next day returns true', () => {
  const today = new Date(2025, 0, 6, 23, 59, 0);
  const tomorrow = new Date(2025, 0, 7, 0, 1, 0);
  
  assert.strictEqual(shouldResetDaily(tomorrow, today), true);
});

test('shouldResetDaily - midnight boundary triggers reset', () => {
  const beforeMidnight = new Date(2025, 0, 6, 23, 59, 59);
  const afterMidnight = new Date(2025, 0, 7, 0, 0, 1);
  
  assert.strictEqual(shouldResetDaily(afterMidnight, beforeMidnight), true);
});

// ============================================================================
// getStartOfDay and getEndOfDay Tests
// ============================================================================

test('getStartOfDay - returns 00:00:00.000', () => {
  const date = new Date(2025, 0, 6, 14, 30, 45, 123);
  const startOfDay = getStartOfDay(date);
  
  assert.strictEqual(startOfDay.getFullYear(), 2025);
  assert.strictEqual(startOfDay.getMonth(), 0);
  assert.strictEqual(startOfDay.getDate(), 6);
  assert.strictEqual(startOfDay.getHours(), 0);
  assert.strictEqual(startOfDay.getMinutes(), 0);
  assert.strictEqual(startOfDay.getSeconds(), 0);
  assert.strictEqual(startOfDay.getMilliseconds(), 0);
});

test('getEndOfDay - returns 23:59:59.999', () => {
  const date = new Date(2025, 0, 6, 14, 30, 45, 123);
  const endOfDay = getEndOfDay(date);
  
  assert.strictEqual(endOfDay.getFullYear(), 2025);
  assert.strictEqual(endOfDay.getMonth(), 0);
  assert.strictEqual(endOfDay.getDate(), 6);
  assert.strictEqual(endOfDay.getHours(), 23);
  assert.strictEqual(endOfDay.getMinutes(), 59);
  assert.strictEqual(endOfDay.getSeconds(), 59);
  assert.strictEqual(endOfDay.getMilliseconds(), 999);
});

test('getStartOfDay - does not mutate original date', () => {
  const originalDate = new Date(2025, 0, 6, 14, 30, 45);
  const originalHours = originalDate.getHours();
  
  getStartOfDay(originalDate);
  
  assert.strictEqual(originalDate.getHours(), originalHours);
});

test('getEndOfDay - does not mutate original date', () => {
  const originalDate = new Date(2025, 0, 6, 14, 30, 45);
  const originalHours = originalDate.getHours();
  
  getEndOfDay(originalDate);
  
  assert.strictEqual(originalDate.getHours(), originalHours);
});

// ============================================================================
// Local Timezone Safety Tests
// ============================================================================

test('timezone safety - getWeekStart uses local time not UTC', () => {
  // Create a date at a specific local time
  const localDate = new Date(2025, 0, 8, 10, 0, 0); // Wednesday Jan 8, 10am local
  const weekStart = getWeekStart(localDate);
  
  // Week start should be Monday in local time, not UTC
  // Should be Jan 6 regardless of timezone
  assert.strictEqual(weekStart.getDate(), 6);
  assert.strictEqual(weekStart.getHours(), 0); // Midnight local time
});

test('timezone safety - isSameDay works in local time', () => {
  // Two dates on the same local day but potentially different UTC days
  const date1 = new Date(2025, 0, 6, 2, 0, 0); // 2am local
  const date2 = new Date(2025, 0, 6, 23, 0, 0); // 11pm local
  
  // Should be same day in local time
  assert.strictEqual(isSameDay(date1, date2), true);
});

test('timezone safety - week boundaries use local midnight not UTC midnight', () => {
  const sundayNight = new Date(2025, 0, 12, 23, 59, 0); // Sunday 11:59pm local
  const mondayMorning = new Date(2025, 0, 13, 0, 1, 0); // Monday 12:01am local
  
  // These should be in different weeks based on local time
  assert.strictEqual(isSameWeek(sundayNight, mondayMorning), false);
});