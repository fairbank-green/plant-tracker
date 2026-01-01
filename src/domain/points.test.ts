// src/domain/points.test.ts
import { test } from 'node:test';
import assert from 'node:assert';
import {
  getPointValue,
  calculateWeeklyPoints,
  calculateCategoryBreakdown,
  type FoodForPoints,
} from './points.js';
import { FOOD_CATEGORIES, type FoodCategory } from './types.js';

// ============================================================================
// getPointValue Tests
// ============================================================================

test('getPointValue - returns 1 for whole grains', () => {
  assert.strictEqual(getPointValue(FOOD_CATEGORIES.WHOLE_GRAINS), 1);
});

test('getPointValue - returns 1 for nuts and seeds', () => {
  assert.strictEqual(getPointValue(FOOD_CATEGORIES.NUTS_SEEDS), 1);
});

test('getPointValue - returns 1 for fruits', () => {
  assert.strictEqual(getPointValue(FOOD_CATEGORIES.FRUITS), 1);
});

test('getPointValue - returns 1 for vegetables', () => {
  assert.strictEqual(getPointValue(FOOD_CATEGORIES.VEGETABLES), 1);
});

test('getPointValue - returns 1 for legumes', () => {
  assert.strictEqual(getPointValue(FOOD_CATEGORIES.LEGUMES), 1);
});

test('getPointValue - returns 0.25 for herbs/spices', () => {
  assert.strictEqual(getPointValue(FOOD_CATEGORIES.HERBS_SPICES), 0.25);
});

// ============================================================================
// calculateWeeklyPoints Tests - Empty Input
// ============================================================================

test('calculateWeeklyPoints - empty array returns 0', () => {
  const foods: FoodForPoints[] = [];
  assert.strictEqual(calculateWeeklyPoints(foods), 0);
});

// ============================================================================
// calculateWeeklyPoints Tests - Single Category
// ============================================================================

test('calculateWeeklyPoints - single vegetable returns 1', () => {
  const foods: FoodForPoints[] = [
    { foodId: 'spinach', category: FOOD_CATEGORIES.VEGETABLES },
  ];
  assert.strictEqual(calculateWeeklyPoints(foods), 1);
});

test('calculateWeeklyPoints - single herb returns 0.25', () => {
  const foods: FoodForPoints[] = [
    { foodId: 'garlic', category: FOOD_CATEGORIES.HERBS_SPICES },
  ];
  assert.strictEqual(calculateWeeklyPoints(foods), 0.25);
});

test('calculateWeeklyPoints - three vegetables returns 3', () => {
  const foods: FoodForPoints[] = [
    { foodId: 'spinach', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'broccoli', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'carrot', category: FOOD_CATEGORIES.VEGETABLES },
  ];
  assert.strictEqual(calculateWeeklyPoints(foods), 3);
});

test('calculateWeeklyPoints - four herbs returns 1', () => {
  const foods: FoodForPoints[] = [
    { foodId: 'garlic', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'turmeric', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'basil', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'oregano', category: FOOD_CATEGORIES.HERBS_SPICES },
  ];
  assert.strictEqual(calculateWeeklyPoints(foods), 1);
});

// ============================================================================
// calculateWeeklyPoints Tests - Mixed Categories
// ============================================================================

test('calculateWeeklyPoints - mixed categories calculates correctly', () => {
  const foods: FoodForPoints[] = [
    { foodId: 'oats', category: FOOD_CATEGORIES.WHOLE_GRAINS },
    { foodId: 'almonds', category: FOOD_CATEGORIES.NUTS_SEEDS },
    { foodId: 'apple', category: FOOD_CATEGORIES.FRUITS },
    { foodId: 'spinach', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'lentils', category: FOOD_CATEGORIES.LEGUMES },
    { foodId: 'garlic', category: FOOD_CATEGORIES.HERBS_SPICES },
  ];
  // 5 × 1 + 1 × 0.25 = 5.25
  assert.strictEqual(calculateWeeklyPoints(foods), 5.25);
});

