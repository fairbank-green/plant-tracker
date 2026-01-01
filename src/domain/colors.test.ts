// src/domain/colors.test.ts
import { test } from 'node:test';
import assert from 'node:assert';
import {
  calculateWeeklyColors,
  calculateDailyColors,
  hasAllColors,
  getMissingColors,
  type FoodWithColor,
} from './colors.js';
import { FOOD_COLORS, type FoodColor } from './types.js';

// ============================================================================
// calculateWeeklyColors Tests - Empty Input
// ============================================================================

test('calculateWeeklyColors - empty array returns empty array', () => {
  const foods: FoodWithColor[] = [];
  const colors = calculateWeeklyColors(foods);
  
  assert.strictEqual(colors.length, 0);
});

// ============================================================================
// calculateWeeklyColors Tests - Single Color
// ============================================================================

test('calculateWeeklyColors - single food returns one color', () => {
  const foods: FoodWithColor[] = [
    { color: FOOD_COLORS.GREEN, loggedDate: new Date('2025-01-06') },
  ];
  
  const colors = calculateWeeklyColors(foods);
  
  assert.strictEqual(colors.length, 1);
  assert.ok(colors.includes(FOOD_COLORS.GREEN));
});

test('calculateWeeklyColors - multiple foods with same color returns one color', () => {
  const foods: FoodWithColor[] = [
    { color: FOOD_COLORS.GREEN, loggedDate: new Date('2025-01-06') },
    { color: FOOD_COLORS.GREEN, loggedDate: new Date('2025-01-07') },
    { color: FOOD_COLORS.GREEN, loggedDate: new Date('2025-01-08') },
  ];
  
  const colors = calculateWeeklyColors(foods);
  
  assert.strictEqual(colors.length, 1);
  assert.ok(colors.includes(FOOD_COLORS.GREEN));
});

// ============================================================================
// calculateWeeklyColors Tests - Duplicate Colors
// ============================================================================

test('calculateWeeklyColors - duplicate colors are deduplicated', () => {
  const foods: FoodWithColor[] = [
    { color: FOOD_COLORS.RED, loggedDate: new Date('2025-01-06') },
    { color: FOOD_COLORS.GREEN, loggedDate: new Date('2025-01-06') },
    { color: FOOD_COLORS.RED, loggedDate: new Date('2025-01-07') },
    { color: FOOD_COLORS.BLUE_PURPLE, loggedDate: new Date('2025-01-07') },
    { color: FOOD_COLORS.GREEN, loggedDate: new Date('2025-01-08') },
  ];
  
  const colors = calculateWeeklyColors(foods);
  
  assert.strictEqual(colors.length, 3);
  assert.ok(colors.includes(FOOD_COLORS.RED));
  assert.ok(colors.includes(FOOD_COLORS.GREEN));
  assert.ok(colors.includes(FOOD_COLORS.BLUE_PURPLE));
});

test('calculateWeeklyColors - cabbage scenario (3 instances, 3 colors)', () => {
  const foods: FoodWithColor[] = [
    { color: FOOD_COLORS.GREEN, loggedDate: new Date('2025-01-06') }, // Green cabbage
    { color: FOOD_COLORS.BLUE_PURPLE, loggedDate: new Date('2025-01-07') }, // Purple cabbage
    { color: FOOD_COLORS.WHITE_TAN, loggedDate: new Date('2025-01-08') }, // White cabbage/sauerkraut
  ];
  
  const colors = calculateWeeklyColors(foods);
  
  assert.strictEqual(colors.length, 3);
  assert.ok(colors.includes(FOOD_COLORS.GREEN));
  assert.ok(colors.includes(FOOD_COLORS.BLUE_PURPLE));
  assert.ok(colors.includes(FOOD_COLORS.WHITE_TAN));
});

// ============================================================================
// calculateWeeklyColors Tests - All Colors
// ============================================================================

