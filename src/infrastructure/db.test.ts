// src/infrastructure/db.test.ts
import 'fake-indexeddb/auto';
import { test, before, after } from 'node:test';
import assert from 'node:assert';
import {
  saveWeeklyData,
  loadWeeklyData,
  deleteWeeklyData,
  saveDailyData,
  loadDailyData,
  deleteDailyData,
  clearAllData,
  deleteDatabase,
  type WeeklyDataRecord,
  type DailyDataRecord,
} from './db.js';
import { FOOD_CATEGORIES, FOOD_COLORS } from '../domain/types.js';

// ============================================================================
// Test Fixtures
// ============================================================================

function createMockWeeklyData(userId: string): WeeklyDataRecord {
  return {
    id: userId,
    userId,
    weekStart: '2025-01-06T00:00:00.000Z',
    weekEnd: '2025-01-12T23:59:59.999Z',
    foodInstances: [
      {
        instanceId: 'inst_1',
        foodId: 'spinach',
        foodName: 'Spinach',
        category: FOOD_CATEGORIES.VEGETABLES,
        color: FOOD_COLORS.GREEN,
        isFermented: false,
        loggedDate: '2025-01-06T10:00:00.000Z',
        pointValue: 1,
        firstLoggedDate: '2025-01-06T10:00:00.000Z',
      },
      {
        instanceId: 'inst_2',
        foodId: 'apple',
        foodName: 'Apple',
        category: FOOD_CATEGORIES.FRUITS,
        color: FOOD_COLORS.RED,
        isFermented: false,
        loggedDate: '2025-01-07T14:00:00.000Z',
        pointValue: 1,
        firstLoggedDate: '2025-01-07T14:00:00.000Z',
      },
    ],
    uniqueFoods: ['spinach', 'apple'],
    totalPoints: 2,
    categoryBreakdown: {
      whole_grains: 0,
      nuts_seeds: 0,
      fruits: 1,
      vegetables: 1,
      legumes: 0,
      herbs_spices: 0,
    },
    colorsAchieved: [FOOD_COLORS.GREEN, FOOD_COLORS.RED],
    currentStreak: 0,
  };
}

function createMockDailyData(
  userId: string,
  date: string
): DailyDataRecord {
  return {
    id: `${userId}-${date}`,
    userId,
    date,
    waterGlasses: 6,
    colorsEaten: [FOOD_COLORS.GREEN, FOOD_COLORS.RED],
    fermentedFoodEaten: false,
  };
}

// ============================================================================
// Setup and Teardown
// ============================================================================

after(async () => {
  // Clean up after all tests
  await deleteDatabase();
});

// ============================================================================
// Weekly Data Tests - Save and Load
// ============================================================================

test('saveWeeklyData - saves data successfully', async () => {
  const weeklyData = createMockWeeklyData('user123');
  
  await saveWeeklyData(weeklyData);
  
  const loaded = await loadWeeklyData('user123');
  assert.ok(loaded);
  assert.strictEqual(loaded.userId, 'user123');
  assert.strictEqual(loaded.totalPoints, 2);
  
  await clearAllData();
});

test('loadWeeklyData - returns null when no data exists', async () => {
  const loaded = await loadWeeklyData('nonexistent');
  assert.strictEqual(loaded, null);
});

test('saveWeeklyData - overwrites existing data', async () => {
  const weeklyData1 = createMockWeeklyData('user123');
  weeklyData1.totalPoints = 10;
  
  await saveWeeklyData(weeklyData1);
  
  const weeklyData2 = createMockWeeklyData('user123');
  weeklyData2.totalPoints = 20;
  
  await saveWeeklyData(weeklyData2);
  
  const loaded = await loadWeeklyData('user123');
  assert.ok(loaded);
  assert.strictEqual(loaded.totalPoints, 20);
  
  await clearAllData();
});