test('calculateWeeklyPoints - realistic 30-point goal scenario', () => {
  const foods: FoodForPoints[] = [
    // 10 vegetables (10 points)
    { foodId: 'spinach', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'broccoli', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'carrot', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'tomato', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'cucumber', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'bell_pepper', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'kale', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'lettuce', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'zucchini', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'cauliflower', category: FOOD_CATEGORIES.VEGETABLES },
    // 7 fruits (7 points)
    { foodId: 'apple', category: FOOD_CATEGORIES.FRUITS },
    { foodId: 'banana', category: FOOD_CATEGORIES.FRUITS },
    { foodId: 'blueberries', category: FOOD_CATEGORIES.FRUITS },
    { foodId: 'strawberries', category: FOOD_CATEGORIES.FRUITS },
    { foodId: 'orange', category: FOOD_CATEGORIES.FRUITS },
    { foodId: 'mango', category: FOOD_CATEGORIES.FRUITS },
    { foodId: 'grapes', category: FOOD_CATEGORIES.FRUITS },
    // 5 whole grains (5 points)
    { foodId: 'oats', category: FOOD_CATEGORIES.WHOLE_GRAINS },
    { foodId: 'brown_rice', category: FOOD_CATEGORIES.WHOLE_GRAINS },
    { foodId: 'quinoa', category: FOOD_CATEGORIES.WHOLE_GRAINS },
    { foodId: 'whole_wheat', category: FOOD_CATEGORIES.WHOLE_GRAINS },
    { foodId: 'barley', category: FOOD_CATEGORIES.WHOLE_GRAINS },
    // 4 nuts/seeds (4 points)
    { foodId: 'almonds', category: FOOD_CATEGORIES.NUTS_SEEDS },
    { foodId: 'chia_seeds', category: FOOD_CATEGORIES.NUTS_SEEDS },
    { foodId: 'walnuts', category: FOOD_CATEGORIES.NUTS_SEEDS },
    { foodId: 'pumpkin_seeds', category: FOOD_CATEGORIES.NUTS_SEEDS },
    // 3 legumes (3 points)
    { foodId: 'chickpeas', category: FOOD_CATEGORIES.LEGUMES },
    { foodId: 'lentils', category: FOOD_CATEGORIES.LEGUMES },
    { foodId: 'black_beans', category: FOOD_CATEGORIES.LEGUMES },
    // 4 herbs/spices (1 point)
    { foodId: 'garlic', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'turmeric', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'ginger', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'cinnamon', category: FOOD_CATEGORIES.HERBS_SPICES },
  ];
  // 10 + 7 + 5 + 4 + 3 + 1 = 30 points
  assert.strictEqual(calculateWeeklyPoints(foods), 30);
});

// ============================================================================
// calculateWeeklyPoints Tests - Floating-Point Precision
// ============================================================================

test('calculateWeeklyPoints - no rounding errors with multiple herbs', () => {
  const foods: FoodForPoints[] = [
    { foodId: 'herb1', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'herb2', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'herb3', category: FOOD_CATEGORIES.HERBS_SPICES },
  ];
  // 3 × 0.25 = 0.75 (exact)
  const result = calculateWeeklyPoints(foods);
  assert.strictEqual(result, 0.75);
  // Verify no floating-point error
  assert.strictEqual(result * 4, 3);
});

test('calculateWeeklyPoints - precision with 7 herbs', () => {
  const foods: FoodForPoints[] = Array.from({ length: 7 }, (_, i) => ({
    foodId: `herb${i}`,
    category: FOOD_CATEGORIES.HERBS_SPICES,
  }));
  // 7 × 0.25 = 1.75 (exact)
  const result = calculateWeeklyPoints(foods);
  assert.strictEqual(result, 1.75);
  // Verify no floating-point error
  assert.strictEqual(result * 4, 7);
});

test('calculateWeeklyPoints - precision with mixed herbs and standard foods', () => {
  const foods: FoodForPoints[] = [
    { foodId: 'veg1', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'herb1', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'herb2', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'herb3', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'fruit1', category: FOOD_CATEGORIES.FRUITS },
  ];
  // 2 × 1 + 3 × 0.25 = 2.75 (exact)
  const result = calculateWeeklyPoints(foods);
  assert.strictEqual(result, 2.75);
});

