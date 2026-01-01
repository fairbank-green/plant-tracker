// src/stores/dailyStore.test.ts
import { test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { setActivePinia, createPinia } from 'pinia';
import 'fake-indexeddb/auto';
import { useDailyStore } from './dailyStore.js';
import { clearAllData } from '../infrastructure/db.js';
import { FOOD_COLORS } from '../domain/types.js';

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

test('initialize - sets up empty day when no data exists', async () => {
  const store = useDailyStore();
  
  await store.initialize();
  
  assert.strictEqual(store.isInitialized, true);
  assert.strictEqual(store.waterGlasses, 0);
  assert.strictEqual(store.colorsEaten.length, 0);
  assert.strictEqual(store.fermentedFoodEaten, false);
});

test('initialize - only runs once', async () => {
  const store = useDailyStore();
  
  await store.initialize();
  await store.incrementWater();
  
  const waterCount = store.waterGlasses;
  
  await store.initialize();
  
  assert.strictEqual(store.waterGlasses, waterCount);
});

test('initialize - loads existing data from IndexedDB', async () => {
  // First store: add some data
  const store1 = useDailyStore();
  await store1.initialize();
  
  await store1.incrementWater();
  await store1.incrementWater();
  await store1.addColor(FOOD_COLORS.GREEN);
  
  // Create new store instance (simulates page reload)
  setActivePinia(createPinia());
  const store2 = useDailyStore();
  await store2.initialize();
  
  assert.strictEqual(store2.waterGlasses, 2);
  assert.strictEqual(store2.colorsEaten.length, 1);
  assert.ok(store2.colorsEaten.includes(FOOD_COLORS.GREEN));
});

// ============================================================================
// Water Counter Tests - Increment/Decrement
// ============================================================================

test('incrementWater - increases count by 1', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.incrementWater();
  
  assert.strictEqual(store.waterGlasses, 1);
});

test('incrementWater - increases multiple times', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.incrementWater();
  await store.incrementWater();
  await store.incrementWater();
  
  assert.strictEqual(store.waterGlasses, 3);
});

test('incrementWater - respects maximum (20)', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  // Set to max
  await store.setWaterGlasses(20);
  
  // Try to increment
  await store.incrementWater();
  
  assert.strictEqual(store.waterGlasses, 20);
});

test('decrementWater - decreases count by 1', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.incrementWater();
  await store.incrementWater();
  await store.decrementWater();
  
  assert.strictEqual(store.waterGlasses, 1);
});

test('decrementWater - respects minimum (0)', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.decrementWater();
  
  assert.strictEqual(store.waterGlasses, 0);
});

test('decrementWater - decreases from positive value', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.setWaterGlasses(5);
  await store.decrementWater();
  
  assert.strictEqual(store.waterGlasses, 4);
});

test('setWaterGlasses - sets to specific value', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.setWaterGlasses(6);
  
  assert.strictEqual(store.waterGlasses, 6);
});

test('setWaterGlasses - rejects values below minimum', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.setWaterGlasses(5);
  await store.setWaterGlasses(-1);
  
  assert.strictEqual(store.waterGlasses, 5); // Unchanged
});

test('setWaterGlasses - rejects values above maximum', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.setWaterGlasses(5);
  await store.setWaterGlasses(25);
  
  assert.strictEqual(store.waterGlasses, 5); // Unchanged
});

test('setWaterGlasses - accepts boundary values', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.setWaterGlasses(0);
  assert.strictEqual(store.waterGlasses, 0);
  
  await store.setWaterGlasses(20);
  assert.strictEqual(store.waterGlasses, 20);
});

// ============================================================================
// Water Goal Tests
// ============================================================================

test('waterGoalAchieved - false when below 8 glasses', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.setWaterGlasses(7);
  
  assert.strictEqual(store.waterGoalAchieved, false);
});

test('waterGoalAchieved - true when exactly 8 glasses', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.setWaterGlasses(8);
  
  assert.strictEqual(store.waterGoalAchieved, true);
});

test('waterGoalAchieved - true when above 8 glasses', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.setWaterGlasses(10);
  
  assert.strictEqual(store.waterGoalAchieved, true);
});

// ============================================================================
// Color Tracking Tests
// ============================================================================

test('addColor - adds first color', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.addColor(FOOD_COLORS.GREEN);
  
  assert.strictEqual(store.colorsEaten.length, 1);
  assert.ok(store.colorsEaten.includes(FOOD_COLORS.GREEN));
});

