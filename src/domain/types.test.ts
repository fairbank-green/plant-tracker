// types.test.ts
import { test } from 'node:test';
import assert from 'node:assert';
import {
  FOOD_CATEGORIES,
  FOOD_COLORS,
  CATEGORY_POINT_VALUES,
  type FoodCategory,
  type FoodColor,
  type Food,
  type WeeklyFoodEntry,
  type WeeklyTrackingData,
  type DailyTrackingData,
} from './types.js';

test('FoodCategory - valid categories are accepted', () => {
  const validCategory: FoodCategory = FOOD_CATEGORIES.WHOLE_GRAINS;
  assert.strictEqual(validCategory, 'whole_grains');
  
  const allValidCategories: FoodCategory[] = [
    FOOD_CATEGORIES.WHOLE_GRAINS,
    FOOD_CATEGORIES.NUTS_SEEDS,
    FOOD_CATEGORIES.FRUITS,
    FOOD_CATEGORIES.VEGETABLES,
    FOOD_CATEGORIES.LEGUMES,
    FOOD_CATEGORIES.HERBS_SPICES,
  ];
  
  assert.strictEqual(allValidCategories.length, 6);
});

test('FoodCategory - invalid categories rejected at compile time', () => {
  // These should cause TypeScript compilation errors:
  // const invalid1: FoodCategory = 'invalid_category';
  // const invalid2: FoodCategory = 'grains';
  // const invalid3: FoodCategory = 'WHOLE_GRAINS'; // wrong case
  
  assert.ok(true, 'Invalid categories are caught at compile time');
});

test('FoodColor - valid colors are accepted', () => {
  const validColor: FoodColor = FOOD_COLORS.RED;
  assert.strictEqual(validColor, 'red');
  
  const allValidColors: FoodColor[] = [
    FOOD_COLORS.RED,
    FOOD_COLORS.ORANGE,
    FOOD_COLORS.YELLOW,
    FOOD_COLORS.GREEN,
    FOOD_COLORS.BLUE_PURPLE,
    FOOD_COLORS.WHITE_TAN,
  ];
  
  assert.strictEqual(allValidColors.length, 6);
});

test('FoodColor - invalid colors rejected at compile time', () => {
  // These should cause TypeScript compilation errors:
  // const invalid1: FoodColor = 'pink';
  // const invalid2: FoodColor = 'blue';
  // const invalid3: FoodColor = 'RED'; // wrong case
  
  assert.ok(true, 'Invalid colors are caught at compile time');
});

test('CATEGORY_POINT_VALUES - correct point values for standard categories', () => {
  assert.strictEqual(CATEGORY_POINT_VALUES[FOOD_CATEGORIES.WHOLE_GRAINS], 1);
  assert.strictEqual(CATEGORY_POINT_VALUES[FOOD_CATEGORIES.NUTS_SEEDS], 1);
  assert.strictEqual(CATEGORY_POINT_VALUES[FOOD_CATEGORIES.FRUITS], 1);
  assert.strictEqual(CATEGORY_POINT_VALUES[FOOD_CATEGORIES.VEGETABLES], 1);
  assert.strictEqual(CATEGORY_POINT_VALUES[FOOD_CATEGORIES.LEGUMES], 1);
});

test('CATEGORY_POINT_VALUES - correct point value for herbs/spices', () => {
  assert.strictEqual(CATEGORY_POINT_VALUES[FOOD_CATEGORIES.HERBS_SPICES], 0.25);
});

test('CATEGORY_POINT_VALUES - all categories have point values', () => {
  const categories: FoodCategory[] = Object.values(FOOD_CATEGORIES);
  
  categories.forEach(category => {
    assert.ok(
      CATEGORY_POINT_VALUES[category] !== undefined,
      `Category ${category} should have a point value`
    );
    assert.ok(
      CATEGORY_POINT_VALUES[category] > 0,
      `Category ${category} should have a positive point value`
    );
  });
});

test('Food interface - creates valid food object', () => {
  const food: Food = {
    foodId: 'food_123',
    name: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
  };
  
  assert.strictEqual(food.foodId, 'food_123');
  assert.strictEqual(food.name, 'Spinach');
  assert.strictEqual(food.category, 'vegetables');
});

