// src/stores/weeklyStore.test.ts
import { test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { setActivePinia, createPinia } from 'pinia';
import 'fake-indexeddb/auto';
import { useWeeklyStore } from './weeklyStore.js';
import { clearAllData } from '../infrastructure/db.js';
import { FOOD_CATEGORIES, FOOD_COLORS } from '../domain/types.js';

// ============================================================================
// Setup
// ============================================================================

beforeEach(async () => {
  // Create fresh Pinia instance for each test
  setActivePinia(createPinia());
  
  // Clear IndexedDB
  await clearAllData();
});

// ============================================================================
// Initialization Tests
// ============================================================================

test('initialize - sets up empty week when no data exists', async () => {
  const store = useWeeklyStore();
  
  await store.initialize();
  
  assert.strictEqual(store.isInitialized, true);
  assert.strictEqual(store.foodInstances.length, 0);
  assert.strictEqual(store.totalPoints, 0);
  assert.strictEqual(store.currentStreak, 0);
});

test('initialize - only runs once', async () => {
  const store = useWeeklyStore();
  
  await store.initialize();
  const firstInitTime = store.weekStart;
  
  await store.initialize();
  
  assert.strictEqual(store.weekStart, firstInitTime);
});

test('initialize - loads existing data from IndexedDB', async () => {
  // First store: add some data
  const store1 = useWeeklyStore();
  await store1.initialize();
  
  await store1.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  // Create new store instance (simulates page reload)
  setActivePinia(createPinia());
  const store2 = useWeeklyStore();
  await store2.initialize();
  
  assert.strictEqual(store2.foodInstances.length, 1);
  assert.strictEqual(store2.foodInstances[0].foodId, 'spinach');
  assert.strictEqual(store2.totalPoints, 1);
});

// ============================================================================
// Add Food Tests
// ============================================================================

test('addFood - adds first food successfully', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  const result = await store.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.isDuplicate, false);
  assert.strictEqual(store.foodInstances.length, 1);
  assert.strictEqual(store.foodInstances[0].foodId, 'spinach');
});

test('addFood - adds multiple different foods', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  await store.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  await store.addFood({
    foodId: 'apple',
    foodName: 'Apple',
    category: FOOD_CATEGORIES.FRUITS,
    color: FOOD_COLORS.RED,
    isFermented: false,
    pointValue: 1,
  });
  
  assert.strictEqual(store.foodInstances.length, 2);
  assert.strictEqual(store.uniqueFoodIds.length, 2);
});

test('addFood - allows same food with different color', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  await store.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  const result = await store.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.BLUE_PURPLE,
    isFermented: false,
    pointValue: 1,
  });
  
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.isDuplicate, false);
  assert.strictEqual(store.foodInstances.length, 2);
  assert.strictEqual(store.uniqueFoodIds.length, 1); // Same food, counted once
});

test('addFood - rejects duplicate instance (same foodId, color, fermentation)', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  await store.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  const result = await store.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.isDuplicate, true);
  assert.strictEqual(store.foodInstances.length, 1);
});

// ============================================================================
// Derived State Tests - totalPoints
// ============================================================================

test('totalPoints - starts at 0', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  assert.strictEqual(store.totalPoints, 0);
});

test('totalPoints - updates after adding food', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  await store.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  assert.strictEqual(store.totalPoints, 1);
});

test('totalPoints - adds multiple foods correctly', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  await store.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  await store.addFood({
    foodId: 'apple',
    foodName: 'Apple',
    category: FOOD_CATEGORIES.FRUITS,
    color: FOOD_COLORS.RED,
    isFermented: false,
    pointValue: 1,
  });
  
  assert.strictEqual(store.totalPoints, 2);
});

test('totalPoints - same food logged multiple times counts once', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  await store.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  await store.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.BLUE_PURPLE,
    isFermented: false,
    pointValue: 1,
  });
  
  await store.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.WHITE_TAN,
    isFermented: true,
    pointValue: 1,
  });
  
  assert.strictEqual(store.foodInstances.length, 3);
  assert.strictEqual(store.totalPoints, 1); // Only counted once
});

test('totalPoints - handles herbs/spices (0.25 points)', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  await store.addFood({
    foodId: 'garlic',
    foodName: 'Garlic',
    category: FOOD_CATEGORIES.HERBS_SPICES,
    color: FOOD_COLORS.WHITE_TAN,
    isFermented: false,
    pointValue: 0.25,
  });
  
  assert.strictEqual(store.totalPoints, 0.25);
});

test('totalPoints - mixed categories calculate correctly', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  await store.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  await store.addFood({
    foodId: 'garlic',
    foodName: 'Garlic',
    category: FOOD_CATEGORIES.HERBS_SPICES,
    color: FOOD_COLORS.WHITE_TAN,
    isFermented: false,
    pointValue: 0.25,
  });
  
  await store.addFood({
    foodId: 'turmeric',
    foodName: 'Turmeric',
    category: FOOD_CATEGORIES.HERBS_SPICES,
    color: FOOD_COLORS.ORANGE,
    isFermented: false,
    pointValue: 0.25,
  });
  
  assert.strictEqual(store.totalPoints, 1.5);
});

// ============================================================================
// Derived State Tests - categoryBreakdown
// ============================================================================

test('categoryBreakdown - starts with all zeros', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  assert.strictEqual(store.categoryBreakdown.vegetables, 0);
  assert.strictEqual(store.categoryBreakdown.fruits, 0);
  assert.strictEqual(store.categoryBreakdown.whole_grains, 0);
  assert.strictEqual(store.categoryBreakdown.nuts_seeds, 0);
  assert.strictEqual(store.categoryBreakdown.legumes, 0);
  assert.strictEqual(store.categoryBreakdown.herbs_spices, 0);
});

