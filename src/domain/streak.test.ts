// src/domain/streak.test.ts
import { test } from 'node:test';
import assert from 'node:assert';
import {
  calculateStreak,
  sortWeeksByMostRecent,
  didAchieveGoal,
  type ArchivedWeek,
} from './streak.js';

// ============================================================================
// Helper Functions
// ============================================================================

function createArchivedWeek(
  mondayDate: Date,
  totalPoints: number
): ArchivedWeek {
  const weekStart = new Date(mondayDate);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Sunday
  weekEnd.setHours(23, 59, 59, 999);
  
  return {
    weekStart,
    weekEnd,
    totalPoints,
    goalAchieved: totalPoints >= 30,
  };
}

// ============================================================================
// calculateStreak Tests - Empty Archive
// ============================================================================

test('calculateStreak - empty array returns 0', () => {
  const archivedWeeks: ArchivedWeek[] = [];
  const streak = calculateStreak(archivedWeeks);
  
  assert.strictEqual(streak, 0);
});

// ============================================================================
// calculateStreak Tests - Single Week
// ============================================================================

test('calculateStreak - single week with goal achieved returns 1', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 6), 30), // Jan 6 (Monday), 30 points
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 1);
});

test('calculateStreak - single week with goal not achieved returns 0', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 6), 25), // Jan 6 (Monday), 25 points
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 0);
});

test('calculateStreak - single week with exactly 30 points returns 1', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 6), 30),
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 1);
});

test('calculateStreak - single week with more than 30 points returns 1', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 6), 35),
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 1);
});

// ============================================================================
// calculateStreak Tests - Continuous Streak
// ============================================================================

test('calculateStreak - two consecutive weeks both achieved returns 2', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 13), 32), // Week 2 (most recent)
    createArchivedWeek(new Date(2025, 0, 6), 30),  // Week 1
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 2);
});

test('calculateStreak - three consecutive weeks all achieved returns 3', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 20), 35), // Week 3 (most recent)
    createArchivedWeek(new Date(2025, 0, 13), 32), // Week 2
    createArchivedWeek(new Date(2025, 0, 6), 30),  // Week 1
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 3);
});

test('calculateStreak - five consecutive weeks all achieved returns 5', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 1, 3), 33),  // Week 5 (most recent)
    createArchivedWeek(new Date(2025, 0, 27), 31), // Week 4
    createArchivedWeek(new Date(2025, 0, 20), 35), // Week 3
    createArchivedWeek(new Date(2025, 0, 13), 32), // Week 2
    createArchivedWeek(new Date(2025, 0, 6), 30),  // Week 1
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 5);
});

test('calculateStreak - long streak across year boundary', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 13), 32), // Jan 13, 2025
    createArchivedWeek(new Date(2025, 0, 6), 30),  // Jan 6, 2025
    createArchivedWeek(new Date(2024, 11, 30), 35), // Dec 30, 2024
    createArchivedWeek(new Date(2024, 11, 23), 31), // Dec 23, 2024
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 4);
});

// ============================================================================
// calculateStreak Tests - Streak Broken by Failure
// ============================================================================

test('calculateStreak - most recent week failed returns 0', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 13), 25), // Week 2 (failed)
    createArchivedWeek(new Date(2025, 0, 6), 30),  // Week 1 (achieved)
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 0);
});

test('calculateStreak - second week failed stops streak at 1', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 20), 35), // Week 3 (achieved)
    createArchivedWeek(new Date(2025, 0, 13), 25), // Week 2 (failed)
    createArchivedWeek(new Date(2025, 0, 6), 30),  // Week 1 (achieved)
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 1);
});

test('calculateStreak - middle week failed stops streak', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 27), 33), // Week 4 (achieved)
    createArchivedWeek(new Date(2025, 0, 20), 35), // Week 3 (achieved)
    createArchivedWeek(new Date(2025, 0, 13), 28), // Week 2 (failed)
    createArchivedWeek(new Date(2025, 0, 6), 30),  // Week 1 (achieved)
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 2);
});

test('calculateStreak - alternating success and failure', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 27), 35), // Week 4 (achieved)
    createArchivedWeek(new Date(2025, 0, 20), 25), // Week 3 (failed)
    createArchivedWeek(new Date(2025, 0, 13), 32), // Week 2 (achieved)
    createArchivedWeek(new Date(2025, 0, 6), 28),  // Week 1 (failed)
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 1);
});

// ============================================================================
// calculateStreak Tests - Gaps in Weeks
// ============================================================================

test('calculateStreak - gap of one week stops streak', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 20), 35), // Week 3 (most recent)
    // Missing week 2 (Jan 13)
    createArchivedWeek(new Date(2025, 0, 6), 30),  // Week 1
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 1); // Only counts most recent week
});

test('calculateStreak - gap after streak of 2', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 27), 33), // Week 4 (most recent)
    createArchivedWeek(new Date(2025, 0, 20), 35), // Week 3
    // Missing week 2 (Jan 13)
    createArchivedWeek(new Date(2025, 0, 6), 30),  // Week 1
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 2); // Counts weeks 4 and 3
});