test('loadWeeklyData - retrieves all fields correctly', async () => {
  const weeklyData = createMockWeeklyData('user123');
  
  await saveWeeklyData(weeklyData);
  const loaded = await loadWeeklyData('user123');
  
  assert.ok(loaded);
  assert.strictEqual(loaded.id, 'user123');
  assert.strictEqual(loaded.userId, 'user123');
  assert.strictEqual(loaded.weekStart, '2025-01-06T00:00:00.000Z');
  assert.strictEqual(loaded.weekEnd, '2025-01-12T23:59:59.999Z');
  assert.strictEqual(loaded.foodInstances.length, 2);
  assert.strictEqual(loaded.uniqueFoods.length, 2);
  assert.strictEqual(loaded.totalPoints, 2);
  assert.strictEqual(loaded.colorsAchieved.length, 2);
  assert.strictEqual(loaded.currentStreak, 0);
  
  await clearAllData();
});

test('loadWeeklyData - retrieves food instances correctly', async () => {
  const weeklyData = createMockWeeklyData('user123');
  
  await saveWeeklyData(weeklyData);
  const loaded = await loadWeeklyData('user123');
  
  assert.ok(loaded);
  assert.strictEqual(loaded.foodInstances[0].instanceId, 'inst_1');
  assert.strictEqual(loaded.foodInstances[0].foodId, 'spinach');
  assert.strictEqual(loaded.foodInstances[0].foodName, 'Spinach');
  assert.strictEqual(loaded.foodInstances[0].category, 'vegetables');
  assert.strictEqual(loaded.foodInstances[0].color, 'green');
  assert.strictEqual(loaded.foodInstances[0].isFermented, false);
  assert.strictEqual(loaded.foodInstances[0].pointValue, 1);
  
  await clearAllData();
});

test('loadWeeklyData - retrieves category breakdown correctly', async () => {
  const weeklyData = createMockWeeklyData('user123');
  
  await saveWeeklyData(weeklyData);
  const loaded = await loadWeeklyData('user123');
  
  assert.ok(loaded);
  assert.strictEqual(loaded.categoryBreakdown.vegetables, 1);
  assert.strictEqual(loaded.categoryBreakdown.fruits, 1);
  assert.strictEqual(loaded.categoryBreakdown.whole_grains, 0);
  assert.strictEqual(loaded.categoryBreakdown.nuts_seeds, 0);
  assert.strictEqual(loaded.categoryBreakdown.legumes, 0);
  assert.strictEqual(loaded.categoryBreakdown.herbs_spices, 0);
  
  await clearAllData();
});

// ============================================================================
// Weekly Data Tests - Multiple Users
// ============================================================================

test('saveWeeklyData - handles multiple users independently', async () => {
  const user1Data = createMockWeeklyData('user1');
  user1Data.totalPoints = 10;
  
  const user2Data = createMockWeeklyData('user2');
  user2Data.totalPoints = 20;
  
  await saveWeeklyData(user1Data);
  await saveWeeklyData(user2Data);
  
  const loaded1 = await loadWeeklyData('user1');
  const loaded2 = await loadWeeklyData('user2');
  
  assert.ok(loaded1);
  assert.ok(loaded2);
  assert.strictEqual(loaded1.totalPoints, 10);
  assert.strictEqual(loaded2.totalPoints, 20);
  
  await clearAllData();
});

// ============================================================================
// Weekly Data Tests - Delete
// ============================================================================

test('deleteWeeklyData - removes data successfully', async () => {
  const weeklyData = createMockWeeklyData('user123');
  
  await saveWeeklyData(weeklyData);
  await deleteWeeklyData('user123');
  
  const loaded = await loadWeeklyData('user123');
  assert.strictEqual(loaded, null);
});

test('deleteWeeklyData - does not affect other users', async () => {
  const user1Data = createMockWeeklyData('user1');
  const user2Data = createMockWeeklyData('user2');
  
  await saveWeeklyData(user1Data);
  await saveWeeklyData(user2Data);
  
  await deleteWeeklyData('user1');
  
  const loaded1 = await loadWeeklyData('user1');
  const loaded2 = await loadWeeklyData('user2');
  
  assert.strictEqual(loaded1, null);
  assert.ok(loaded2);
  
  await clearAllData();
});

// ============================================================================
// Daily Data Tests - Save and Load
// ============================================================================

test('saveDailyData - saves data successfully', async () => {
  const dailyData = createMockDailyData('user123', '2025-01-06');
  
  await saveDailyData(dailyData);
  
  const loaded = await loadDailyData('user123', '2025-01-06');
  assert.ok(loaded);
  assert.strictEqual(loaded.userId, 'user123');
  assert.strictEqual(loaded.date, '2025-01-06');
  assert.strictEqual(loaded.waterGlasses, 6);
  
  await clearAllData();
});

