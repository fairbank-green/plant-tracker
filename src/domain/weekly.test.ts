// src/domain/weekly.test.ts
import { test } from 'node:test';
import assert from 'node:assert';
import {
  addFoodToWeek,
  getUniqueFoodIds,
  hasFoodBeenLogged,
  type WeeklyFoodInstance,
} from './weekly.js';
import { FOOD_CATEGORIES, FOOD_COLORS } from './types.js';

// ============================================================================
// Helper Functions
// ============================================================================

function createMockFood(
  overrides: Partial<Omit<WeeklyFoodInstance, 'instanceId' | 'firstLoggedDate'>>
): Omit<WeeklyFoodInstance, 'instanceId' | 'firstLoggedDate'> {
  return {
    foodId: 'cabbage',
    foodName: 'Cabbage',
    category: FOOD_CATEGORIES.VEGETABLES,
    color: FOOD_COLORS.GREEN,
    isFermented: false,
    loggedDate: new Date('2025-01-06'),
    pointValue: 1,
    ...overrides,
  };
}

// ============================================================================
// addFoodToWeek Tests - Unique Adds
// ============================================================================

test('addFoodToWeek - add first food to empty array', () => {
  const existingFoods: WeeklyFoodInstance[] = [];
  const newFood = createMockFood({
    foodId: 'spinach',
    foodName: 'Spinach',
  });

  const result = addFoodToWeek(existingFoods, newFood);

  assert.strictEqual(result.foods.length, 1);
  assert.strictEqual(result.isNewFood, true);
  assert.strictEqual(result.isDuplicateInstance, false);
  assert.strictEqual(result.foods[0].foodId, 'spinach');
  assert.strictEqual(result.foods[0].foodName, 'Spinach');
  assert.ok(result.foods[0].instanceId); // Should have generated instanceId
  assert.ok(result.foods[0].firstLoggedDate); // Should have firstLoggedDate
});

test('addFoodToWeek - add different food to existing array', () => {
  const existingFoods: WeeklyFoodInstance[] = [
    {
      instanceId: 'inst_1',
      foodId: 'spinach',
      foodName: 'Spinach',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date('2025-01-06'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-06'),
    },
  ];

  const newFood = createMockFood({
    foodId: 'broccoli',
    foodName: 'Broccoli',
    loggedDate: new Date('2025-01-07'),
  });

  const result = addFoodToWeek(existingFoods, newFood);

  assert.strictEqual(result.foods.length, 2);
  assert.strictEqual(result.isNewFood, true);
  assert.strictEqual(result.isDuplicateInstance, false);
  assert.strictEqual(result.foods[1].foodId, 'broccoli');
});

test('addFoodToWeek - add same food with different color', () => {
  const existingFoods: WeeklyFoodInstance[] = [
    {
      instanceId: 'inst_1',
      foodId: 'cabbage',
      foodName: 'Cabbage',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date('2025-01-06'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-06'),
    },
  ];

  const newFood = createMockFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    color: FOOD_COLORS.BLUE_PURPLE, // Different color
    loggedDate: new Date('2025-01-07'),
  });

  const result = addFoodToWeek(existingFoods, newFood);

  assert.strictEqual(result.foods.length, 2);
  assert.strictEqual(result.isNewFood, false); // Same foodId already logged
  assert.strictEqual(result.isDuplicateInstance, false); // But different attributes
  assert.strictEqual(result.foods[1].foodId, 'cabbage');
  assert.strictEqual(result.foods[1].color, 'blue_purple');
});