test('calculateStreak - multiple gaps', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 1, 3), 32),  // Week 5 (most recent)
    // Missing week 4 (Jan 27)
    createArchivedWeek(new Date(2025, 0, 20), 35), // Week 3
    // Missing week 2 (Jan 13)
    createArchivedWeek(new Date(2025, 0, 6), 30),  // Week 1
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 1); // Only counts most recent week
});

test('calculateStreak - gap of two weeks stops streak', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 27), 33), // Week 4 (most recent)
    // Missing weeks 3 (Jan 20) and 2 (Jan 13)
    createArchivedWeek(new Date(2025, 0, 6), 30),  // Week 1
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 1);
});

// ============================================================================
// calculateStreak Tests - Edge Cases
// ============================================================================

test('calculateStreak - all weeks failed returns 0', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 20), 25), // Week 3
    createArchivedWeek(new Date(2025, 0, 13), 28), // Week 2
    createArchivedWeek(new Date(2025, 0, 6), 20),  // Week 1
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 0);
});

test('calculateStreak - only oldest week achieved returns 0', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 20), 25), // Week 3 (failed)
    createArchivedWeek(new Date(2025, 0, 13), 28), // Week 2 (failed)
    createArchivedWeek(new Date(2025, 0, 6), 30),  // Week 1 (achieved)
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 0);
});

test('calculateStreak - barely missed goal (29 points)', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 13), 29), // 29 points (failed by 1)
    createArchivedWeek(new Date(2025, 0, 6), 30),
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 0);
});

test('calculateStreak - exactly at threshold throughout', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 20), 30), // Exactly 30
    createArchivedWeek(new Date(2025, 0, 13), 30), // Exactly 30
    createArchivedWeek(new Date(2025, 0, 6), 30),  // Exactly 30
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 3);
});

// ============================================================================
// calculateStreak Tests - Realistic Scenarios
// ============================================================================

test('calculateStreak - typical user building streak', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 0, 20), 32), // Week 3: success
    createArchivedWeek(new Date(2025, 0, 13), 31), // Week 2: success
    createArchivedWeek(new Date(2025, 0, 6), 28),  // Week 1: failed (still learning)
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 2); // Current streak is 2 weeks
});

test('calculateStreak - user recovering from break', () => {
  const archivedWeeks = [
    createArchivedWeek(new Date(2025, 1, 3), 33),  // Week 5: back on track
    createArchivedWeek(new Date(2025, 0, 27), 35), // Week 4: back on track
    createArchivedWeek(new Date(2025, 0, 20), 22), // Week 3: had a bad week
    createArchivedWeek(new Date(2025, 0, 13), 32), // Week 2: was doing well
    createArchivedWeek(new Date(2025, 0, 6), 30),  // Week 1: was doing well
  ];
  
  const streak = calculateStreak(archivedWeeks);
  assert.strictEqual(streak, 2); // New streak of 2 weeks
});

// ============================================================================
// sortWeeksByMostRecent Tests
// ============================================================================

test('sortWeeksByMostRecent - sorts correctly', () => {
  const weeks = [
    createArchivedWeek(new Date(2025, 0, 6), 30),  // Oldest
    createArchivedWeek(new Date(2025, 0, 20), 35), // Newest
    createArchivedWeek(new Date(2025, 0, 13), 32), // Middle
  ];
  
  const sorted = sortWeeksByMostRecent(weeks);
  
  assert.strictEqual(sorted[0].weekStart.getDate(), 20); // Jan 20 (newest)
  assert.strictEqual(sorted[1].weekStart.getDate(), 13); // Jan 13
  assert.strictEqual(sorted[2].weekStart.getDate(), 6);  // Jan 6 (oldest)
});

test('sortWeeksByMostRecent - does not mutate original array', () => {
  const weeks = [
    createArchivedWeek(new Date(2025, 0, 6), 30),
    createArchivedWeek(new Date(2025, 0, 13), 32),
  ];
  
  const originalFirstDate = weeks[0].weekStart.getDate();
  sortWeeksByMostRecent(weeks);
  
  assert.strictEqual(weeks[0].weekStart.getDate(), originalFirstDate);
});

test('sortWeeksByMostRecent - handles empty array', () => {
  const weeks: ArchivedWeek[] = [];
  const sorted = sortWeeksByMostRecent(weeks);
  
  assert.strictEqual(sorted.length, 0);
});

// ============================================================================
// didAchieveGoal Tests
// ============================================================================

test('didAchieveGoal - 30 points returns true', () => {
  assert.strictEqual(didAchieveGoal(30), true);
});

test('didAchieveGoal - more than 30 returns true', () => {
  assert.strictEqual(didAchieveGoal(35), true);
  assert.strictEqual(didAchieveGoal(50), true);
});

test('didAchieveGoal - less than 30 returns false', () => {
  assert.strictEqual(didAchieveGoal(29), false);
  assert.strictEqual(didAchieveGoal(25), false);
  assert.strictEqual(didAchieveGoal(0), false);
});

test('didAchieveGoal - fractional points work correctly', () => {
  assert.strictEqual(didAchieveGoal(30.25), true);  // With herbs/spices
  assert.strictEqual(didAchieveGoal(29.75), false);
});