test('addColor - adds multiple different colors', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.addColor(FOOD_COLORS.GREEN);
  await store.addColor(FOOD_COLORS.RED);
  await store.addColor(FOOD_COLORS.YELLOW);
  
  assert.strictEqual(store.colorsEaten.length, 3);
  assert.ok(store.colorsEaten.includes(FOOD_COLORS.GREEN));
  assert.ok(store.colorsEaten.includes(FOOD_COLORS.RED));
  assert.ok(store.colorsEaten.includes(FOOD_COLORS.YELLOW));
});

test('addColor - ignores duplicate colors', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.addColor(FOOD_COLORS.GREEN);
  await store.addColor(FOOD_COLORS.GREEN);
  await store.addColor(FOOD_COLORS.GREEN);
  
  assert.strictEqual(store.colorsEaten.length, 1);
});

test('colorsCount - returns number of unique colors', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  assert.strictEqual(store.colorsCount, 0);
  
  await store.addColor(FOOD_COLORS.GREEN);
  assert.strictEqual(store.colorsCount, 1);
  
  await store.addColor(FOOD_COLORS.RED);
  assert.strictEqual(store.colorsCount, 2);
});

test('allColorsAchieved - false when less than 6 colors', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.addColor(FOOD_COLORS.GREEN);
  await store.addColor(FOOD_COLORS.RED);
  
  assert.strictEqual(store.allColorsAchieved, false);
});

test('allColorsAchieved - true when all 6 colors achieved', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.addColor(FOOD_COLORS.RED);
  await store.addColor(FOOD_COLORS.ORANGE);
  await store.addColor(FOOD_COLORS.YELLOW);
  await store.addColor(FOOD_COLORS.GREEN);
  await store.addColor(FOOD_COLORS.BLUE_PURPLE);
  await store.addColor(FOOD_COLORS.WHITE_TAN);
  
  assert.strictEqual(store.allColorsAchieved, true);
  assert.strictEqual(store.colorsCount, 6);
});

// ============================================================================
// Fermented Food Tests
// ============================================================================

test('markFermentedFood - sets flag to true', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  assert.strictEqual(store.fermentedFoodEaten, false);
  
  await store.markFermentedFood();
  
  assert.strictEqual(store.fermentedFoodEaten, true);
});

test('markFermentedFood - idempotent (calling multiple times)', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.markFermentedFood();
  await store.markFermentedFood();
  await store.markFermentedFood();
  
  assert.strictEqual(store.fermentedFoodEaten, true);
});

// ============================================================================
// Update From Food Instances Tests
// ============================================================================

test('updateFromFoodInstances - updates colors from food instances', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  const instances = [
    {
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date(),
    },
    {
      color: FOOD_COLORS.RED,
      isFermented: false,
      loggedDate: new Date(),
    },
  ];
  
  await store.updateFromFoodInstances(instances);
  
  assert.strictEqual(store.colorsEaten.length, 2);
  assert.ok(store.colorsEaten.includes(FOOD_COLORS.GREEN));
  assert.ok(store.colorsEaten.includes(FOOD_COLORS.RED));
});

test('updateFromFoodInstances - updates fermented flag when present', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  const instances = [
    {
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date(),
    },
    {
      color: FOOD_COLORS.WHITE_TAN,
      isFermented: true,
      loggedDate: new Date(),
    },
  ];
  
  await store.updateFromFoodInstances(instances);
  
  assert.strictEqual(store.fermentedFoodEaten, true);
});

test('updateFromFoodInstances - ignores instances from other days', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const instances = [
    {
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: today,
    },
    {
      color: FOOD_COLORS.RED,
      isFermented: false,
      loggedDate: yesterday,
    },
  ];
  
  await store.updateFromFoodInstances(instances);
  
  assert.strictEqual(store.colorsEaten.length, 1);
  assert.ok(store.colorsEaten.includes(FOOD_COLORS.GREEN));
  assert.ok(!store.colorsEaten.includes(FOOD_COLORS.RED));
});

test('updateFromFoodInstances - deduplicates colors', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  const instances = [
    {
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date(),
    },
    {
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date(),
    },
    {
      color: FOOD_COLORS.GREEN,
      isFermented: true,
      loggedDate: new Date(),
    },
  ];
  
  await store.updateFromFoodInstances(instances);
  
  assert.strictEqual(store.colorsEaten.length, 1);
  assert.ok(store.colorsEaten.includes(FOOD_COLORS.GREEN));
});

// ============================================================================
// Reset Tests
// ============================================================================

