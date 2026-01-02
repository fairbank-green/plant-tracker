// src/stores/foodLogging.integration.test.ts
import { test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { setActivePinia, createPinia } from 'pinia';
import 'fake-indexeddb/auto';
import { useWeeklyStore } from './weeklyStore.js';
import { useDailyStore } from './dailyStore.js';
import { clearAllData } from '../infrastructure/db.js';
import { FOOD_CATEGORIES, FOOD_COLORS } from '../domain/types.js';

// ============================================================================
// Setup
// ============================================================================

beforeEach(async () => {
  setActivePinia(createPinia());
  await clearAllData();
});

// ============================================================================
// Basic Food Logging Tests
// ============================================================================

test('logFood - successfully logs new food', async () => {
  const weeklyStore = useWeeklyStore();
  const dailyStore = useDailyStore();
  
  await weeklyStore.initialize();
  await dailyStore.initialize();

  const result = await weeklyStore.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.isDuplicate, false);
  assert.strictEqual(weeklyStore.foodInstances.length, 1);
  assert.strictEqual(weeklyStore.totalPoints, 1);
});

test('logFood - rejects duplicate instance', async () => {
  const weeklyStore = useWeeklyStore();
  await weeklyStore.initialize();

  // Log first time
  await weeklyStore.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });

  // Try to log exact same combination
  const result = await weeklyStore.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });

  assert.strictEqual(result.success, false);
  assert.strictEqual(result.isDuplicate, true);
  assert.strictEqual(weeklyStore.foodInstances.length, 1);
});

test('logFood - allows same food with different color', async () => {
  const weeklyStore = useWeeklyStore();
  await weeklyStore.initialize();

  // Log green cabbage
  await weeklyStore.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });

  // Log purple cabbage
  const result = await weeklyStore.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.BLUE_PURPLE,
    isFermented: false,
    pointValue: 1,
  });

  assert.strictEqual(result.success, true);
  assert.strictEqual(weeklyStore.foodInstances.length, 2);
  assert.strictEqual(weeklyStore.totalPoints, 1); // Only counted once
});

test('logFood - allows same food with different fermentation status', async () => {
  const weeklyStore = useWeeklyStore();
  await weeklyStore.initialize();

  // Log fresh cabbage
  await weeklyStore.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });

  // Log fermented cabbage (sauerkraut)
  const result = await weeklyStore.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: true,
    pointValue: 1,
  });

  assert.strictEqual(result.success, true);
  assert.strictEqual(weeklyStore.foodInstances.length, 2);
});

// ============================================================================
// Points Calculation Tests
// ============================================================================

test('logFood - updates totalPoints for new food', async () => {
  const weeklyStore = useWeeklyStore();
  await weeklyStore.initialize();

  assert.strictEqual(weeklyStore.totalPoints, 0);

  await weeklyStore.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });

  assert.strictEqual(weeklyStore.totalPoints, 1);
});

test('logFood - does not update totalPoints for duplicate foodId', async () => {
  const weeklyStore = useWeeklyStore();
  await weeklyStore.initialize();

  // First instance
  await weeklyStore.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });

  assert.strictEqual(weeklyStore.totalPoints, 1);

  // Second instance (different color)
  await weeklyStore.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.BLUE_PURPLE,
    isFermented: false,
    pointValue: 1,
  });

  assert.strictEqual(weeklyStore.totalPoints, 1); // Still 1
});

test('logFood - handles herb/spice fractional points', async () => {
  const weeklyStore = useWeeklyStore();
  await weeklyStore.initialize();

  await weeklyStore.addFood({
    foodId: 'garlic',
    foodName: 'Garlic',
    category: FOOD_CATEGORIES.HERBS_SPICES,
    color: FOOD_COLORS.WHITE_TAN,
    isFermented: false,
    pointValue: 0.25,
  });

  assert.strictEqual(weeklyStore.totalPoints, 0.25);
});

test('logFood - mixed categories calculate correctly', async () => {
  const weeklyStore = useWeeklyStore();
  await weeklyStore.initialize();

  await weeklyStore.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });

  await weeklyStore.addFood({
    foodId: 'apple',
    foodName: 'Apple',
    category: FOOD_CATEGORIES.FRUITS,
    color: FOOD_COLORS.RED,
    isFermented: false,
    pointValue: 1,
  });

  await weeklyStore.addFood({
    foodId: 'garlic',
    foodName: 'Garlic',
    category: FOOD_CATEGORIES.HERBS_SPICES,
    color: FOOD_COLORS.WHITE_TAN,
    isFermented: false,
    pointValue: 0.25,
  });

  assert.strictEqual(weeklyStore.totalPoints, 2.25);
});

// ============================================================================
// Color Tracking Tests
// ============================================================================

test('logFood - updates weekly colors', async () => {
  const weeklyStore = useWeeklyStore();
  await weeklyStore.initialize();

  await weeklyStore.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });

  assert.strictEqual(weeklyStore.colorsAchieved.length, 1);
  assert.ok(weeklyStore.colorsAchieved.includes(FOOD_COLORS.GREEN));
});

test('logFood - accumulates multiple colors', async () => {
  const weeklyStore = useWeeklyStore();
  await weeklyStore.initialize();

  await weeklyStore.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });

  await weeklyStore.addFood({
    foodId: 'tomato',
    foodName: 'Tomato',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.RED,
    isFermented: false,
    pointValue: 1,
  });

  assert.strictEqual(weeklyStore.colorsAchieved.length, 2);
  assert.ok(weeklyStore.colorsAchieved.includes(FOOD_COLORS.GREEN));
  assert.ok(weeklyStore.colorsAchieved.includes(FOOD_COLORS.RED));
});