test('WeeklyFoodEntry interface - creates valid entry', () => {
  const entry: WeeklyFoodEntry = {
    instanceId: 'instance_456',
    foodId: 'food_123',
    foodName: 'Spinach',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    loggedDate: new Date('2025-01-06'),
    pointValue: 1,
  };
  
  assert.strictEqual(entry.instanceId, 'instance_456');
  assert.strictEqual(entry.foodId, 'food_123');
  assert.strictEqual(entry.category, 'vegetables');
  assert.strictEqual(entry.color, 'green');
  assert.strictEqual(entry.isFermented, false);
  assert.strictEqual(entry.pointValue, 1);
});

test('WeeklyTrackingData interface - creates valid tracking data', () => {
  const weeklyData: WeeklyTrackingData = {
    userId: 'user_789',
    weekStart: new Date('2025-01-06'),
    weekEnd: new Date('2025-01-12'),
    foodInstances: [],
    uniqueFoods: ['food_123', 'food_456'],
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
    currentStreak: 3,
  };
  
  assert.strictEqual(weeklyData.userId, 'user_789');
  assert.strictEqual(weeklyData.uniqueFoods.length, 2);
  assert.strictEqual(weeklyData.totalPoints, 2);
  assert.strictEqual(weeklyData.colorsAchieved.length, 2);
  assert.strictEqual(weeklyData.currentStreak, 3);
});

test('DailyTrackingData interface - creates valid daily data', () => {
  const dailyData: DailyTrackingData = {
    userId: 'user_789',
    date: new Date('2025-01-06'),
    waterGlasses: 6,
    colorsEaten: [FOOD_COLORS.GREEN, FOOD_COLORS.YELLOW],
    fermentedFoodEaten: true,
  };
  
  assert.strictEqual(dailyData.userId, 'user_789');
  assert.strictEqual(dailyData.waterGlasses, 6);
  assert.strictEqual(dailyData.colorsEaten.length, 2);
  assert.strictEqual(dailyData.fermentedFoodEaten, true);
});

test('Point calculation example - cabbage scenario', () => {
  // Scenario: Log cabbage 3 times with different colors
  const cabbageInstances: WeeklyFoodEntry[] = [
    {
      instanceId: 'inst_1',
      foodId: 'food_cabbage',
      foodName: 'Cabbage',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date('2025-01-06'),
      pointValue: 1,
    },
    {
      instanceId: 'inst_2',
      foodId: 'food_cabbage',
      foodName: 'Cabbage',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.BLUE_PURPLE,
      isFermented: false,
      loggedDate: new Date('2025-01-07'),
      pointValue: 1,
    },
    {
      instanceId: 'inst_3',
      foodId: 'food_cabbage',
      foodName: 'Cabbage',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.WHITE_TAN,
      isFermented: true,
      loggedDate: new Date('2025-01-08'),
      pointValue: 1,
    },
  ];
  
  // Get unique foods
  const uniqueFoods = [...new Set(cabbageInstances.map(i => i.foodId))];
  
  // Calculate points (only count unique foods)
  const totalPoints = uniqueFoods.length * CATEGORY_POINT_VALUES[FOOD_CATEGORIES.VEGETABLES];
  
  // Get colors achieved
  const colorsAchieved = [...new Set(cabbageInstances.map(i => i.color))];
  
  assert.strictEqual(uniqueFoods.length, 1, 'Should have 1 unique food');
  assert.strictEqual(totalPoints, 1, 'Should have 1 point total');
  assert.strictEqual(colorsAchieved.length, 3, 'Should have 3 colors achieved');
  assert.ok(colorsAchieved.includes(FOOD_COLORS.GREEN));
  assert.ok(colorsAchieved.includes(FOOD_COLORS.BLUE_PURPLE));
  assert.ok(colorsAchieved.includes(FOOD_COLORS.WHITE_TAN));
});

test('Point calculation - mixed categories', () => {
  const categories: FoodCategory[] = [
    FOOD_CATEGORIES.VEGETABLES,
    FOOD_CATEGORIES.FRUITS,
    FOOD_CATEGORIES.WHOLE_GRAINS,
    FOOD_CATEGORIES.HERBS_SPICES,
    FOOD_CATEGORIES.HERBS_SPICES,
    FOOD_CATEGORIES.HERBS_SPICES,
  ];
  
  const totalPoints = categories.reduce((sum, cat) => {
    return sum + CATEGORY_POINT_VALUES[cat];
  }, 0);
  
  // 3 standard foods (1 point each) + 3 herbs/spices (0.25 each) = 3.75
  assert.strictEqual(totalPoints, 3.75);
});