test('calculateWeeklyColors - all 6 colors achieved', () => {
  const foods: FoodWithColor[] = [
    { color: FOOD_COLORS.RED, loggedDate: new Date('2025-01-06') },
    { color: FOOD_COLORS.ORANGE, loggedDate: new Date('2025-01-06') },
    { color: FOOD_COLORS.YELLOW, loggedDate: new Date('2025-01-07') },
    { color: FOOD_COLORS.GREEN, loggedDate: new Date('2025-01-07') },
    { color: FOOD_COLORS.BLUE_PURPLE, loggedDate: new Date('2025-01-08') },
    { color: FOOD_COLORS.WHITE_TAN, loggedDate: new Date('2025-01-08') },
  ];
  
  const colors = calculateWeeklyColors(foods);
  
  assert.strictEqual(colors.length, 6);
  assert.ok(colors.includes(FOOD_COLORS.RED));
  assert.ok(colors.includes(FOOD_COLORS.ORANGE));
  assert.ok(colors.includes(FOOD_COLORS.YELLOW));
  assert.ok(colors.includes(FOOD_COLORS.GREEN));
  assert.ok(colors.includes(FOOD_COLORS.BLUE_PURPLE));
  assert.ok(colors.includes(FOOD_COLORS.WHITE_TAN));
});

// ============================================================================
// calculateDailyColors Tests - Empty Input
// ============================================================================

test('calculateDailyColors - empty array returns empty array', () => {
  const foods: FoodWithColor[] = [];
  const date = new Date('2025-01-06');
  const colors = calculateDailyColors(foods, date);
  
  assert.strictEqual(colors.length, 0);
});

test('calculateDailyColors - no foods on target date returns empty array', () => {
  const foods: FoodWithColor[] = [
    { color: FOOD_COLORS.GREEN, loggedDate: new Date('2025-01-06') },
    { color: FOOD_COLORS.RED, loggedDate: new Date('2025-01-07') },
  ];
  
  const colors = calculateDailyColors(foods, new Date('2025-01-08'));
  
  assert.strictEqual(colors.length, 0);
});

// ============================================================================
// calculateDailyColors Tests - Single Day
// ============================================================================

test('calculateDailyColors - single food on target date', () => {
  const foods: FoodWithColor[] = [
    { color: FOOD_COLORS.GREEN, loggedDate: new Date('2025-01-06') },
  ];
  
  const colors = calculateDailyColors(foods, new Date('2025-01-06'));
  
  assert.strictEqual(colors.length, 1);
  assert.ok(colors.includes(FOOD_COLORS.GREEN));
});

test('calculateDailyColors - multiple foods on same day', () => {
  const foods: FoodWithColor[] = [
    { color: FOOD_COLORS.GREEN, loggedDate: new Date('2025-01-06') },
    { color: FOOD_COLORS.RED, loggedDate: new Date('2025-01-06') },
    { color: FOOD_COLORS.YELLOW, loggedDate: new Date('2025-01-06') },
  ];
  
  const colors = calculateDailyColors(foods, new Date('2025-01-06'));
  
  assert.strictEqual(colors.length, 3);
  assert.ok(colors.includes(FOOD_COLORS.GREEN));
  assert.ok(colors.includes(FOOD_COLORS.RED));
  assert.ok(colors.includes(FOOD_COLORS.YELLOW));
});

test('calculateDailyColors - duplicate colors on same day are deduplicated', () => {
  const foods: FoodWithColor[] = [
    { color: FOOD_COLORS.GREEN, loggedDate: new Date('2025-01-06') },
    { color: FOOD_COLORS.GREEN, loggedDate: new Date('2025-01-06') },
    { color: FOOD_COLORS.RED, loggedDate: new Date('2025-01-06') },
    { color: FOOD_COLORS.RED, loggedDate: new Date('2025-01-06') },
  ];
  
  const colors = calculateDailyColors(foods, new Date('2025-01-06'));
  
  assert.strictEqual(colors.length, 2);
  assert.ok(colors.includes(FOOD_COLORS.GREEN));
  assert.ok(colors.includes(FOOD_COLORS.RED));
});

// ============================================================================
// calculateDailyColors Tests - Multiple Days
// ============================================================================