test('logFood - cabbage scenario tracks 3 colors from 1 food', async () => {
  const weeklyStore = useWeeklyStore();
  await weeklyStore.initialize();

  await weeklyStore.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });

  await weeklyStore.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.BLUE_PURPLE,
    isFermented: false,
    pointValue: 1,
  });

  await weeklyStore.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.WHITE_TAN,
    isFermented: true,
    pointValue: 1,
  });

  assert.strictEqual(weeklyStore.totalPoints, 1);
  assert.strictEqual(weeklyStore.colorsAchieved.length, 3);
  assert.ok(weeklyStore.colorsAchieved.includes(FOOD_COLORS.GREEN));
  assert.ok(weeklyStore.colorsAchieved.includes(FOOD_COLORS.BLUE_PURPLE));
  assert.ok(weeklyStore.colorsAchieved.includes(FOOD_COLORS.WHITE_TAN));
});

// ============================================================================
// Daily Integration Tests
// ============================================================================

test('logFood - updates daily colors when updateFromFoodInstances called', async () => {
  const weeklyStore = useWeeklyStore();
  const dailyStore = useDailyStore();
  
  await weeklyStore.initialize();
  await dailyStore.initialize();

  await weeklyStore.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });

  // Update daily from weekly instances
  await dailyStore.updateFromFoodInstances(weeklyStore.foodInstances);

  assert.strictEqual(dailyStore.colorsEaten.length, 1);
  assert.ok(dailyStore.colorsEaten.includes(FOOD_COLORS.GREEN));
});

test('logFood - updates fermented status when fermented food logged', async () => {
  const weeklyStore = useWeeklyStore();
  const dailyStore = useDailyStore();
  
  await weeklyStore.initialize();
  await dailyStore.initialize();

  await weeklyStore.addFood({
    foodId: 'sauerkraut',
    foodName: 'Sauerkraut',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.WHITE_TAN,
    isFermented: true,
    pointValue: 1,
  });

  await dailyStore.updateFromFoodInstances(weeklyStore.foodInstances);

  assert.strictEqual(dailyStore.fermentedFoodEaten, true);
});

test('logFood - daily tracking only includes today\'s foods', async () => {
  const weeklyStore = useWeeklyStore();
  const dailyStore = useDailyStore();
  
  await weeklyStore.initialize();
  await dailyStore.initialize();

  // Add a food from yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  weeklyStore.foodInstances.push({
    instanceId: 'old_instance',
    foodId: 'old_food',
    foodName: 'Old Food',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.RED,
    isFermented: false,
    loggedDate: yesterday,
    pointValue: 1,
    firstLoggedDate: yesterday,
  });

  // Add today's food
  await weeklyStore.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });

  await dailyStore.updateFromFoodInstances(weeklyStore.foodInstances);

  // Should only have green (today), not red (yesterday)
  assert.strictEqual(dailyStore.colorsEaten.length, 1);
  assert.ok(dailyStore.colorsEaten.includes(FOOD_COLORS.GREEN));
  assert.ok(!dailyStore.colorsEaten.includes(FOOD_COLORS.RED));
});

// ============================================================================
// Category Breakdown Tests
// ============================================================================

test('logFood - updates category breakdown', async () => {
  const weeklyStore = useWeeklyStore();
  await weeklyStore.initialize();

  await weeklyStore.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });

  assert.strictEqual(weeklyStore.categoryBreakdown.vegetables, 1);
  assert.strictEqual(weeklyStore.categoryBreakdown.fruits, 0);
});

test('logFood - multiple foods in same category', async () => {
  const weeklyStore = useWeeklyStore();
  await weeklyStore.initialize();

  await weeklyStore.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });

  await weeklyStore.addFood({
    foodId: 'broccoli',
    foodName: 'Broccoli',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });

  assert.strictEqual(weeklyStore.categoryBreakdown.vegetables, 2);
});

// ============================================================================
// Complete Workflow Test
// ============================================================================

test('complete workflow - log food and verify all state updates', async () => {
  const weeklyStore = useWeeklyStore();
  const dailyStore = useDailyStore();
  
  await weeklyStore.initialize();
  await dailyStore.initialize();

  // Log a fermented food with color
  const result = await weeklyStore.addFood({
    foodId: 'kimchi',
    foodName: 'Kimchi',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.RED,
    isFermented: true,
    pointValue: 1,
  });

  // Update daily tracking
  await dailyStore.updateFromFoodInstances(weeklyStore.foodInstances);

  // Verify weekly state
  assert.strictEqual(result.success, true);
  assert.strictEqual(weeklyStore.foodInstances.length, 1);
  assert.strictEqual(weeklyStore.totalPoints, 1);
  assert.strictEqual(weeklyStore.uniqueFoodIds.length, 1);
  assert.ok(weeklyStore.colorsAchieved.includes(FOOD_COLORS.RED));
  assert.strictEqual(weeklyStore.categoryBreakdown.vegetables, 1);

  // Verify daily state
  assert.ok(dailyStore.colorsEaten.includes(FOOD_COLORS.RED));
  assert.strictEqual(dailyStore.fermentedFoodEaten, true);
});