test('loadDailyData - returns null when no data exists', async () => {
  const loaded = await loadDailyData('user123', '2025-01-06');
  assert.strictEqual(loaded, null);
});

test('saveDailyData - overwrites existing data for same date', async () => {
  const dailyData1 = createMockDailyData('user123', '2025-01-06');
  dailyData1.waterGlasses = 5;
  
  await saveDailyData(dailyData1);
  
  const dailyData2 = createMockDailyData('user123', '2025-01-06');
  dailyData2.waterGlasses = 8;
  
  await saveDailyData(dailyData2);
  
  const loaded = await loadDailyData('user123', '2025-01-06');
  assert.ok(loaded);
  assert.strictEqual(loaded.waterGlasses, 8);
  
  await clearAllData();
});

test('loadDailyData - retrieves all fields correctly', async () => {
  const dailyData = createMockDailyData('user123', '2025-01-06');
  
  await saveDailyData(dailyData);
  const loaded = await loadDailyData('user123', '2025-01-06');
  
  assert.ok(loaded);
  assert.strictEqual(loaded.id, 'user123-2025-01-06');
  assert.strictEqual(loaded.userId, 'user123');
  assert.strictEqual(loaded.date, '2025-01-06');
  assert.strictEqual(loaded.waterGlasses, 6);
  assert.strictEqual(loaded.colorsEaten.length, 2);
  assert.strictEqual(loaded.fermentedFoodEaten, false);
  
  await clearAllData();
});

test('loadDailyData - retrieves colors correctly', async () => {
  const dailyData = createMockDailyData('user123', '2025-01-06');
  
  await saveDailyData(dailyData);
  const loaded = await loadDailyData('user123', '2025-01-06');
  
  assert.ok(loaded);
  assert.ok(loaded.colorsEaten.includes(FOOD_COLORS.GREEN));
  assert.ok(loaded.colorsEaten.includes(FOOD_COLORS.RED));
  
  await clearAllData();
});

// ============================================================================
// Daily Data Tests - Multiple Days
// ============================================================================

test('saveDailyData - handles multiple days independently', async () => {
  const day1Data = createMockDailyData('user123', '2025-01-06');
  day1Data.waterGlasses = 5;
  
  const day2Data = createMockDailyData('user123', '2025-01-07');
  day2Data.waterGlasses = 8;
  
  await saveDailyData(day1Data);
  await saveDailyData(day2Data);
  
  const loaded1 = await loadDailyData('user123', '2025-01-06');
  const loaded2 = await loadDailyData('user123', '2025-01-07');
  
  assert.ok(loaded1);
  assert.ok(loaded2);
  assert.strictEqual(loaded1.waterGlasses, 5);
  assert.strictEqual(loaded2.waterGlasses, 8);
  
  await clearAllData();
});

test('saveDailyData - handles multiple users on same day', async () => {
  const user1Data = createMockDailyData('user1', '2025-01-06');
  user1Data.waterGlasses = 5;
  
  const user2Data = createMockDailyData('user2', '2025-01-06');
  user2Data.waterGlasses = 8;
  
  await saveDailyData(user1Data);
  await saveDailyData(user2Data);
  
  const loaded1 = await loadDailyData('user1', '2025-01-06');
  const loaded2 = await loadDailyData('user2', '2025-01-06');
  
  assert.ok(loaded1);
  assert.ok(loaded2);
  assert.strictEqual(loaded1.waterGlasses, 5);
  assert.strictEqual(loaded2.waterGlasses, 8);
  
  await clearAllData();
});

// ============================================================================
// Daily Data Tests - Delete
// ============================================================================

test('deleteDailyData - removes data successfully', async () => {
  const dailyData = createMockDailyData('user123', '2025-01-06');
  
  await saveDailyData(dailyData);
  await deleteDailyData('user123', '2025-01-06');
  
  const loaded = await loadDailyData('user123', '2025-01-06');
  assert.strictEqual(loaded, null);
});