test('calculateDailyColors - filters by specific date across multiple days', () => {
  const foods: FoodWithColor[] = [
    { color: FOOD_COLORS.GREEN, loggedDate: new Date('2025-01-06') },
    { color: FOOD_COLORS.RED, loggedDate: new Date('2025-01-07') },
    { color: FOOD_COLORS.YELLOW, loggedDate: new Date('2025-01-08') },
  ];
  
  const mondayColors = calculateDailyColors(foods, new Date('2025-01-06'));
  const tuesdayColors = calculateDailyColors(foods, new Date('2025-01-07'));
  const wednesdayColors = calculateDailyColors(foods, new Date('2025-01-08'));
  
  assert.strictEqual(mondayColors.length, 1);
  assert.ok(mondayColors.includes(FOOD_COLORS.GREEN));
  
  assert.strictEqual(tuesdayColors.length, 1);
  assert.ok(tuesdayColors.includes(FOOD_COLORS.RED));
  
  assert.strictEqual(wednesdayColors.length, 1);
  assert.ok(wednesdayColors.includes(FOOD_COLORS.YELLOW));
});

test('calculateDailyColors - cabbage scenario across multiple days', () => {
  const foods: FoodWithColor[] = [
    { color: FOOD_COLORS.GREEN, loggedDate: new Date('2025-01-06') },
    { color: FOOD_COLORS.BLUE_PURPLE, loggedDate: new Date('2025-01-07') },
    { color: FOOD_COLORS.WHITE_TAN, loggedDate: new Date('2025-01-08') },
  ];
  
  const mondayColors = calculateDailyColors(foods, new Date('2025-01-06'));
  const tuesdayColors = calculateDailyColors(foods, new Date('2025-01-07'));
  const wednesdayColors = calculateDailyColors(foods, new Date('2025-01-08'));
  
  // Monday: only green
  assert.strictEqual(mondayColors.length, 1);
  assert.ok(mondayColors.includes(FOOD_COLORS.GREEN));
  
  // Tuesday: only purple
  assert.strictEqual(tuesdayColors.length, 1);
  assert.ok(tuesdayColors.includes(FOOD_COLORS.BLUE_PURPLE));
  
  // Wednesday: only white
  assert.strictEqual(wednesdayColors.length, 1);
  assert.ok(wednesdayColors.includes(FOOD_COLORS.WHITE_TAN));
});

test('calculateDailyColors - same day multiple times with different foods', () => {
  const jan6Morning = new Date(2025, 0, 6, 8, 0, 0); // Jan 6, 8am local time
  const jan6Noon = new Date(2025, 0, 6, 12, 0, 0); // Jan 6, 12pm local time
  const jan6Evening = new Date(2025, 0, 6, 18, 0, 0); // Jan 6, 6pm local time
  const jan7Morning = new Date(2025, 0, 7, 10, 0, 0); // Jan 7, 10am local time
  
  const foods: FoodWithColor[] = [
    { color: FOOD_COLORS.GREEN, loggedDate: jan6Morning },
    { color: FOOD_COLORS.RED, loggedDate: jan6Noon },
    { color: FOOD_COLORS.YELLOW, loggedDate: jan6Evening },
    { color: FOOD_COLORS.BLUE_PURPLE, loggedDate: jan7Morning },
  ];
  
  const colors = calculateDailyColors(foods, new Date(2025, 0, 6)); // Jan 6 local time
  
  // Should get all three colors from Jan 6, ignoring time
  assert.strictEqual(colors.length, 3);
  assert.ok(colors.includes(FOOD_COLORS.GREEN));
  assert.ok(colors.includes(FOOD_COLORS.RED));
  assert.ok(colors.includes(FOOD_COLORS.YELLOW));
  assert.ok(!colors.includes(FOOD_COLORS.BLUE_PURPLE));
});

// ============================================================================
// calculateDailyColors Tests - Time Handling
// ============================================================================

test('calculateDailyColors - ignores time component, only matches date', () => {
  const jan6Late = new Date(2025, 0, 6, 23, 59, 59); // Jan 6, 11:59:59pm local time
  const jan6Early = new Date(2025, 0, 6, 0, 0, 0); // Jan 6, 12:00:00am local time
  
  const foods: FoodWithColor[] = [
    { color: FOOD_COLORS.GREEN, loggedDate: jan6Late },
    { color: FOOD_COLORS.RED, loggedDate: jan6Early },
  ];
  
  const colors = calculateDailyColors(foods, new Date(2025, 0, 6, 12, 0, 0)); // Jan 6, noon local time
  
  assert.strictEqual(colors.length, 2);
  assert.ok(colors.includes(FOOD_COLORS.GREEN));
  assert.ok(colors.includes(FOOD_COLORS.RED));
});

