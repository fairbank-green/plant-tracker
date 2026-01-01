// src/domain/points.ts
import { FoodCategory, FOOD_CATEGORIES, CATEGORY_POINT_VALUES } from './types.js';

export interface FoodForPoints {
  foodId: string;
  category: FoodCategory;
}

/**
 * Get the point value for a given food category
 * @param category - The food category
 * @returns Point value (1 for standard categories, 0.25 for herbs/spices)
 */
export function getPointValue(category: FoodCategory): number {
  return CATEGORY_POINT_VALUES[category];
}

/**
 * Calculate total weekly points from an array of unique foods
 * Each food is assumed to be unique by foodId
 * @param foods - Array of foods with category information
 * @returns Total points (sum of all food point values)
 */
export function calculateWeeklyPoints(foods: FoodForPoints[]): number {
  return foods.reduce((total, food) => {
    return total + getPointValue(food.category);
  }, 0);
}

/**
 * Calculate category breakdown from an array of unique foods
 * @param foods - Array of foods with category information
 * @returns Object with point totals for each category
 */
export function calculateCategoryBreakdown(foods: FoodForPoints[]): Record<FoodCategory, number> {
  const breakdown: Record<FoodCategory, number> = {
    [FOOD_CATEGORIES.WHOLE_GRAINS]: 0,
    [FOOD_CATEGORIES.NUTS_SEEDS]: 0,
    [FOOD_CATEGORIES.FRUITS]: 0,
    [FOOD_CATEGORIES.VEGETABLES]: 0,
    [FOOD_CATEGORIES.LEGUMES]: 0,
    [FOOD_CATEGORIES.HERBS_SPICES]: 0,
  };

  foods.forEach(food => {
    breakdown[food.category] += getPointValue(food.category);
  });

  return breakdown;
}