test('addFoodToWeek - add same food with different fermentation status', () => {
  const existingFoods: WeeklyFoodInstance[] = [
    {
      instanceId: 'inst_1',
      foodId: 'cabbage',
      foodName: 'Cabbage',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date('2025-01-06'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-06'),
    },
  ];

  const newFood = createMockFood({
    foodId: 'cabbage',
    foodName: 'Cabbage',
    color: FOOD_COLORS.GREEN,
    isFermented: true, // Different fermentation status
    loggedDate: new Date('2025-01-07'),
  });

  const result = addFoodToWeek(existingFoods, newFood);

  assert.strictEqual(result.foods.length, 2);
  assert.strictEqual(result.isNewFood, false);
  assert.strictEqual(result.isDuplicateInstance, false);
  assert.strictEqual(result.foods[1].isFermented, true);
});

// ============================================================================
// addFoodToWeek Tests - Duplicate Instance Rejection
// ============================================================================

test('addFoodToWeek - reject exact duplicate (same foodId, color, fermentation)', () => {
  const existingFoods: WeeklyFoodInstance[] = [
    {
      instanceId: 'inst_1',
      foodId: 'cabbage',
      foodName: 'Cabbage',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date('2025-01-06'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-06'),
    },
  ];

  const newFood = createMockFood({
    foodId: 'cabbage',
    color: FOOD_COLORS.GREEN,
    isFermented: false, // Exact same attributes
    loggedDate: new Date('2025-01-07'), // Even different date
  });

  const result = addFoodToWeek(existingFoods, newFood);

  assert.strictEqual(result.foods.length, 1); // No change
  assert.strictEqual(result.isNewFood, false);
  assert.strictEqual(result.isDuplicateInstance, true);
  assert.strictEqual(result.foods, existingFoods); // Same reference (no mutation)
});

test('addFoodToWeek - reject duplicate among multiple instances', () => {
  const existingFoods: WeeklyFoodInstance[] = [
    {
      instanceId: 'inst_1',
      foodId: 'cabbage',
      foodName: 'Cabbage',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date('2025-01-06'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-06'),
    },
    {
      instanceId: 'inst_2',
      foodId: 'cabbage',
      foodName: 'Cabbage',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.BLUE_PURPLE,
      isFermented: false,
      loggedDate: new Date('2025-01-07'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-06'),
    },
  ];

  const newFood = createMockFood({
    foodId: 'cabbage',
    color: FOOD_COLORS.BLUE_PURPLE, // Matches second instance
    isFermented: false,
    loggedDate: new Date('2025-01-08'),
  });

  const result = addFoodToWeek(existingFoods, newFood);

  assert.strictEqual(result.foods.length, 2); // No change
  assert.strictEqual(result.isDuplicateInstance, true);
});

// ============================================================================
// addFoodToWeek Tests - firstLoggedDate Preservation
// ============================================================================

test('addFoodToWeek - sets firstLoggedDate for new foodId', () => {
  const existingFoods: WeeklyFoodInstance[] = [];
  const loggedDate = new Date('2025-01-06T10:30:00');
  
  const newFood = createMockFood({
    foodId: 'spinach',
    loggedDate,
  });

  const result = addFoodToWeek(existingFoods, newFood);

  assert.strictEqual(result.foods[0].firstLoggedDate?.getTime(), loggedDate.getTime());
});

test('addFoodToWeek - preserves firstLoggedDate for existing foodId', () => {
  const firstDate = new Date('2025-01-06T10:00:00');
  const existingFoods: WeeklyFoodInstance[] = [
    {
      instanceId: 'inst_1',
      foodId: 'cabbage',
      foodName: 'Cabbage',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: firstDate,
      pointValue: 1,
      firstLoggedDate: firstDate,
    },
  ];

  const laterDate = new Date('2025-01-08T14:30:00');
  const newFood = createMockFood({
    foodId: 'cabbage',
    color: FOOD_COLORS.BLUE_PURPLE,
    loggedDate: laterDate,
  });

  const result = addFoodToWeek(existingFoods, newFood);

  // New instance should have the ORIGINAL firstLoggedDate, not the new loggedDate
  assert.strictEqual(result.foods[1].firstLoggedDate?.getTime(), firstDate.getTime());
  assert.notStrictEqual(result.foods[1].firstLoggedDate?.getTime(), laterDate.getTime());
  assert.strictEqual(result.foods[1].loggedDate.getTime(), laterDate.getTime());
});

test('addFoodToWeek - cabbage scenario preserves firstLoggedDate across 3 instances', () => {
  const mondayDate = new Date('2025-01-06');
  const tuesdayDate = new Date('2025-01-07');
  const wednesdayDate = new Date('2025-01-08');

  // Monday: Log green cabbage
  let result = addFoodToWeek([], createMockFood({
    foodId: 'cabbage',
    color: FOOD_COLORS.GREEN,
    loggedDate: mondayDate,
  }));

  assert.strictEqual(result.foods[0].firstLoggedDate?.getTime(), mondayDate.getTime());

  // Tuesday: Log purple cabbage
  result = addFoodToWeek(result.foods, createMockFood({
    foodId: 'cabbage',
    color: FOOD_COLORS.BLUE_PURPLE,
    loggedDate: tuesdayDate,
  }));

  assert.strictEqual(result.foods[1].firstLoggedDate?.getTime(), mondayDate.getTime());

  // Wednesday: Log white fermented cabbage
  result = addFoodToWeek(result.foods, createMockFood({
    foodId: 'cabbage',
    color: FOOD_COLORS.WHITE_TAN,
    isFermented: true,
    loggedDate: wednesdayDate,
  }));

  assert.strictEqual(result.foods[2].firstLoggedDate?.getTime(), mondayDate.getTime());
  
  // All three instances should share the same firstLoggedDate
  assert.strictEqual(result.foods[0].firstLoggedDate?.getTime(), result.foods[1].firstLoggedDate?.getTime());
  assert.strictEqual(result.foods[1].firstLoggedDate?.getTime(), result.foods[2].firstLoggedDate?.getTime());
});

// ============================================================================
// addFoodToWeek Tests - Immutability
// ============================================================================

test('addFoodToWeek - does not mutate original array', () => {
  const originalFoods: WeeklyFoodInstance[] = [
    {
      instanceId: 'inst_1',
      foodId: 'spinach',
      foodName: 'Spinach',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date('2025-01-06'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-06'),
    },
  ];

  const originalLength = originalFoods.length;
  const originalFirstFood = originalFoods[0];

  const newFood = createMockFood({
    foodId: 'broccoli',
    foodName: 'Broccoli',
  });

  const result = addFoodToWeek(originalFoods, newFood);

  // Original array unchanged
  assert.strictEqual(originalFoods.length, originalLength);
  assert.strictEqual(originalFoods[0], originalFirstFood);
  
  // Result is a new array
  assert.notStrictEqual(result.foods, originalFoods);
  assert.strictEqual(result.foods.length, 2);
});

test('addFoodToWeek - duplicate rejection returns original reference', () => {
  const originalFoods: WeeklyFoodInstance[] = [
    {
      instanceId: 'inst_1',
      foodId: 'cabbage',
      foodName: 'Cabbage',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date('2025-01-06'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-06'),
    },
  ];

  const newFood = createMockFood({
    foodId: 'cabbage',
    color: FOOD_COLORS.GREEN,
    isFermented: false,
  });

  const result = addFoodToWeek(originalFoods, newFood);

  // Should return exact same reference when rejecting duplicate
  assert.strictEqual(result.foods, originalFoods);
});

// ============================================================================
// addFoodToWeek Tests - Array Order Preservation
// ============================================================================

test('addFoodToWeek - preserves order with new food appended at end', () => {
  const existingFoods: WeeklyFoodInstance[] = [
    {
      instanceId: 'inst_1',
      foodId: 'spinach',
      foodName: 'Spinach',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date('2025-01-06'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-06'),
    },
    {
      instanceId: 'inst_2',
      foodId: 'apple',
      foodName: 'Apple',
      category: FOOD_CATEGORIES.FRUITS,
      color: FOOD_COLORS.RED,
      isFermented: false,
      loggedDate: new Date('2025-01-07'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-07'),
    },
  ];

  const newFood = createMockFood({
    foodId: 'broccoli',
    foodName: 'Broccoli',
  });

  const result = addFoodToWeek(existingFoods, newFood);

  assert.strictEqual(result.foods[0].foodId, 'spinach');
  assert.strictEqual(result.foods[1].foodId, 'apple');
  assert.strictEqual(result.foods[2].foodId, 'broccoli');
});

// ============================================================================
// getUniqueFoodIds Tests
// ============================================================================

test('getUniqueFoodIds - empty array returns empty array', () => {
  const foods: WeeklyFoodInstance[] = [];
  const uniqueIds = getUniqueFoodIds(foods);
  
  assert.strictEqual(uniqueIds.length, 0);
});

test('getUniqueFoodIds - single food returns one id', () => {
  const foods: WeeklyFoodInstance[] = [
    {
      instanceId: 'inst_1',
      foodId: 'spinach',
      foodName: 'Spinach',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date('2025-01-06'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-06'),
    },
  ];
  
  const uniqueIds = getUniqueFoodIds(foods);
  
  assert.strictEqual(uniqueIds.length, 1);
  assert.ok(uniqueIds.includes('spinach'));
});

test('getUniqueFoodIds - multiple instances of same food returns one id', () => {
  const foods: WeeklyFoodInstance[] = [
    {
      instanceId: 'inst_1',
      foodId: 'cabbage',
      foodName: 'Cabbage',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date('2025-01-06'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-06'),
    },
    {
      instanceId: 'inst_2',
      foodId: 'cabbage',
      foodName: 'Cabbage',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.BLUE_PURPLE,
      isFermented: false,
      loggedDate: new Date('2025-01-07'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-06'),
    },
    {
      instanceId: 'inst_3',
      foodId: 'cabbage',
      foodName: 'Cabbage',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.WHITE_TAN,
      isFermented: true,
      loggedDate: new Date('2025-01-08'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-06'),
    },
  ];
  
  const uniqueIds = getUniqueFoodIds(foods);
  
  assert.strictEqual(uniqueIds.length, 1);
  assert.ok(uniqueIds.includes('cabbage'));
});

test('getUniqueFoodIds - mixed foods returns correct unique count', () => {
  const foods: WeeklyFoodInstance[] = [
    {
      instanceId: 'inst_1',
      foodId: 'cabbage',
      foodName: 'Cabbage',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date('2025-01-06'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-06'),
    },
    {
      instanceId: 'inst_2',
      foodId: 'spinach',
      foodName: 'Spinach',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date('2025-01-07'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-07'),
    },
    {
      instanceId: 'inst_3',
      foodId: 'cabbage',
      foodName: 'Cabbage',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.BLUE_PURPLE,
      isFermented: false,
      loggedDate: new Date('2025-01-08'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-06'),
    },
  ];
  
  const uniqueIds = getUniqueFoodIds(foods);
  
  assert.strictEqual(uniqueIds.length, 2);
  assert.ok(uniqueIds.includes('cabbage'));
  assert.ok(uniqueIds.includes('spinach'));
});

// ============================================================================
// hasFoodBeenLogged Tests
// ============================================================================

test('hasFoodBeenLogged - returns false for empty array', () => {
  const foods: WeeklyFoodInstance[] = [];
  assert.strictEqual(hasFoodBeenLogged(foods, 'spinach'), false);
});

test('hasFoodBeenLogged - returns true when food exists', () => {
  const foods: WeeklyFoodInstance[] = [
    {
      instanceId: 'inst_1',
      foodId: 'spinach',
      foodName: 'Spinach',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date('2025-01-06'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-06'),
    },
  ];
  
  assert.strictEqual(hasFoodBeenLogged(foods, 'spinach'), true);
});

test('hasFoodBeenLogged - returns false when food does not exist', () => {
  const foods: WeeklyFoodInstance[] = [
    {
      instanceId: 'inst_1',
      foodId: 'spinach',
      foodName: 'Spinach',
      category: FOOD_CATEGORIES.VEGETABLES,
      color: FOOD_COLORS.GREEN,
      isFermented: false,
      loggedDate: new Date('2025-01-06'),
      pointValue: 1,
      firstLoggedDate: new Date('2025-01-06'),
    },
  ];
  
  assert.strictEqual(hasFoodBeenLogged(foods, 'broccoli'), false);
});