test('calculateWeeklyPoints - precision with 13 herbs and 2 vegetables', () => {
  const foods: FoodForPoints[] = [
    ...Array.from({ length: 13 }, (_, i) => ({
      foodId: `herb${i}`,
      category: FOOD_CATEGORIES.HERBS_SPICES,
    })),
    { foodId: 'veg1', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'veg2', category: FOOD_CATEGORIES.VEGETABLES },
  ];
  // 13 × 0.25 + 2 × 1 = 3.25 + 2 = 5.25 (exact)
  const result = calculateWeeklyPoints(foods);
  assert.strictEqual(result, 5.25);
});

// ============================================================================
// calculateCategoryBreakdown Tests - Empty Input
// ============================================================================

test('calculateCategoryBreakdown - empty array returns all zeros', () => {
  const foods: FoodForPoints[] = [];
  const breakdown = calculateCategoryBreakdown(foods);
  
  assert.strictEqual(breakdown[FOOD_CATEGORIES.WHOLE_GRAINS], 0);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.NUTS_SEEDS], 0);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.FRUITS], 0);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.VEGETABLES], 0);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.LEGUMES], 0);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.HERBS_SPICES], 0);
});

// ============================================================================
// calculateCategoryBreakdown Tests - Single Category
// ============================================================================

test('calculateCategoryBreakdown - single vegetable', () => {
  const foods: FoodForPoints[] = [
    { foodId: 'spinach', category: FOOD_CATEGORIES.VEGETABLES },
  ];
  const breakdown = calculateCategoryBreakdown(foods);
  
  assert.strictEqual(breakdown[FOOD_CATEGORIES.VEGETABLES], 1);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.WHOLE_GRAINS], 0);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.FRUITS], 0);
});

test('calculateCategoryBreakdown - multiple vegetables', () => {
  const foods: FoodForPoints[] = [
    { foodId: 'spinach', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'broccoli', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'carrot', category: FOOD_CATEGORIES.VEGETABLES },
  ];
  const breakdown = calculateCategoryBreakdown(foods);
  
  assert.strictEqual(breakdown[FOOD_CATEGORIES.VEGETABLES], 3);
});

test('calculateCategoryBreakdown - multiple herbs', () => {
  const foods: FoodForPoints[] = [
    { foodId: 'garlic', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'turmeric', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'basil', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'oregano', category: FOOD_CATEGORIES.HERBS_SPICES },
  ];
  const breakdown = calculateCategoryBreakdown(foods);
  
  assert.strictEqual(breakdown[FOOD_CATEGORIES.HERBS_SPICES], 1);
});

// ============================================================================
// calculateCategoryBreakdown Tests - Mixed Categories
// ============================================================================

test('calculateCategoryBreakdown - one of each category', () => {
  const foods: FoodForPoints[] = [
    { foodId: 'oats', category: FOOD_CATEGORIES.WHOLE_GRAINS },
    { foodId: 'almonds', category: FOOD_CATEGORIES.NUTS_SEEDS },
    { foodId: 'apple', category: FOOD_CATEGORIES.FRUITS },
    { foodId: 'spinach', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'lentils', category: FOOD_CATEGORIES.LEGUMES },
    { foodId: 'garlic', category: FOOD_CATEGORIES.HERBS_SPICES },
  ];
  const breakdown = calculateCategoryBreakdown(foods);
  
  assert.strictEqual(breakdown[FOOD_CATEGORIES.WHOLE_GRAINS], 1);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.NUTS_SEEDS], 1);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.FRUITS], 1);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.VEGETABLES], 1);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.LEGUMES], 1);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.HERBS_SPICES], 0.25);
});