test('resetDaily - clears all daily data', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.setWaterGlasses(5);
  await store.addColor(FOOD_COLORS.GREEN);
  await store.markFermentedFood();
  
  await store.resetDaily();
  
  assert.strictEqual(store.waterGlasses, 0);
  assert.strictEqual(store.colorsEaten.length, 0);
  assert.strictEqual(store.fermentedFoodEaten, false);
});

test('checkForDayReset - resets when day changes', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  // Add some data
  await store.setWaterGlasses(5);
  await store.addColor(FOOD_COLORS.GREEN);
  await store.markFermentedFood();
  
  // Manually set current date to yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  store.currentDate = yesterday;
  
  // Check for reset (should detect new day)
  await store.checkForDayReset();
  
  assert.strictEqual(store.waterGlasses, 0);
  assert.strictEqual(store.colorsEaten.length, 0);
  assert.strictEqual(store.fermentedFoodEaten, false);
});

test('checkForDayReset - does not reset on same day', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  await store.setWaterGlasses(5);
  await store.addColor(FOOD_COLORS.GREEN);
  
  await store.checkForDayReset();
  
  assert.strictEqual(store.waterGlasses, 5);
  assert.strictEqual(store.colorsEaten.length, 1);
});

test('checkForDayReset - updates current date', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  // Set to yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  store.currentDate = yesterday;
  
  const oldDateString = store.currentDateString;
  
  await store.checkForDayReset();
  
  // Date should be updated
  assert.notStrictEqual(store.currentDateString, oldDateString);
});

// ============================================================================
// Date String Tests
// ============================================================================

test('currentDateString - formats date correctly', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  // Set to a specific date
  store.currentDate = new Date(2025, 0, 6); // Jan 6, 2025
  
  assert.strictEqual(store.currentDateString, '2025-01-06');
});

test('currentDateString - handles single-digit months and days', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  store.currentDate = new Date(2025, 0, 5); // Jan 5, 2025
  
  assert.strictEqual(store.currentDateString, '2025-01-05');
});

// ============================================================================
// Integration Tests
// ============================================================================

test('integration - typical day tracking', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  // Morning: drink some water
  await store.incrementWater();
  await store.incrementWater();
  
  // Breakfast: green smoothie
  await store.addColor(FOOD_COLORS.GREEN);
  
  // Lunch: eat more colors
  await store.addColor(FOOD_COLORS.RED);
  await store.addColor(FOOD_COLORS.YELLOW);
  
  // Afternoon: more water
  await store.incrementWater();
  await store.incrementWater();
  await store.incrementWater();
  await store.incrementWater();
  
  // Dinner: fermented food
  await store.markFermentedFood();
  await store.addColor(FOOD_COLORS.BLUE_PURPLE);
  
  // Evening: final water
  await store.incrementWater();
  await store.incrementWater();
  
  // Check results
  assert.strictEqual(store.waterGlasses, 8);
  assert.strictEqual(store.waterGoalAchieved, true);
  assert.strictEqual(store.colorsCount, 4);
  assert.strictEqual(store.fermentedFoodEaten, true);
});

test('integration - persistence across reload', async () => {
  // First session
  const store1 = useDailyStore();
  await store1.initialize();
  
  await store1.setWaterGlasses(6);
  await store1.addColor(FOOD_COLORS.GREEN);
  await store1.addColor(FOOD_COLORS.RED);
  await store1.markFermentedFood();
  
  // Simulate page reload
  setActivePinia(createPinia());
  const store2 = useDailyStore();
  await store2.initialize();
  
  // Data should be restored
  assert.strictEqual(store2.waterGlasses, 6);
  assert.strictEqual(store2.colorsCount, 2);
  assert.strictEqual(store2.fermentedFoodEaten, true);
});

test('integration - reset at midnight clears previous day', async () => {
  const store = useDailyStore();
  await store.initialize();
  
  // Fill up the day
  await store.setWaterGlasses(8);
  await store.addColor(FOOD_COLORS.GREEN);
  await store.addColor(FOOD_COLORS.RED);
  await store.addColor(FOOD_COLORS.YELLOW);
  await store.markFermentedFood();
  
  // Simulate midnight reset
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  store.currentDate = yesterday;
  
  await store.checkForDayReset();
  
  // Should be fresh day
  assert.strictEqual(store.waterGlasses, 0);
  assert.strictEqual(store.colorsCount, 0);
  assert.strictEqual(store.fermentedFoodEaten, false);
  assert.strictEqual(store.waterGoalAchieved, false);
  assert.strictEqual(store.allColorsAchieved, false);
});