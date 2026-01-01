// src/domain/weekly.ts
import { FoodCategory, FoodColor } from './types.js';
import * as crypto from 'node:crypto';

export interface WeeklyFoodInstance {
  instanceId: string;
  foodId: string;
  foodName: string;
  category: FoodCategory;
  color: FoodColor;
  isFermented: boolean;
  loggedDate: Date;
  pointValue: number;
  firstLoggedDate?: Date; // Date when this foodId was first logged this week
}

export interface AddFoodResult {
  foods: WeeklyFoodInstance[];
  isNewFood: boolean; // true if this foodId hasn't been logged before this week
  isDuplicateInstance: boolean; // true if exact same color/fermentation combo already exists
}

/**
 * Check if a food instance with the same foodId, color, and fermentation status already exists
 */
function isDuplicateInstance(
  existingFoods: WeeklyFoodInstance[],
  newFood: Omit<WeeklyFoodInstance, 'instanceId' | 'firstLoggedDate'>
): boolean {
  return existingFoods.some(
    food =>
      food.foodId === newFood.foodId &&
      food.color === newFood.color &&
      food.isFermented === newFood.isFermented
  );
}

/**
 * Get the first logged date for a given foodId from existing foods
 */
function getFirstLoggedDate(
  existingFoods: WeeklyFoodInstance[],
  foodId: string
): Date | undefined {
  const existingFood = existingFoods.find(food => food.foodId === foodId);
  return existingFood?.firstLoggedDate;
}

/**
 * Add a food instance to the weekly tracking, enforcing uniqueness rules
 * 
 * Rules:
 * - Each foodId can only contribute points once per week (tracked via firstLoggedDate)
 * - Users can log same foodId multiple times with different color/fermentation combos
 * - Duplicate instances (same foodId + color + fermentation) are rejected
 * - Original array is not mutated (pure function)
 * - Array order is preserved with new food appended at end
 * 
 * @param existingFoods - Current array of food instances for the week
 * @param newFood - New food instance to add (without instanceId and firstLoggedDate)
 * @returns Result object with updated foods array and metadata
 */
export function addFoodToWeek(
  existingFoods: WeeklyFoodInstance[],
  newFood: Omit<WeeklyFoodInstance, 'instanceId' | 'firstLoggedDate'>
): AddFoodResult {
  // Check if this exact instance already exists
  if (isDuplicateInstance(existingFoods, newFood)) {
    return {
      foods: existingFoods,
      isNewFood: false,
      isDuplicateInstance: true,
    };
  }

  // Check if this foodId has been logged before this week
  const firstLoggedDate = getFirstLoggedDate(existingFoods, newFood.foodId);
  const isNewFood = firstLoggedDate === undefined;

  // Create new instance with preserved or new firstLoggedDate
  const newInstance: WeeklyFoodInstance = {
    ...newFood,
    instanceId: crypto.randomUUID(),
    firstLoggedDate: firstLoggedDate || newFood.loggedDate,
  };

  // Return new array with new instance appended (preserves order)
  return {
    foods: [...existingFoods, newInstance],
    isNewFood,
    isDuplicateInstance: false,
  };
}

/**
 * Get array of unique foodIds from food instances
 * Used for calculating weekly points (only unique foods count)
 */
export function getUniqueFoodIds(foods: WeeklyFoodInstance[]): string[] {
  const uniqueIds = new Set<string>();
  
  foods.forEach(food => {
    uniqueIds.add(food.foodId);
  });
  
  return Array.from(uniqueIds);
}

/**
 * Check if a foodId has already been logged this week
 */
export function hasFoodBeenLogged(
  existingFoods: WeeklyFoodInstance[],
  foodId: string
): boolean {
  return existingFoods.some(food => food.foodId === foodId);
}