test('deleteDailyData - does not affect other days', async () => {
  const day1Data = createMockDailyData('user123', '2025-01-06');
  const day2Data = createMockDailyData('user123', '2025-01-07');
  
  await saveDailyData(day1Data);
  await saveDailyData(day2Data);
  
  await deleteDailyData('user123', '2025-01-06');
  
  const loaded1 = await loadDailyData('user123', '2025-01-06');
  const loaded2 = await loadDailyData('user123', '2025-01-07');
  
  assert.strictEqual(loaded1, null);
  assert.ok(loaded2);
  
  await clearAllData();
});

// ============================================================================
// Integration Tests
// ============================================================================

test('integration - weekly and daily data are independent', async () => {
  const weeklyData = createMockWeeklyData('user123');
  const dailyData = createMockDailyData('user123', '2025-01-06');
  
  await saveWeeklyData(weeklyData);
  await saveDailyData(dailyData);
  
  const loadedWeekly = await loadWeeklyData('user123');
  const loadedDaily = await loadDailyData('user123', '2025-01-06');
  
  assert.ok(loadedWeekly);
  assert.ok(loadedDaily);
  assert.strictEqual(loadedWeekly.userId, 'user123');
  assert.strictEqual(loadedDaily.userId, 'user123');
  
  await clearAllData();
});

test('clearAllData - removes all weekly and daily data', async () => {
  const weeklyData = createMockWeeklyData('user123');
  const dailyData = createMockDailyData('user123', '2025-01-06');
  
  await saveWeeklyData(weeklyData);
  await saveDailyData(dailyData);
  
  await clearAllData();
  
  const loadedWeekly = await loadWeeklyData('user123');
  const loadedDaily = await loadDailyData('user123', '2025-01-06');
  
  assert.strictEqual(loadedWeekly, null);
  assert.strictEqual(loadedDaily, null);
});

// ============================================================================
// Complex Data Tests
// ============================================================================

test('saveWeeklyData - handles complex food instances with herbs/spices', async () => {
  const weeklyData = createMockWeeklyData('user123');
  weeklyData.foodInstances.push({
    instanceId: 'inst_3',
    foodId: 'garlic',
    foodName: 'Garlic',
    category: FOOD_CATEGORIES.HERBS_SPICES,
    color: FOOD_COLORS.WHITE_TAN,
    isFermented: false,
    loggedDate: '2025-01-08T16:00:00.000Z',
    pointValue: 0.25,
    firstLoggedDate: '2025-01-08T16:00:00.000Z',
  });
  weeklyData.uniqueFoods.push('garlic');
  weeklyData.totalPoints = 2.25;
  weeklyData.categoryBreakdown.herbs_spices = 0.25;
  
  await saveWeeklyData(weeklyData);
  const loaded = await loadWeeklyData('user123');
  
  assert.ok(loaded);
  assert.strictEqual(loaded.foodInstances.length, 3);
  assert.strictEqual(loaded.totalPoints, 2.25);
  assert.strictEqual(loaded.categoryBreakdown.herbs_spices, 0.25);
  
  await clearAllData();
});

test('saveDailyData - handles all 6 colors', async () => {
  const dailyData = createMockDailyData('user123', '2025-01-06');
  dailyData.colorsEaten = [
    FOOD_COLORS.RED,
    FOOD_COLORS.ORANGE,
    FOOD_COLORS.YELLOW,
    FOOD_COLORS.GREEN,
    FOOD_COLORS.BLUE_PURPLE,
    FOOD_COLORS.WHITE_TAN,
  ];
  
  await saveDailyData(dailyData);
  const loaded = await loadDailyData('user123', '2025-01-06');
  
  assert.ok(loaded);
  assert.strictEqual(loaded.colorsEaten.length, 6);
  
  await clearAllData();
});

test('saveWeeklyData - handles empty food instances array', async () => {
  const weeklyData = createMockWeeklyData('user123');
  weeklyData.foodInstances = [];
  weeklyData.uniqueFoods = [];
  weeklyData.totalPoints = 0;
  weeklyData.colorsAchieved = [];
  
  await saveWeeklyData(weeklyData);
  const loaded = await loadWeeklyData('user123');
  
  assert.ok(loaded);
  assert.strictEqual(loaded.foodInstances.length, 0);
  assert.strictEqual(loaded.totalPoints, 0);
  
  await clearAllData();
});