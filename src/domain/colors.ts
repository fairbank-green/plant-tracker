// src/domain/colors.ts
import { FoodColor } from './types.js';

export interface FoodWithColor {
  color: FoodColor;
  loggedDate: Date;
}

/**
 * Calculate unique colors achieved across all foods in the week
 * @param foods - Array of foods with color information
 * @returns Array of unique colors (no duplicates)
 */
export function calculateWeeklyColors(foods: FoodWithColor[]): FoodColor[] {
  const uniqueColors = new Set<FoodColor>();
  
  foods.forEach(food => {
    uniqueColors.add(food.color);
  });
  
  return Array.from(uniqueColors);
}

/**
 * Calculate unique colors achieved on a specific date
 * @param foods - Array of foods with color and date information
 * @param date - The date to filter by (compared by day, ignoring time)
 * @returns Array of unique colors for that date
 */
export function calculateDailyColors(foods: FoodWithColor[], date: Date): FoodColor[] {
  // Compare dates by year, month, and day only (ignoring time and timezone)
  const targetYear = date.getFullYear();
  const targetMonth = date.getMonth();
  const targetDay = date.getDate();
  
  const uniqueColors = new Set<FoodColor>();
  
  foods.forEach(food => {
    const foodYear = food.loggedDate.getFullYear();
    const foodMonth = food.loggedDate.getMonth();
    const foodDay = food.loggedDate.getDate();
    
    if (foodYear === targetYear && foodMonth === targetMonth && foodDay === targetDay) {
      uniqueColors.add(food.color);
    }
  });
  
  return Array.from(uniqueColors);
}

/**
 * Check if all 6 rainbow colors have been achieved
 * @param colors - Array of achieved colors
 * @returns True if all 6 colors are present
 */
export function hasAllColors(colors: FoodColor[]): boolean {
  return colors.length === 6;
}

/**
 * Get missing colors from the 6 rainbow colors
 * @param achievedColors - Array of colors already achieved
 * @returns Array of colors not yet achieved
 */
export function getMissingColors(achievedColors: FoodColor[]): FoodColor[] {
  const allColors: FoodColor[] = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue_purple',
    'white_tan',
  ];
  
  const achievedSet = new Set(achievedColors);
  
  return allColors.filter(color => !achievedSet.has(color));
}