test('categoryBreakdown - updates after adding food', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  await store.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  assert.strictEqual(store.categoryBreakdown.vegetables, 1);
  assert.strictEqual(store.categoryBreakdown.fruits, 0);
});

test('categoryBreakdown - tracks multiple categories', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  await store.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  await store.addFood({
    foodId: 'broccoli',
    foodName: 'Broccoli',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  await store.addFood({
    foodId: 'apple',
    foodName: 'Apple',
    category: FOOD_CATEGORIES.FRUITS,
    color: FOOD_COLORS.RED,
    isFermented: false,
    pointValue: 1,
  });
  
  assert.strictEqual(store.categoryBreakdown.vegetables, 2);
  assert.strictEqual(store.categoryBreakdown.fruits, 1);
});

test('categoryBreakdown - handles herbs/spices correctly', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  await store.addFood({
    foodId: 'garlic',
    foodName: 'Garlic',
    category: FOOD_CATEGORIES.HERBS_SPICES,
    color: FOOD_COLORS.WHITE_TAN,
    isFermented: false,
    pointValue: 0.25,
  });
  
  await store.addFood({
    foodId: 'turmeric',
    foodName: 'Turmeric',
    category: FOOD_CATEGORIES.HERBS_SPICES,
    color: FOOD_COLORS.ORANGE,
    isFermented: false,
    pointValue: 0.25,
  });
  
  assert.strictEqual(store.categoryBreakdown.herbs_spices, 0.5);
});

// ============================================================================
// Derived State Tests - colorsAchieved
// ============================================================================

test('colorsAchieved - starts empty', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  assert.strictEqual(store.colorsAchieved.length, 0);
});

test('colorsAchieved - updates after adding food', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  await store.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  assert.strictEqual(store.colorsAchieved.length, 1);
  assert.ok(store.colorsAchieved.includes(FOOD_COLORS.GREEN));
});

test('colorsAchieved - deduplicates same colors', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  await store.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  await store.addFood({
    foodId: 'broccoli',
    foodName: 'Broccoli',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  assert.strictEqual(store.colorsAchieved.length, 1);
  assert.ok(store.colorsAchieved.includes(FOOD_COLORS.GREEN));
});

test('colorsAchieved - tracks cabbage scenario (3 colors from 1 food)', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  await store.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  await store.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.BLUE_PURPLE,
    isFermented: false,
    pointValue: 1,
  });
  
  await store.addFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.WHITE_TAN,
    isFermented: true,
    pointValue: 1,
  });
  
  assert.strictEqual(store.colorsAchieved.length, 3);
  assert.ok(store.colorsAchieved.includes(FOOD_COLORS.GREEN));
  assert.ok(store.colorsAchieved.includes(FOOD_COLORS.BLUE_PURPLE));
  assert.ok(store.colorsAchieved.includes(FOOD_COLORS.WHITE_TAN));
});

// ============================================================================
// Derived State Tests - goalAchieved
// ============================================================================

test('goalAchieved - false when below 30 points', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  await store.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  assert.strictEqual(store.goalAchieved, false);
});

test('goalAchieved - true when exactly 30 points', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  // Add 30 unique foods
  for (let i = 0; i < 30; i++) {
    await store.addFood({
      foodId: `food_${i}`,
      foodName: `Food ${i}`,
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      pointValue: 1,
    });
  }
  
  assert.strictEqual(store.totalPoints, 30);
  assert.strictEqual(store.goalAchieved, true);
});

test('goalAchieved - true when above 30 points', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  // Add 35 unique foods
  for (let i = 0; i < 35; i++) {
    await store.addFood({
      foodId: `food_${i}`,
      foodName: `Food ${i}`,
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      pointValue: 1,
    });
  }
  
  assert.strictEqual(store.totalPoints, 35);
  assert.strictEqual(store.goalAchieved, true);
});

// ============================================================================
// Remove Food Tests
// ============================================================================

test('removeFood - removes food instance', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  await store.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  const instanceId = store.foodInstances[0].instanceId;
  await store.removeFood(instanceId);
  
  assert.strictEqual(store.foodInstances.length, 0);
  assert.strictEqual(store.totalPoints, 0);
});

test('removeFood - updates derived state', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  await store.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  await store.addFood({
    foodId: 'apple',
    foodName: 'Apple',
    category: FOOD_CATEGORIES.FRUITS,
    color: FOOD_COLORS.RED,
    isFermented: false,
    pointValue: 1,
  });
  
  const instanceId = store.foodInstances[0].instanceId;
  await store.removeFood(instanceId);
  
  assert.strictEqual(store.foodInstances.length, 1);
  assert.strictEqual(store.totalPoints, 1);
  assert.strictEqual(store.categoryBreakdown.vegetables, 0);
  assert.strictEqual(store.categoryBreakdown.fruits, 1);
});

// ============================================================================
// Reset Week Tests
// ============================================================================

test('resetWeek - clears all food instances', async () => {
  const store = useWeeklyStore();
  await store.initialize();
  
  await store.addFood({
    foodId: 'spinach',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    pointValue: 1,
  });
  
  await store.resetWeek();
  
  assert.strictEqual(store.foodInstances.length, 0);
  assert.strictEqual(store.totalPoints, 0);
  assert.strictEqual(store.colorsAchieved.length, 0);
});