// ============================================================================
// hasAllColors Tests
// ============================================================================

test('hasAllColors - returns true when all 6 colors present', () => {
  const colors: FoodColor[] = [
    FOOD_COLORS.RED,
    FOOD_COLORS.ORANGE,
    FOOD_COLORS.YELLOW,
    FOOD_COLORS.GREEN,
    FOOD_COLORS.BLUE_PURPLE,
    FOOD_COLORS.WHITE_TAN,
  ];
  
  assert.strictEqual(hasAllColors(colors), true);
});

test('hasAllColors - returns false when missing colors', () => {
  const colors: FoodColor[] = [
    FOOD_COLORS.RED,
    FOOD_COLORS.GREEN,
    FOOD_COLORS.BLUE_PURPLE,
  ];
  
  assert.strictEqual(hasAllColors(colors), false);
});

test('hasAllColors - returns false for empty array', () => {
  const colors: FoodColor[] = [];
  assert.strictEqual(hasAllColors(colors), false);
});

// ============================================================================
// getMissingColors Tests
// ============================================================================

test('getMissingColors - returns all colors when none achieved', () => {
  const achievedColors: FoodColor[] = [];
  const missing = getMissingColors(achievedColors);
  
  assert.strictEqual(missing.length, 6);
  assert.ok(missing.includes(FOOD_COLORS.RED));
  assert.ok(missing.includes(FOOD_COLORS.ORANGE));
  assert.ok(missing.includes(FOOD_COLORS.YELLOW));
  assert.ok(missing.includes(FOOD_COLORS.GREEN));
  assert.ok(missing.includes(FOOD_COLORS.BLUE_PURPLE));
  assert.ok(missing.includes(FOOD_COLORS.WHITE_TAN));
});

test('getMissingColors - returns empty array when all colors achieved', () => {
  const achievedColors: FoodColor[] = [
    FOOD_COLORS.RED,
    FOOD_COLORS.ORANGE,
    FOOD_COLORS.YELLOW,
    FOOD_COLORS.GREEN,
    FOOD_COLORS.BLUE_PURPLE,
    FOOD_COLORS.WHITE_TAN,
  ];
  
  const missing = getMissingColors(achievedColors);
  assert.strictEqual(missing.length, 0);
});

test('getMissingColors - returns only missing colors', () => {
  const achievedColors: FoodColor[] = [
    FOOD_COLORS.RED,
    FOOD_COLORS.GREEN,
    FOOD_COLORS.BLUE_PURPLE,
  ];
  
  const missing = getMissingColors(achievedColors);
  
  assert.strictEqual(missing.length, 3);
  assert.ok(missing.includes(FOOD_COLORS.ORANGE));
  assert.ok(missing.includes(FOOD_COLORS.YELLOW));
  assert.ok(missing.includes(FOOD_COLORS.WHITE_TAN));
  assert.ok(!missing.includes(FOOD_COLORS.RED));
  assert.ok(!missing.includes(FOOD_COLORS.GREEN));
  assert.ok(!missing.includes(FOOD_COLORS.BLUE_PURPLE));
});

// ============================================================================
// Integration Tests
// ============================================================================

test('integration - weekly colors include all daily colors', () => {
  const foods: FoodWithColor[] = [
    { color: FOOD_COLORS.GREEN, loggedDate: new Date('2025-01-06') },
    { color: FOOD_COLORS.RED, loggedDate: new Date('2025-01-07') },
    { color: FOOD_COLORS.YELLOW, loggedDate: new Date('2025-01-08') },
  ];
  
  const weeklyColors = calculateWeeklyColors(foods);
  const mondayColors = calculateDailyColors(foods, new Date('2025-01-06'));
  const tuesdayColors = calculateDailyColors(foods, new Date('2025-01-07'));
  const wednesdayColors = calculateDailyColors(foods, new Date('2025-01-08'));
  
  // All daily colors should be in weekly colors
  mondayColors.forEach(color => {
    assert.ok(weeklyColors.includes(color));
  });
  
  tuesdayColors.forEach(color => {
    assert.ok(weeklyColors.includes(color));
  });
  
  wednesdayColors.forEach(color => {
    assert.ok(weeklyColors.includes(color));
  });
  
  assert.strictEqual(weeklyColors.length, 3);
});