test('calculateCategoryBreakdown - realistic distribution', () => {
  const foods: FoodForPoints[] = [
    // 5 vegetables
    { foodId: 'spinach', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'broccoli', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'carrot', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'tomato', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'cucumber', category: FOOD_CATEGORIES.VEGETABLES },
    // 3 fruits
    { foodId: 'apple', category: FOOD_CATEGORIES.FRUITS },
    { foodId: 'banana', category: FOOD_CATEGORIES.FRUITS },
    { foodId: 'blueberries', category: FOOD_CATEGORIES.FRUITS },
    // 2 whole grains
    { foodId: 'oats', category: FOOD_CATEGORIES.WHOLE_GRAINS },
    { foodId: 'quinoa', category: FOOD_CATEGORIES.WHOLE_GRAINS },
    // 2 nuts/seeds
    { foodId: 'almonds', category: FOOD_CATEGORIES.NUTS_SEEDS },
    { foodId: 'chia', category: FOOD_CATEGORIES.NUTS_SEEDS },
    // 1 legume
    { foodId: 'lentils', category: FOOD_CATEGORIES.LEGUMES },
    // 3 herbs
    { foodId: 'garlic', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'turmeric', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'ginger', category: FOOD_CATEGORIES.HERBS_SPICES },
  ];
  const breakdown = calculateCategoryBreakdown(foods);
  
  assert.strictEqual(breakdown[FOOD_CATEGORIES.VEGETABLES], 5);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.FRUITS], 3);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.WHOLE_GRAINS], 2);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.NUTS_SEEDS], 2);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.LEGUMES], 1);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.HERBS_SPICES], 0.75);
});

// ============================================================================
// calculateCategoryBreakdown Tests - Floating-Point Precision
// ============================================================================

test('calculateCategoryBreakdown - no rounding errors with herbs', () => {
  const foods: FoodForPoints[] = [
    { foodId: 'herb1', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'herb2', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'herb3', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'veg1', category: FOOD_CATEGORIES.VEGETABLES },
  ];
  const breakdown = calculateCategoryBreakdown(foods);
  
  // 3 × 0.25 = 0.75 (exact)
  assert.strictEqual(breakdown[FOOD_CATEGORIES.HERBS_SPICES], 0.75);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.VEGETABLES], 1);
  
  // Verify no floating-point error
  assert.strictEqual(breakdown[FOOD_CATEGORIES.HERBS_SPICES] * 4, 3);
});

test('calculateCategoryBreakdown - precision with many herbs', () => {
  const foods: FoodForPoints[] = Array.from({ length: 11 }, (_, i) => ({
    foodId: `herb${i}`,
    category: FOOD_CATEGORIES.HERBS_SPICES,
  }));
  const breakdown = calculateCategoryBreakdown(foods);
  
  // 11 × 0.25 = 2.75 (exact)
  assert.strictEqual(breakdown[FOOD_CATEGORIES.HERBS_SPICES], 2.75);
  assert.strictEqual(breakdown[FOOD_CATEGORIES.HERBS_SPICES] * 4, 11);
});

// ============================================================================
// Integration Tests - Verify Consistency
// ============================================================================

test('calculateCategoryBreakdown - sum equals calculateWeeklyPoints', () => {
  const foods: FoodForPoints[] = [
    { foodId: 'oats', category: FOOD_CATEGORIES.WHOLE_GRAINS },
    { foodId: 'almonds', category: FOOD_CATEGORIES.NUTS_SEEDS },
    { foodId: 'apple', category: FOOD_CATEGORIES.FRUITS },
    { foodId: 'spinach', category: FOOD_CATEGORIES.VEGETABLES },
    { foodId: 'lentils', category: FOOD_CATEGORIES.LEGUMES },
    { foodId: 'garlic', category: FOOD_CATEGORIES.HERBS_SPICES },
    { foodId: 'basil', category: FOOD_CATEGORIES.HERBS_SPICES },
  ];
  
  const totalPoints = calculateWeeklyPoints(foods);
  const breakdown = calculateCategoryBreakdown(foods);
  
  const sumOfBreakdown = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  
  assert.strictEqual(totalPoints, sumOfBreakdown);
  assert.strictEqual(totalPoints, 5.5); // 5 × 1 + 2 × 0.25
});